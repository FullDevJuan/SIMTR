import React, { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Albergue, Damnificado, EntregaAyuda } from "../../types";
import { BarChart, DonutChart, LineChart } from "../../components/ui/Charts";
import {
  MapPin,
  Users,
  Package,
  Activity,
  UserCheck,
  RefreshCw,
  PlusCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import styles from "./Dashboard.module.css";

interface AuditLog {
  id: string;
  created_at: string;
  tabla_afectada: string;
  operacion: "INSERT" | "UPDATE" | "DELETE" | string;
  ip_origen: string;
  usuarios?: {
    nombre_completo: string;
  };
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [albergues, setAlbergues] = useState<Albergue[]>([]);
  const [damnificados, setDamnificados] = useState<Damnificado[]>([]);
  const [ayudas, setAyudas] = useState<EntregaAyuda[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const fetchData = async () => {
    try {
      const [alberguesData, damnificadosData, ayudasData] = await Promise.all([
        apiFetch<Albergue[]>("/albergues"),
        apiFetch<Damnificado[]>("/damnificados"),
        apiFetch<EntregaAyuda[]>("/entregas_ayuda"),
      ]);

      setAlbergues(alberguesData);
      setDamnificados(damnificadosData);
      setAyudas(ayudasData);

      if (user?.rol === "ADMIN" || user?.rol === "OPERADOR") {
        const auditData = await apiFetch<AuditLog[]>("/audit");
        setAuditLogs(auditData.slice(0, 10));
      }
    } catch (error) {
      console.error("Error cargando estadísticas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // -------------------------------------------------------------
    // SUSCRIPCIONES EN TIEMPO REAL CON SUPABASE WEBSOCKETS
    // -------------------------------------------------------------
    const token = sessionStorage.getItem("access_token");
    if (token) {
      supabase.realtime.setAuth(token);
    }

    const channel = supabase
      .channel("simtr-realtime-dashboard")
      // 1. Escuchar cambios en Albergues
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "albergues" },
        (payload) => {
          console.log("[Realtime DB] Albergue cambiado:", payload);
          if (payload.eventType === "INSERT") {
            setAlbergues((prev) => [payload.new as Albergue, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setAlbergues((prev) =>
              prev.map((a) =>
                a.id === payload.new.id ? (payload.new as Albergue) : a,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setAlbergues((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        },
      )
      // 2. Escuchar cambios en Damnificados
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "damnificados" },
        (payload) => {
          console.log("[Realtime DB] Damnificado cambiado:", payload);
          if (payload.eventType === "INSERT") {
            setDamnificados((prev) => [payload.new as Damnificado, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setDamnificados((prev) =>
              prev.map((d) =>
                d.id === payload.new.id ? (payload.new as Damnificado) : d,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setDamnificados((prev) =>
              prev.filter((d) => d.id !== payload.old.id),
            );
          }
        },
      )
      // 3. Escuchar cambios en Entregas de Ayuda (re-fetch debido a joins complejos)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entregas_ayuda" },
        () => {
          console.log("[Realtime DB] Entrega de ayuda cambiada, recargando...");
          apiFetch<EntregaAyuda[]>("/entregas_ayuda")
            .then(setAyudas)
            .catch(console.error);
        },
      )
      // 4. Escuchar Auditorías (solo si rol administrador u operador para actualizar feed)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_log" },
        (payload) => {
          console.log("[Realtime DB] Nuevo Log de Auditoría:", payload);
          if (user?.rol === "ADMIN" || user?.rol === "OPERADOR") {
            // Recargar logs para resolver relaciones del usuario join
            apiFetch<AuditLog[]>("/audit")
              .then((data) => setAuditLogs(data.slice(0, 10)))
              .catch(console.error);
          }
        },
      )
      .subscribe((status) => {
        console.log("[Realtime DB] Estado de Suscripción:", status);
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setRealtimeStatus("disconnected");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading)
    return <div className={styles.loading}>Cargando panel de control...</div>;

  // Cálculos de métricas
  const totalEnAlbergue = damnificados.filter(
    (d) => d.estado_actual === "en_albergue",
  ).length;
  const totalSinUbicacion = damnificados.filter(
    (d) => d.estado_actual === "sin_ubicacion",
  ).length;
  const totalAyudasEntregadas = ayudas.filter(
    (a) => a.estado === "entregada",
  ).length;

  // Gráfica 1: Ocupación por albergue (BarChart)
  const barChartData = albergues.map((a) => ({
    label: a.nombre,
    value: a.capacidad_actual,
    maxValue: a.capacidad_maxima,
  }));

  // Gráfica 2: Estados de los Albergues (DonutChart)
  const statusCounts = albergues.reduce(
    (acc, curr) => {
      acc[curr.estado] = (acc[curr.estado] || 0) + 1;
      return acc;
    },
    { activo: 0, saturado: 0, cerrado: 0 } as Record<string, number>,
  );

  const albergueStatusData = [
    { label: "activo", value: statusCounts.activo, color: "#10b981" },
    { label: "saturado", value: statusCounts.saturado, color: "#f59e0b" },
    { label: "cerrado", value: statusCounts.cerrado, color: "#ef4444" },
  ];

  // Gráfica 3: Fuentes de Recursos de Ayudas (DonutChart)
  const resourceCounts = ayudas.reduce(
    (acc, curr) => {
      acc[curr.fuente_recurso] = (acc[curr.fuente_recurso] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const colors = [
    "#1f3965",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#6b7280",
  ];
  const resourceData = Object.entries(resourceCounts).map(
    ([label, value], i) => ({
      label: label.replace("_", " "),
      value,
      color: colors[i % colors.length],
    }),
  );

  // Gráfica 4: Historial de Ayudas (LineChart)
  const getDeliveriesHistory = () => {
    const groups: { [key: string]: number } = {};
    ayudas
      .filter((a) => a.estado === "entregada")
      .forEach((a) => {
        const dateStr = new Date(a.fecha_entrega).toLocaleDateString(
          undefined,
          {
            month: "short",
            day: "numeric",
          },
        );
        groups[dateStr] = (groups[dateStr] || 0) + 1;
      });

    return Object.entries(groups)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime())
      .slice(-7); // Últimos 7 días activos
  };

  const lineChartData = getDeliveriesHistory();

  // Helper para mostrar iconos de auditoría
  const renderAuditIcon = (op: string) => {
    switch (op) {
      case "INSERT":
        return <PlusCircle size={16} className={styles.iconInsert} />;
      case "UPDATE":
        return <Edit2 size={16} className={styles.iconUpdate} />;
      case "DELETE":
        return <Trash2 size={16} className={styles.iconDelete} />;
      default:
        return <Activity size={16} className={styles.iconDefault} />;
    }
  };

  const formatLogText = (log: AuditLog) => {
    const table = log.tabla_afectada.replace("_", " ");
    const operator = log.usuarios?.nombre_completo || "Sistema / Supabase";
    let action = "modificó un registro";

    if (log.operacion === "INSERT") action = "registró un nuevo elemento";
    if (log.operacion === "DELETE") action = "anuló/eliminó un registro";

    return (
      <span>
        <strong>{operator}</strong> {action} en <strong>{table}</strong>.
      </span>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header Principal */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel de Control SIMTR</h1>
          <p className={styles.subtitle}>Consola de Monitoreo en Tiempo Real</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Indicador de Conexión en Tiempo Real */}
          <div
            className={`${styles.connectionIndicator} ${
              realtimeStatus === "connected"
                ? styles.connected
                : realtimeStatus === "connecting"
                  ? styles.connecting
                  : styles.disconnected
            }`}
          >
            <span className={styles.pulseDot} />
            <span>
              {realtimeStatus === "connected"
                ? "Tiempo Real: Conectado"
                : realtimeStatus === "connecting"
                  ? "Conectando WebSocket..."
                  : "Desconectado (Reintentando)"}
            </span>
          </div>

          <button
            className={styles.refreshButton}
            onClick={fetchData}
            title="Forzar Recarga"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Grid de Contadores Principales */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#eff6ff" }}>
            <MapPin size={22} color="#2563eb" />
          </div>
          <div>
            <div className={styles.statTitle}>Albergues Activos</div>
            <div className={styles.statValue}>{albergues.length}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#ecfdf5" }}>
            <UserCheck size={22} color="#059669" />
          </div>
          <div>
            <div className={styles.statTitle}>Damnificados Refugiados</div>
            <div className={styles.statValue}>{totalEnAlbergue}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#fffbeb" }}>
            <Users size={22} color="#d97706" />
          </div>
          <div>
            <div className={styles.statTitle}>Sin Ubicación</div>
            <div className={styles.statValue}>{totalSinUbicacion}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#faf5ff" }}>
            <Package size={22} color="#7c3aed" />
          </div>
          <div>
            <div className={styles.statTitle}>Ayudas Entregadas</div>
            <div className={styles.statValue}>{totalAyudasEntregadas}</div>
          </div>
        </div>
      </div>

      {/* Layout de Contenido Principal (Gráficas + Audit) */}
      <div className={styles.dashboardLayout}>
        <div className={styles.chartsColumn}>
          {/* Fila superior de gráficas */}
          <div className={styles.chartsGrid}>
            <div style={{ gridColumn: "span 2" }}>
              <BarChart
                data={barChartData}
                title="Ocupación Real vs Capacidad de Albergues"
              />
            </div>
            <div>
              <DonutChart
                data={albergueStatusData}
                title="Estados de Albergues"
              />
            </div>
            <div>
              <DonutChart
                data={resourceData}
                title="Fuentes de Recursos (Ayudas)"
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <LineChart
                data={lineChartData}
                title="Historial Reciente de Ayudas Humanitarias Entregadas"
              />
            </div>
          </div>
        </div>

        {/* Panel Lateral: Auditoría en Tiempo Real */}
        {(user?.rol === "ADMIN" || user?.rol === "OPERADOR") && (
          <div className={styles.auditColumn}>
            <div className={styles.auditCard}>
              <div className={styles.auditHeader}>
                <h3 className={styles.auditTitle}>
                  <Activity
                    size={18}
                    style={{ color: "var(--color-primary)" }}
                  />
                  Auditoría en Vivo
                </h3>
                <span className={styles.liveBadge}>LIVE</span>
              </div>

              <div className={styles.auditList}>
                {auditLogs.length === 0 ? (
                  <div className={styles.emptyAudit}>
                    No hay actividades registradas aún.
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className={styles.auditItem}>
                      <div className={styles.auditIconContainer}>
                        {renderAuditIcon(log.operacion)}
                      </div>
                      <div className={styles.auditContent}>
                        <div className={styles.auditText}>
                          {formatLogText(log)}
                        </div>
                        <div className={styles.auditMeta}>
                          <span>
                            {new Date(log.created_at).toLocaleTimeString()}
                          </span>
                          <span style={{ margin: "0 4px" }}>•</span>
                          <span>IP: {log.ip_origen}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
