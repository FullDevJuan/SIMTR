import React, { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import type { Damnificado } from "../../types";
import { Table } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import styles from "./Damnificados.module.css";

export const Damnificados: React.FC = () => {
  const [damnificados, setDamnificados] = useState<Damnificado[]>([]);
  const [loading, setLoading] = useState(true);

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
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Registro de Damnificados</h1>
        <Button onClick={fetchData}>Actualizar Datos</Button>
      </div>

      {loading ? (
        <div>Cargando registros...</div>
      ) : (
        <Table columns={columns} data={damnificados} />
      )}
    </div>
  );
};
