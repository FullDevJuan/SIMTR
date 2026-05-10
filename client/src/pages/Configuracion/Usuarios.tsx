import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { User as Usuario } from "../../types";
import { Table } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { Select } from "../../components/Select/Select";
import styles from "./Usuarios.module.css";

export const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros de auditoría
  const [filterUsuario, setFilterUsuario] = useState("");
  const [filterOperacion, setFilterOperacion] = useState("");
  const [filterTabla, setFilterTabla] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userData, auditData] = await Promise.all([
        apiFetch<Usuario[]>("/usuarios"),
        apiFetch<any[]>("/audit")
      ]);
      setUsuarios(userData);
      setLogs(auditData);
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
      key: "auth_created_at",
      header: "Fecha Registro",
      render: (r: any) =>
        r.auth_created_at
          ? new Date(r.auth_created_at).toLocaleString()
          : "N/A",
    },
    {
      key: "auth_last_sign_in_at",
      header: "Último Acceso",
      render: (r: any) =>
        r.auth_last_sign_in_at
          ? new Date(r.auth_last_sign_in_at).toLocaleString()
          : "Nunca",
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

  const logColumns = [
    {
      key: "created_at",
      header: "Fecha y Hora",
      render: (r: any) => new Date(r.created_at).toLocaleString(),
    },
    {
      key: "usuario",
      header: "Usuario",
      render: (r: any) => r.usuarios?.nombre_completo || "Sistema / Público",
    },
    {
      key: "operacion",
      header: "Operación",
      render: (r: any) => (
        <span
          className={styles.badge}
          style={{
            background:
              r.operacion === "INSERT"
                ? "#d1fae5"
                : r.operacion === "UPDATE"
                  ? "#fef3c7"
                  : r.operacion === "DELETE"
                    ? "#fee2e2"
                    : "#f1f5f9",
            color:
              r.operacion === "INSERT"
                ? "#065f46"
                : r.operacion === "UPDATE"
                  ? "#92400e"
                  : r.operacion === "DELETE"
                    ? "#991b1b"
                    : "#475569",
          }}
        >
          {r.operacion}
        </span>
      ),
    },
    { key: "tabla_afectada", header: "Tabla" },
    { key: "registro_id", header: "ID Registro" },
    { key: "ip_origen", header: "IP Origen" },
  ];

  const filteredLogs = logs
    .filter((log) => {
      const userName = log.usuarios?.nombre_completo || "Sistema / Público";
      const matchUsuario = userName.toLowerCase().includes(filterUsuario.toLowerCase());
      const matchOperacion = filterOperacion === "" || log.operacion === filterOperacion;
      const matchTabla = filterTabla === "" || log.tabla_afectada.toLowerCase().includes(filterTabla.toLowerCase());
      return matchUsuario && matchOperacion && matchTabla;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

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

      <div style={{ marginTop: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <h2 className={styles.title} style={{ fontSize: '1.5rem', margin: 0 }}>Logs de Auditoría</h2>
        </div>
        
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <Input 
              placeholder="Buscar por usuario..." 
              value={filterUsuario} 
              onChange={(e) => setFilterUsuario(e.target.value)} 
            />
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <Select 
              value={filterOperacion}
              onChange={(e) => setFilterOperacion(e.target.value)}
              options={[
                { value: "", label: "Todas las operaciones" },
                { value: "INSERT", label: "INSERT" },
                { value: "UPDATE", label: "UPDATE" },
                { value: "DELETE", label: "DELETE" }
              ]}
            />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <Input 
              placeholder="Buscar por tabla..." 
              value={filterTabla} 
              onChange={(e) => setFilterTabla(e.target.value)} 
            />
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <Select 
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              options={[
                { value: "desc", label: "Más recientes primero" },
                { value: "asc", label: "Más antiguos primero" }
              ]}
            />
          </div>
        </div>

        {loading ? (
          <div>Cargando registros...</div>
        ) : (
          <Table columns={logColumns} data={filteredLogs} itemsPerPage={10} />
        )}
      </div>
    </div>
  );
};
