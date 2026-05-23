import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { Select } from "../../components/Select/Select";
import type { Damnificado, TipoAyuda, EntregaAyuda } from "../../types";
import styles from "./Ayudas.module.css";

export const AyudaForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [damnificados, setDamnificados] = useState<Damnificado[]>([]);
  const [tiposAyuda, setTiposAyuda] = useState<TipoAyuda[]>([]);

  const [formData, setFormData] = useState<Partial<EntregaAyuda>>({
    damnificado_id: "",
    tipo_ayuda_id: "",
    cantidad: 0,
    descripcion_detalle: "",
    fecha_entrega: new Date().toISOString().split("T")[0],
    fuente_recurso: "alcaldia",
    observaciones: "",
    estado: "entregada",
    motivo_anulacion: "",
  });

  useEffect(() => {
    fetchAuxData();
    if (isEdit) {
      fetchAyuda();
    }
  }, [id]);

  const fetchAuxData = async () => {
    try {
      const [d, t] = await Promise.all([
        apiFetch<Damnificado[]>("/damnificados"),
        apiFetch<TipoAyuda[]>("/tipos_ayuda"),
      ]);
      setDamnificados(d);
      setTiposAyuda(t);
    } catch (error) {
      console.error("Error fetching aux data", error);
    }
  };

  const fetchAyuda = async () => {
    try {
      const data = await apiFetch<EntregaAyuda>(`/entregas_ayuda/${id}`);
      setFormData({
        ...data,
        fecha_entrega: new Date(data.fecha_entrega).toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error fetching ayuda", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      damnificado_id: formData.damnificado_id,
      tipo_ayuda_id: formData.tipo_ayuda_id,
      cantidad: Number(formData.cantidad),
      descripcion_detalle: formData.descripcion_detalle,
      fecha_entrega: formData.fecha_entrega,
      fuente_recurso: formData.fuente_recurso,
      observaciones: formData.observaciones,
      estado: formData.estado,
      motivo_anulacion: formData.estado === "anulada" ? formData.motivo_anulacion : null,
    };

    try {
      if (isEdit) {
        await apiFetch(`/entregas_ayuda/${id}`, {
          method: "PATCH",
          data: payload,
        });
      } else {
        await apiFetch("/entregas_ayuda", {
          method: "POST",
          data: payload,
        });
      }
      navigate("/ayudas");
    } catch (error) {
      alert("Error al guardar: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEdit ? "Editar Entrega" : "Nueva Entrega de Ayuda"}
        </h1>
        <Button variant="secondary" onClick={() => navigate("/ayudas")}>
          Volver
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--color-surface)",
          padding: "2rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        <div style={{ gridColumn: "span 2" }}>
          <Select
            label="Damnificado"
            name="damnificado_id"
            value={formData.damnificado_id}
            onChange={handleChange}
            required
            options={damnificados.map((d) => ({
              value: d.id!,
              label: `${d.numero_documento} - ${d.nombres} ${d.apellidos}`,
            }))}
          />
        </div>

        <Select
          label="Tipo de Ayuda"
          name="tipo_ayuda_id"
          value={formData.tipo_ayuda_id}
          onChange={handleChange}
          required
          options={tiposAyuda.map((t) => ({
            value: t.id,
            label: `${t.nombre} (${t.unidad_medida})`,
          }))}
        />

        <Input
          label="Cantidad"
          name="cantidad"
          type="number"
          step="0.01"
          value={formData.cantidad}
          onChange={handleChange}
          required
        />

        <Select
          label="Fuente de Recurso"
          name="fuente_recurso"
          value={formData.fuente_recurso}
          onChange={handleChange}
          required
          options={[
            { value: "alcaldia", label: "Alcaldía" },
            { value: "gobernacion", label: "Gobernación" },
            { value: "cruz_roja", label: "Cruz Roja" },
            { value: "defensa_civil", label: "Defensa Civil" },
            { value: "ong", label: "ONG" },
            { value: "donacion_privada", label: "Donación Privada" },
            { value: "ungrd", label: "UNGRD" },
            { value: "otra", label: "Otra" },
          ]}
        />

        <Input
          label="Fecha de Entrega"
          name="fecha_entrega"
          type="date"
          value={formData.fecha_entrega}
          onChange={handleChange}
          required
        />

        <Select
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          required
          options={[
            { value: "entregada", label: "Entregada" },
            { value: "espera", label: "En Espera" },
            { value: "anulada", label: "Anulada" },
          ]}
        />

        {formData.estado === "anulada" && (
          <div style={{ gridColumn: "span 2" }}>
            <Input
              label="Motivo de Anulación"
              name="motivo_anulacion"
              value={formData.motivo_anulacion || ""}
              onChange={handleChange}
              placeholder="Escriba el motivo de la anulación..."
            />
          </div>
        )}

        <div style={{ gridColumn: "span 2" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Detalle de la Ayuda
          </label>
          <textarea
            name="descripcion_detalle"
            value={formData.descripcion_detalle || ""}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              minHeight: "100px",
              fontFamily: "inherit",
            }}
            placeholder="Descripción detallada de lo que se entrega..."
          />
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones || ""}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              minHeight: "80px",
              fontFamily: "inherit",
            }}
            placeholder="Notas adicionales..."
          />
        </div>

        <div
          style={{
            gridColumn: "span 2",
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
          }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/ayudas")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Guardando..."
              : isEdit
                ? "Actualizar"
                : "Registrar Entrega"}
          </Button>
        </div>
      </form>
    </div>
  );
};
