import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { Damnificado } from "../../types";
import { Table } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import { useAuth } from "../../lib/AuthContext";
import styles from "./Damnificados.module.css";

export const Damnificados: React.FC = () => {
  const [damnificados, setDamnificados] = useState<Damnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canEdit = user?.rol === "ADMIN" || user?.rol === "OPERADOR";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Damnificado[]>("/damnificados");
      setDamnificados(data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "numero_documento", header: "Documento" },
    {
      key: "nombres",
      header: "Nombres",
      render: (r: Damnificado) => `${r.nombres} ${r.apellidos}`,
    },
    { key: "barrio_afectado", header: "Barrio" },
    {
      key: "estado_actual",
      header: "Estado",
      render: (r: Damnificado) => {
        let bg = "#f3f4f6";
        let color = "#374151";
        let label = r.estado_actual;

        if (r.estado_actual === "en_albergue") {
          bg = "#d1fae5";
          color = "#065f46";
          label = "En Albergue";
        } else if (r.estado_actual === "sin_ubicacion") {
          bg = "#fee2e2";
          color = "#991b1b";
          label = "Sin Ubicación";
        } else if (r.estado_actual === "en_casa_familiar") {
          bg = "#dbeafe";
          color = "#1e40af";
          label = "Casa Familiar";
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
              textTransform: "uppercase"
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (r: Damnificado) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            onClick={() => navigate(`/damnificados/${r.id}`)}
          >
            Ver
          </Button>
          {canEdit && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/damnificados/${r.id}/editar`)}
            >
              Editar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Registro de Damnificados</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button variant="secondary" onClick={fetchData}>
            Actualizar
          </Button>
          {canEdit && (
            <Button onClick={() => navigate("/damnificados/nuevo")}>
              + Nuevo Damnificado
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div>Cargando registros...</div>
      ) : (
        <Table columns={columns} data={damnificados} />
      )}
    </div>
  );
};
