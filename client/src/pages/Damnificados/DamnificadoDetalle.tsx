import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { Damnificado, Albergue } from "../../types";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import { Table } from "../../components/Table/Table";
import styles from "./DamnificadoDetalle.module.css";

export const DamnificadoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [damnificado, setDamnificado] = useState<Damnificado | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [damniData, asigData, alberguesData] = await Promise.all([
          apiFetch<Damnificado>(`/damnificados/${id}`),
          apiFetch<any[]>("/asignaciones"),
          apiFetch<Albergue[]>("/albergues"),
        ]);

        setDamnificado(damniData);

        // Cruzar asignaciones con nombres de albergue
        const misAsignaciones = asigData
          .filter((a) => a.damnificado_id === id)
          .map((a) => {
            const alb = alberguesData.find((al) => al.id === a.albergue_id);
            return {
              ...a,
              albergue_nombre: alb ? alb.nombre : "Desconocido",
            };
          });

        setHistorial(misAsignaciones);
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Cargando detalle...</div>;
  if (!damnificado) return <div>No se encontró la información.</div>;

  return (
    <div>
      <div className={styles.headerActions}>
        <Button variant="secondary" onClick={() => navigate("/damnificados")}>
          Volver
        </Button>
        <Button
          onClick={() => navigate(`/damnificados/${damnificado.id}/editar`)}
        >
          Editar Información
        </Button>
      </div>

      <Card
        title={`Expediente: ${damnificado.nombres} ${damnificado.apellidos}`}
      >
        <div className={styles.grid}>
          <div className={styles.dataGroup}>
            <span className={styles.label}>Documento</span>
            <span className={styles.value}>
              {damnificado.tipo_documento.replace("_", " ").toUpperCase()}:{" "}
              {damnificado.numero_documento}
            </span>
          </div>

          <div className={styles.dataGroup}>
            <span className={styles.label}>Estado Actual</span>
            <span
              className={`${styles.badge} ${damnificado.estado_actual === "ALBERGADO" ? styles.badgeAlbergado : styles.badgeNormal}`}
            >
              {damnificado.estado_actual}
            </span>
          </div>

          <div className={styles.dataGroup}>
            <span className={styles.label}>Barrio Afectado</span>
            <span className={styles.value}>{damnificado.barrio_afectado}</span>
          </div>

          <div className={styles.dataGroup}>
            <span className={styles.label}>Total Miembros</span>
            <span className={styles.value}>
              {damnificado.total_miembros} personas
            </span>
          </div>

          <div className={styles.dataGroup}>
            <span className={styles.label}>Teléfono</span>
            <span className={styles.value}>
              {damnificado.telefono || "N/A"}
            </span>
          </div>

          <div className={styles.dataGroup}>
            <span className={styles.label}>Fecha Registro</span>
            <span className={styles.value}>
              {new Date(
                damnificado.fecha_nacimiento || "",
              ).toLocaleDateString() || "N/A"}
            </span>
          </div>
        </div>

        <div className={styles.historySection}>
          <h3 className={styles.historyTitle}>Historial de Albergues</h3>
          <Table
            columns={[
              { key: "albergue_nombre", header: "Albergue" },
              {
                key: "fecha_ingreso",
                header: "Fecha Ingreso",
                render: (r) => new Date(r.fecha_ingreso).toLocaleString(),
              },
              {
                key: "motivo_salida",
                header: "Detalle",
                render: (r) =>
                  r.fecha_salida
                    ? `Salió: ${r.motivo_salida || ""}`
                    : "Actualmente aquí",
              },
            ]}
            data={historial}
          />
        </div>
      </Card>
    </div>
  );
};
