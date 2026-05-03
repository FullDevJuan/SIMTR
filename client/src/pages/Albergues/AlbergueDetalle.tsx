import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
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
  const [damnificadosAsignados, setDamnificadosAsignados] = useState<Damnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const albergueData = await apiFetch<Albergue>(`/albergues/${id}`);
        setAlbergue(albergueData);

        const asignacionesData = await apiFetch<AsignacionAlbergue[]>('/asignaciones');
        const damnificadosData = await apiFetch<Damnificado[]>('/damnificados');
        
        const enEsteAlbergue = asignacionesData
            .filter(a => a.albergue_id === id && !a.fecha_salida)
            .map(a => damnificadosData.find(d => d.id === a.damnificado_id))
            .filter(d => d !== undefined) as Damnificado[];
            
        setDamnificadosAsignados(enEsteAlbergue);
      } catch (err: any) {
        setErrorMsg("Error al cargar el albergue: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  if (loading) return <div>Cargando detalles...</div>;
  if (errorMsg) return <div className={styles.errorAlert}>{errorMsg}</div>;
  if (!albergue) return <div>No se encontró el albergue</div>;

  const canEdit = user?.rol === "ADMIN" || user?.rol === "OPERADOR";

  return (
    <div className={styles.container}>
      <Card title="Expediente del Albergue">
        <div className={styles.detalleGrid}>
          <div className={styles.detalleItem}>
            <span className={styles.detalleLabel}>Nombre</span>
            <span className={styles.detalleValue}>{albergue.nombre}</span>
          </div>
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
            <span className={styles.detalleLabel}>Ocupación</span>
            <span className={styles.detalleValue}>
              {albergue.capacidad_actual} / {albergue.capacidad_maxima}
            </span>
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
                { key: 'acciones', header: '', render: (r) => (
                    <Button variant="secondary" onClick={() => navigate(`/damnificados/${r.id}`)}>Ver Ficha</Button>
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
