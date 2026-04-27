import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { Damnificado, Albergue } from "../../types";
import { Input } from "../../components/Input/Input";
import { Select } from "../../components/Select/Select";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import styles from "./DamnificadoForm.module.css";

interface FormData extends Damnificado {
  albergue_id?: string;
}

export const DamnificadoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [albergues, setAlbergues] = useState<Albergue[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const init = async () => {
      try {
        const alberguesData = await apiFetch<Albergue[]>("/albergues");
        setAlbergues(alberguesData);

        if (isEdit) {
          const damnificadoData = await apiFetch<Damnificado>(
            `/damnificados/${id}`,
          );
          // Buscar si tiene asignación activa para precargar el albergue
          const asignaciones = await apiFetch<any[]>("/asignaciones");
          const asignacionActiva = asignaciones.find(
            (a) => a.damnificado_id === id && !a.fecha_salida,
          );

          reset({
            ...damnificadoData,
            albergue_id: asignacionActiva ? asignacionActiva.albergue_id : "",
          });
        }
      } catch (error: any) {
        setErrorMsg("Error cargando datos: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setErrorMsg("");
    const { albergue_id, ...damnificadoPayload } = data;

    // Convert numbers explicitly
    damnificadoPayload.total_miembros =
      Number(damnificadoPayload.total_miembros) || 1;

    try {
      let savedDamnificadoId = id;

      if (isEdit) {
        await apiFetch(`/damnificados/${id}`, {
          method: "PATCH",
          data: damnificadoPayload,
        });
      } else {
        const res = await apiFetch<Damnificado>("/damnificados", {
          method: "POST",
          data: damnificadoPayload,
        });
        savedDamnificadoId = res.id;
      }

      // Si se seleccionó un albergue, crear la asignación
      if (albergue_id && savedDamnificadoId) {
        // Obtenemos asignaciones previas si es edición
        let createAsignacion = false;
        if (isEdit) {
          const asignaciones = await apiFetch<any[]>("/asignaciones");
          const asignacionActiva = asignaciones.find(
            (a) => a.damnificado_id === savedDamnificadoId && !a.fecha_salida,
          );
          if (
            !asignacionActiva ||
            asignacionActiva.albergue_id !== albergue_id
          ) {
            createAsignacion = true; // Si no tenía o es distinto, creamos nueva.
          }
        } else {
          createAsignacion = true;
        }

        if (createAsignacion) {
          await apiFetch("/asignaciones", {
            method: "POST",
            data: {
              damnificado_id: savedDamnificadoId,
              albergue_id: albergue_id,
            },
          });
        }
      }

      navigate("/damnificados");
    } catch (error: any) {
      setErrorMsg(error.message || "Ocurrió un error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando información...</div>;

  return (
    <div>
      <Card
        title={isEdit ? "Editar Damnificado" : "Registrar Nuevo Damnificado"}
      >
        {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGrid}>
            <div className={styles.sectionTitle}>Información Personal</div>

            <Input
              label="Nombres"
              {...register("nombres", { required: "Obligatorio" })}
              error={errors.nombres?.message}
            />
            <Input
              label="Apellidos"
              {...register("apellidos", { required: "Obligatorio" })}
              error={errors.apellidos?.message}
            />

            <Select
              label="Tipo Documento"
              {...register("tipo_documento", { required: "Obligatorio" })}
              error={errors.tipo_documento?.message}
              options={[
                { value: "cedula_ciudadania", label: "Cédula de Ciudadanía" },
                { value: "cedula_extranjeria", label: "Cédula de Extranjería" },
                { value: "pasaporte", label: "Pasaporte" },
                { value: "tarjeta_identidad", label: "Tarjeta de Identidad" },
                { value: "registro_civil", label: "Registro Civil" },
                { value: "sin_documento", label: "Sin Documento" },
              ]}
            />
            <Input
              label="Número Documento"
              {...register("numero_documento", { required: "Obligatorio" })}
              error={errors.numero_documento?.message}
            />

            <Select
              label="Género"
              {...register("genero", { required: "Obligatorio" })}
              error={errors.genero?.message}
              options={[
                { value: "masculino", label: "Masculino" },
                { value: "femenino", label: "Femenino" },
              ]}
            />
            <Input
              label="Fecha de Nacimiento"
              type="date"
              {...register("fecha_nacimiento")}
            />

            <Input label="Teléfono" {...register("telefono")} />

            <div className={styles.sectionTitle}>Afectación y Estado</div>

            <Input
              label="Barrio Afectado"
              {...register("barrio_afectado", { required: "Obligatorio" })}
              error={errors.barrio_afectado?.message}
              className={styles.fullWidth}
            />

            <Input
              label="Total Miembros Familia"
              type="number"
              min="1"
              {...register("total_miembros", { required: "Obligatorio" })}
              error={errors.total_miembros?.message}
            />

            <Select
              label="Estado Actual"
              {...register("estado_actual", { required: "Obligatorio" })}
              error={errors.estado_actual?.message}
              options={[
                { value: "sin_ubicacion", label: "Sin ubicación" },
                { value: "en_albergue", label: "En albergue" },
                {
                  value: "en_casa_familiar",
                  label: "En casa familiar / Arrendador",
                },
              ]}
            />

            <div className={styles.sectionTitle}>
              Asignación de Albergue (Opcional)
            </div>

            <Select
              label="Seleccionar Albergue"
              className={styles.fullWidth}
              {...register("albergue_id")}
              options={albergues.map((a) => ({
                value: a.id,
                label: `${a.nombre} (Capacidad: ${a.capacidad_actual}/${a.capacidad_maxima})`,
              }))}
            />
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/damnificados")}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Datos"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
