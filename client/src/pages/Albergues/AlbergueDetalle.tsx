import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { supabase } from "../../lib/supabase";
import type { Albergue, AsignacionAlbergue, Damnificado } from "../../types";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import { Table } from "../../components/Table/Table";
import { useAuth } from "../../lib/AuthContext";
import styles from "./Albergues.module.css";

export const AlbergueDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [albergue, setAlbergue] = useState<Albergue | null>(null);
  const [damnificadosAsignados, setDamnificadosAsignados] = useState<(Damnificado & { asignacion_id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useAuth();

  const fetchDetalle = useCallback(async () => {
    try {
      const albergueData = await apiFetch<Albergue>(`/albergues/${id}`);
      setAlbergue(albergueData);

      const asignacionesData = await apiFetch<AsignacionAlbergue[]>('/asignaciones');
      const damnificadosData = await apiFetch<Damnificado[]>('/damnificados');
      
      const enEsteAlbergue = asignacionesData
          .filter(a => a.albergue_id === id && !a.fecha_salida)
          .map(a => {
            const d = damnificadosData.find(d => d.id === a.damnificado_id);
            if (d) return { ...d, asignacion_id: a.id! };
            return null;
          })
          .filter(item => item !== null) as (Damnificado & { asignacion_id: string })[];
          
      setDamnificadosAsignados(enEsteAlbergue);
    } catch (err: any) {
      setErrorMsg("Error al cargar el albergue: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetalle();

    // -------------------------------------------------------------
    // Suscripción en Tiempo Real para este Albergue y Asignaciones
    // -------------------------------------------------------------
    const token = sessionStorage.getItem("access_token");
    if (token) {
      supabase.realtime.setAuth(token);
    }

    const channel = supabase
      .channel(`albergue-detalle-${id}`)
      // Escuchar cambios en la tabla albergues para este ID
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "albergues", filter: `id=eq.${id}` },
        (payload) => {
          console.log("[Realtime Detalle] Albergue actualizado:", payload.new);
          setAlbergue(payload.new as Albergue);
        }
      )
      // Escuchar cambios en la tabla asignaciones_albergue
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "asignaciones_albergue" },
        (payload) => {
          console.log("[Realtime Detalle] Asignación cambiada, recargando...", payload);
          fetchDetalle();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchDetalle]);

  if (loading) return <div>Cargando detalles...</div>;
  if (errorMsg) return <div className={styles.errorAlert}>{errorMsg}</div>;
  if (!albergue) return <div>No se encontró el albergue</div>;

  const canEdit = user?.rol === "ADMIN" || user?.rol === "OPERADOR";

  const handleRemoveDamnificado = async (asignacionId: string) => {
    if (!asignacionId) {
      alert("Error: ID de asignación no encontrado.");
      return;
    }
    
    if (!window.confirm('¿Está seguro de que desea quitar a este damnificado del albergue?')) return;
    
    try {
      console.log('Borrando asignación:', asignacionId);
      const res = await apiFetch<any>(`/asignaciones/${asignacionId}`, { method: 'DELETE' });
      console.log('Respuesta borrado:', res);
      
      // Actualizar datos locales sin forzar un reload completo de la pestaña
      fetchDetalle();
      
    } catch (err: any) {
      console.error('Error al borrar:', err);
      alert("Error al quitar damnificado: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="Expediente del Albergue">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          {(() => {
            const percentage = Math.min(100, Math.round((albergue.capacidad_actual / albergue.capacidad_maxima) * 100));
            let color = "#10b981"; // green
            if (percentage >= 100) color = "#ef4444"; // red
            else if (percentage >= 80) color = "#f59e0b"; // yellow
            
            const radius = 36;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percentage / 100) * circumference;

            return (
              <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="none" />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                  {percentage}%
                </div>
              </div>
            );
          })()}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)', margin: '0 0 0.5rem 0' }}>{albergue.nombre}</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Ocupación: {albergue.capacidad_actual} de {albergue.capacidad_maxima} personas
            </span>
          </div>
        </div>

        <div className={styles.detalleGrid}>
          <div className={styles.detalleItem}>
            <span className={styles.detalleLabel}>Tipo</span>
            <span
              className={styles.detalleValue}
              style={{ textTransform: "capitalize" }}
            >
              {albergue.tipo.replace("_", " ")}
            </span>
          </div>
          <div className={styles.detalleItem}>
            <span className={styles.detalleLabel}>Dirección</span>
            <span className={styles.detalleValue}>{albergue.direccion}</span>
          </div>
          <div className={styles.detalleItem}>
            <span className={styles.detalleLabel}>Barrio</span>
            <span className={styles.detalleValue}>{albergue.barrio}</span>
          </div>

          <div className={styles.detalleItem}>
            <span className={styles.detalleLabel}>Estado</span>
            <span className={styles.detalleValue}>
              <span
                className={styles.badge}
                style={{
                  background:
                    albergue.estado === "activo"
                      ? "#d1fae5"
                      : albergue.estado === "saturado"
                        ? "#fef3c7"
                        : "#fee2e2",
                  color:
                    albergue.estado === "activo"
                      ? "#065f46"
                      : albergue.estado === "saturado"
                        ? "#92400e"
                        : "#991b1b",
                  textTransform: "uppercase",
                }}
              >
                {albergue.estado}
              </span>
            </span>
          </div>
          {albergue.condiciones_sanitarias && (
            <div
              className={styles.detalleItem}
              style={{ gridColumn: "1 / -1" }}
            >
              <span className={styles.detalleLabel}>
                Condiciones Sanitarias
              </span>
              <span className={styles.detalleValue}>
                {albergue.condiciones_sanitarias}
              </span>
            </div>
          )}
          {albergue.fecha_apertura && (
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Fecha de Apertura</span>
              <span className={styles.detalleValue}>
                {new Date(albergue.fecha_apertura).toLocaleDateString()}
              </span>
            </div>
          )}
          {albergue.fecha_cierre && (
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Fecha de Cierre</span>
              <span className={styles.detalleValue}>
                {new Date(albergue.fecha_cierre).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate("/albergues")}>
            Volver
          </Button>
          {canEdit && (
            <Button
              onClick={() => navigate(`/albergues/${albergue.id}/editar`)}
            >
              Editar Datos
            </Button>
          )}
        </div>
      </Card>

      <div style={{ marginTop: '2rem' }}>
        <Card title="Damnificados Asignados">
          {damnificadosAsignados.length > 0 ? (
            <Table 
              data={damnificadosAsignados} 
              columns={[
                { key: 'numero_documento', header: 'Documento' },
                { key: 'nombres', header: 'Nombre Completo', render: (r) => `${r.nombres} ${r.apellidos}` },
                { key: 'estado_actual', header: 'Estado', render: (r) => (
                    <span className={styles.badge} style={{
                      background: r.estado_actual === 'en_albergue' ? '#d1fae5' : '#f3f4f6',
                      color: r.estado_actual === 'en_albergue' ? '#065f46' : '#374151'
                    }}>
                      {r.estado_actual.replace('_', ' ')}
                    </span>
                )},
                { key: 'acciones', header: 'Acciones', render: (r) => (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="secondary" onClick={() => navigate(`/damnificados/${r.id}`)}>Ver Ficha</Button>
                      {canEdit && (
                        <Button variant="secondary" style={{ color: 'var(--color-danger)' }} onClick={() => handleRemoveDamnificado(r.asignacion_id)}>
                          Quitar
                        </Button>
                      )}
                    </div>
                )}
              ]}
            />
          ) : (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              No hay damnificados asignados actualmente a este albergue.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
