import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { Button } from "../../components/Button/Button";
import type { EntregaAyuda } from "../../types";
import { Package, User, Tag, Info, AlertCircle } from "lucide-react";
import styles from "./Ayudas.module.css";

export const AyudaDetalle: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ayuda, setAyuda] = useState<EntregaAyuda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAyuda();
  }, [id]);

  const fetchAyuda = async () => {
    try {
      const data = await apiFetch<EntregaAyuda>(`/entregas_ayuda/${id}`);
      setAyuda(data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando detalle...</div>;
  if (!ayuda) return <div>No se encontró el registro.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ficha Técnica de Entrega</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button variant="secondary" onClick={() => navigate("/ayudas")}>
            Volver
          </Button>
          <Button onClick={() => navigate(`/ayudas/${id}/editar`)}>
            Editar
          </Button>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        {/* Info Principal */}
        <div
          style={{
            background: "var(--color-surface)",
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Package size={20} color="var(--color-primary)" /> Datos de la
            Entrega
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <DetailItem
              label="Tipo de Ayuda"
              value={ayuda.tipos_ayuda?.nombre}
            />
            <DetailItem
              label="Cantidad"
              value={`${ayuda.cantidad} ${ayuda.tipos_ayuda?.unidad_medida}`}
            />
            <DetailItem
              label="Fuente de Recurso"
              value={ayuda.fuente_recurso.toUpperCase()}
            />
            <DetailItem
              label="Fecha de Entrega"
              value={new Date(ayuda.fecha_entrega).toLocaleDateString()}
            />
            <DetailItem
              label="Estado"
              value={ayuda.estado.toUpperCase()}
              color={
                ayuda.estado === "entregada"
                  ? "#065f46"
                  : ayuda.estado === "anulada"
                    ? "#991b1b"
                    : "#92400e"
              }
            />
          </div>
        </div>

        {/* Info Damnificado */}
        <div
          style={{
            background: "var(--color-surface)",
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <User size={20} color="var(--color-primary)" /> Beneficiario
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <DetailItem
              label="Nombre Completo"
              value={`${ayuda.damnificados?.nombres} ${ayuda.damnificados?.apellidos}`}
            />
            <DetailItem
              label="Documento"
              value={ayuda.damnificados?.numero_documento}
            />
            <DetailItem
              label="Barrio Afectado"
              value={ayuda.damnificados?.barrio_afectado}
            />
          </div>
        </div>

        {/* Detalles Adicionales */}
        <div
          style={{
            gridColumn: "span 2",
            background: "var(--color-surface)",
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Info size={18} /> Descripción del Detalle
              </h3>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {ayuda.descripcion_detalle || "Sin descripción adicional."}
              </p>
            </div>
            <div>
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Tag size={18} /> Observaciones
              </h3>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {ayuda.observaciones || "Sin observaciones."}
              </p>
            </div>
          </div>

          {ayuda.estado === "anulada" && (
            <div
              style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-md)",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  color: "#991b1b",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <AlertCircle size={18} /> Motivo de Anulación
              </h3>
              <p style={{ color: "#b91c1c" }}>{ayuda.motivo_anulacion}</p>
            </div>
          )}
        </div>

        <div
          style={{
            gridColumn: "span 2",
            textAlign: "right",
            color: "var(--color-text-muted)",
            fontSize: "0.75rem",
          }}
        >
          Registrado por: {ayuda.usuarios?.nombre_completo} | ID Registro:{" "}
          {ayuda.id}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: any;
  color?: string;
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      borderBottom: "1px solid var(--color-border)",
      paddingBottom: "0.5rem",
    }}
  >
    <span style={{ fontWeight: 500, color: "var(--color-text-muted)" }}>
      {label}:
    </span>
    <span style={{ fontWeight: 600, color: color || "var(--color-text-main)" }}>
      {value || "---"}
    </span>
  </div>
);
