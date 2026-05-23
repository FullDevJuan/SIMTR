import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { EntregaAyuda } from "../../types";
import { Table } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { Select } from "../../components/Select/Select";
import { useAuth } from "../../lib/AuthContext";
import { Package, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import styles from "./Ayudas.module.css";

export const Ayudas: React.FC = () => {
  const [ayudas, setAyudas] = useState<EntregaAyuda[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterDamnificado, setFilterDamnificado] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterFuente, setFilterFuente] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  const canEdit = user?.rol === "ADMIN" || user?.rol === "OPERADOR";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<EntregaAyuda[]>("/entregas_ayuda");
      setAyudas(data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "damnificado",
      header: "Damnificado",
      render: (r: EntregaAyuda) =>
        r.damnificados
          ? `${r.damnificados.nombres} ${r.damnificados.apellidos}`
          : "N/A",
    },
    {
      key: "ayuda",
      header: "Tipo de Ayuda",
      render: (r: EntregaAyuda) =>
        r.tipos_ayuda ? r.tipos_ayuda.nombre : "N/A",
    },
    {
      key: "cantidad",
      header: "Cantidad",
      render: (r: EntregaAyuda) =>
        `${r.cantidad} ${r.tipos_ayuda?.unidad_medida || ""}`,
    },
    {
      key: "fuente_recurso",
      header: "Fuente",
      render: (r: EntregaAyuda) => r.fuente_recurso.toUpperCase(),
    },
    {
      key: "estado",
      header: "Estado",
      render: (r: EntregaAyuda) => {
        let bg = "#f3f4f6";
        let color = "#374151";
        if (r.estado === "entregada") {
          bg = "#d1fae5";
          color = "#065f46";
        } else if (r.estado === "anulada") {
          bg = "#fee2e2";
          color = "#991b1b";
        } else if (r.estado === "espera") {
          bg = "#fef3c7";
          color = "#92400e";
        }

        return (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              background: bg,
              color: color,
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {r.estado}
          </span>
        );
      },
    },
    {
      key: "fecha_entrega",
      header: "Fecha",
      render: (r: EntregaAyuda) =>
        new Date(r.fecha_entrega).toLocaleDateString(),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (r: EntregaAyuda) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            onClick={() => navigate(`/ayudas/${r.id}`)}
          >
            Ver
          </Button>
          {canEdit && r.estado !== "anulada" && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/ayudas/${r.id}/editar`)}
            >
              Editar
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filteredAyudas = ayudas.filter((a) => {
    const matchDamnificado =
      `${a.damnificados?.nombres} ${a.damnificados?.apellidos} ${a.damnificados?.numero_documento}`
        .toLowerCase()
        .includes(filterDamnificado.toLowerCase());
    const matchEstado = filterEstado === "" || a.estado === filterEstado;
    const matchFuente =
      filterFuente === "" || a.fuente_recurso === filterFuente;

    return matchDamnificado && matchEstado && matchFuente;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Ayudas Humanitarias</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button variant="secondary" onClick={fetchData}>
            Actualizar
          </Button>
          {canEdit && (
            <Button onClick={() => navigate("/ayudas/nuevo")}>
              + Registrar Ayuda
            </Button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "var(--color-surface)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#f3f4f6",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package size={24} color="#4b5563" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flex: 1,
            }}
          >
            <div
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Total Ayudas
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--color-text-main)",
                lineHeight: 1.2,
              }}
            >
              {ayudas.length}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--color-surface)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#d1fae5",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={24} color="#065f46" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flex: 1,
            }}
          >
            <div
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Entregadas
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#065f46",
                lineHeight: 1.2,
              }}
            >
              {ayudas.filter((a) => a.estado === "entregada").length}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--color-surface)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#fef3c7",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={24} color="#92400e" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flex: 1,
            }}
          >
            <div
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              En Espera
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#92400e",
                lineHeight: 1.2,
              }}
            >
              {ayudas.filter((a) => a.estado === "espera").length}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--color-surface)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#fee2e2",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={24} color="#991b1b" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flex: 1,
            }}
          >
            <div
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Anuladas
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#991b1b",
                lineHeight: 1.2,
              }}
            >
              {ayudas.filter((a) => a.estado === "anulada").length}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "250px" }}>
          <Input
            placeholder="Buscar por damnificado o documento..."
            value={filterDamnificado}
            onChange={(e) => setFilterDamnificado(e.target.value)}
          />
        </div>
        <div style={{ flex: 1, minWidth: "150px" }}>
          <Select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            options={[
              { value: "", label: "Todos los estados" },
              { value: "entregada", label: "Entregada" },
              { value: "espera", label: "En Espera" },
              { value: "anulada", label: "Anulada" },
            ]}
          />
        </div>
        <div style={{ flex: 1, minWidth: "150px" }}>
          <Select
            value={filterFuente}
            onChange={(e) => setFilterFuente(e.target.value)}
            options={[
              { value: "", label: "Todas las fuentes" },
              { value: "alcaldia", label: "Alcaldía" },
              { value: "gobernacion", label: "Gobernación" },
              { value: "cruz_roja", label: "Cruz Roja" },
              { value: "defensa_civil", label: "Defensa Civil" },
              { value: "ong", label: "ONG" },
              { value: "donacion_privada", label: "Donación Privada" },
              { value: "ungrd", label: "UNGRD" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div>Cargando registros...</div>
      ) : (
        <Table columns={columns} data={filteredAyudas} itemsPerPage={10} />
      )}
    </div>
  );
};
