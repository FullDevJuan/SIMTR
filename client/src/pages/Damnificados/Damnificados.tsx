import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { Damnificado } from "../../types";
import { Table } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import styles from "./Damnificados.module.css";

export const Damnificados: React.FC = () => {
  const [damnificados, setDamnificados] = useState<Damnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      render: (r: Damnificado) => (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            background: r.estado_actual === "ALBERGADO" ? "#d1fae5" : "#fef3c7",
            color: r.estado_actual === "ALBERGADO" ? "#065f46" : "#92400e",
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          {r.estado_actual}
        </span>
      ),
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
          <Button
            variant="secondary"
            onClick={() => navigate(`/damnificados/${r.id}/editar`)}
          >
            Editar
          </Button>
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
          <Button onClick={() => navigate("/damnificados/nuevo")}>
            + Nuevo Damnificado
          </Button>
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
