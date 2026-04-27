import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { Usuario } from "../../types";
import { Input } from "../../components/Input/Input";
import { Select } from "../../components/Select/Select";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import styles from "./Usuarios.module.css";

interface FormData extends Omit<Usuario, "id" | "auth_user_id" | "created_at"> {
  email?: string;
  password?: string;
  activoStr?: string;
}

export const UsuarioForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
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
      if (isEdit) {
        try {
          const usuarioData = await apiFetch<Usuario>(`/usuarios/${id}`);
          reset({
            nombre_completo: usuarioData.nombre_completo,
            telefono: usuarioData.telefono,
            rol: usuarioData.rol,
            activoStr: usuarioData.activo ? "true" : "false",
          });
        } catch (error: any) {
          setErrorMsg("Error cargando datos: " + error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setErrorMsg("");

    try {
      if (isEdit) {
        const payload = {
          nombre_completo: data.nombre_completo,
          telefono: data.telefono,
          rol: data.rol,
          activo: data.activoStr === "true",
        };
        await apiFetch(`/usuarios/${id}`, {
          method: "PATCH",
          data: payload,
        });
      } else {
        const payload = {
          email: data.email,
          password: data.password,
          nombre_completo: data.nombre_completo,
          telefono: data.telefono,
          rol: data.rol,
        };
        await apiFetch("/auth/register", {
          method: "POST",
          data: payload,
        });
      }
      navigate("/configuracion/usuarios");
    } catch (error: any) {
      setErrorMsg(error.message || "Ocurrió un error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando información...</div>;

  return (
    <div>
      <Card title={isEdit ? "Editar Usuario" : "Registrar Nuevo Usuario"}>
        {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGrid}>
            <div className={styles.sectionTitle}>Datos del Perfil</div>

            <Input
              label="Nombre Completo"
              {...register("nombre_completo", { required: "Obligatorio" })}
              error={errors.nombre_completo?.message}
            />

            <Input label="Teléfono" {...register("telefono")} />

            <Select
              label="Rol del Sistema"
              {...register("rol", { required: "Obligatorio" })}
              error={errors.rol?.message}
              options={[
                { value: "ADMIN", label: "Administrador" },
                { value: "OPERADOR", label: "Operador" },
                { value: "VISUALIZADOR", label: "Visualizador" },
              ]}
            />

            {isEdit && (
              <Select
                label="Estado de la Cuenta"
                {...register("activoStr")}
                options={[
                  { value: "true", label: "ACTIVA" },
                  { value: "false", label: "SUSPENDIDA" },
                ]}
              />
            )}

            {!isEdit && (
              <>
                <div className={styles.sectionTitle}>
                  Credenciales de Acceso
                </div>

                <Input
                  label="Correo Electrónico"
                  type="email"
                  {...register("email", { required: "Obligatorio" })}
                  error={errors.email?.message}
                />

                <Input
                  label="Contraseña Temporal"
                  type="password"
                  {...register("password", {
                    required: "Obligatorio",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                  })}
                  error={errors.password?.message}
                />
              </>
            )}
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/configuracion/usuarios")}
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
