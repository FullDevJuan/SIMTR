import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { User as Usuario } from "../../types";
import { Table } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import styles from "./Usuarios.module.css";

export const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Usuario[]>("/usuarios");
      setUsuarios(data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "nombre_completo", header: "Nombre" },
    {
      key: "rol",
      header: "Rol",
      render: (r: Usuario) => (
        <span
          className={styles.badge}
          style={{
            background:
              r.rol === "ADMIN"
                ? "#d1fae5"
                : r.rol === "OPERADOR"
                  ? "#dbeafe"
                  : "#f1f5f9",
            color:
              r.rol === "ADMIN"
                ? "#065f46"
                : r.rol === "OPERADOR"
                  ? "#1e40af"
                  : "#475569",
          }}
        >
          {r.rol}
        </span>
      ),
    },
    { key: "telefono", header: "Teléfono" },
    {
      key: "activo",
      header: "Estado",
      render: (r: Usuario) => (
        <span
          className={styles.badge}
          style={{
            background: r.activo ? "#d1fae5" : "#fee2e2",
            color: r.activo ? "#065f46" : "#991b1b",
          }}
        >
          {r.activo ? "ACTIVO" : "SUSPENDIDO"}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (r: Usuario) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            onClick={() => navigate(`/configuracion/usuarios/${r.id}/editar`)}
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
        <h1 className={styles.title}>Gestión de Usuarios</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button variant="secondary" onClick={fetchData}>
            Actualizar
          </Button>
          <Button onClick={() => navigate("/configuracion/usuarios/nuevo")}>
            + Nuevo Usuario
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Cargando registros...</div>
      ) : (
        <Table columns={columns} data={usuarios} />
      )}
    </div>
  );
};
