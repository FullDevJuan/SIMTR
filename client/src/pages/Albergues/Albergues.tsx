import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { Albergue } from "../../types";
import { Table } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import { useAuth } from "../../lib/AuthContext";
import styles from "./Albergues.module.css";

export const Albergues: React.FC = () => {
  const [albergues, setAlbergues] = useState<Albergue[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Albergue[]>("/albergues");
      setAlbergues(data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.rol === "ADMIN" || user?.rol === "OPERADOR";

  const columns = [
    { key: "nombre", header: "Nombre" },
    { key: "direccion", header: "Dirección" },
    {
      key: "capacidad",
      header: "Ocupación",
      render: (r: Albergue) => `${r.capacidad_actual} / ${r.capacidad_maxima}`,
    },
    {
      key: "estado",
      header: "Estado",
      render: (r: Albergue) => (
        <span
          className={styles.badge}
          style={{
            background:
              r.estado === "activo"
                ? "#d1fae5"
                : r.estado === "saturado"
                  ? "#fef3c7"
                  : "#fee2e2",
            color:
              r.estado === "activo"
                ? "#065f46"
                : r.estado === "saturado"
                  ? "#92400e"
                  : "#991b1b",
            textTransform: "uppercase",
          }}
        >
          {r.estado}
        </span>
      ),
    },
  ];

  if (canEdit) {
    columns.push({
      key: "acciones",
      header: "Acciones",
      render: (r: Albergue) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            onClick={() => navigate(`/albergues/${r.id}`)}
          >
            Ver
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/albergues/${r.id}/editar`)}
          >
            Editar
          </Button>
        </div>
      ),
    });
  } else {
    columns.push({
      key: "acciones",
      header: "Acciones",
      render: (r: Albergue) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            onClick={() => navigate(`/albergues/${r.id}`)}
          >
            Ver
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Albergues</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button variant="secondary" onClick={fetchData}>
            Actualizar
          </Button>
          {canEdit && (
            <Button onClick={() => navigate("/albergues/nuevo")}>
              + Nuevo Albergue
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div>Cargando registros...</div>
      ) : (
        <Table columns={columns} data={albergues} />
      )}
    </div>
  );
};
