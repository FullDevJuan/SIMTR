import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { Damnificado } from "../../types";
import { Table } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { Select } from "../../components/Select/Select";
import { useAuth } from "../../lib/AuthContext";
import styles from "./Damnificados.module.css";

export const Damnificados: React.FC = () => {
  const [damnificados, setDamnificados] = useState<Damnificado[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [filterNombre, setFilterNombre] = useState("");
  const [filterDocumento, setFilterDocumento] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterBarrio, setFilterBarrio] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  const canEdit = user?.rol === "ADMIN" || user?.rol === "OPERADOR";

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
      render: (r: Damnificado) => {
        let bg = "#f3f4f6";
        let color = "#374151";
        let label = r.estado_actual;

        if (r.estado_actual === "en_albergue") {
          bg = "#d1fae5";
          color = "#065f46";
          label = "En Albergue";
        } else if (r.estado_actual === "sin_ubicacion") {
          bg = "#fee2e2";
          color = "#991b1b";
          label = "Sin Ubicación";
        } else if (r.estado_actual === "en_casa_familiar") {
          bg = "#dbeafe";
          color = "#1e40af";
          label = "Casa Familiar";
        }

        return (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              background: bg,
              color: color,
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase"
            }}
          >
            {label}
          </span>
        );
      },
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
          {canEdit && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/damnificados/${r.id}/editar`)}
            >
              Editar
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filteredDamnificados = damnificados.filter((d) => {
    const nombreCompleto = `${d.nombres} ${d.apellidos}`.toLowerCase();
    const matchNombre = nombreCompleto.includes(filterNombre.toLowerCase());
    const matchDocumento = d.numero_documento.toLowerCase().includes(filterDocumento.toLowerCase());
    const matchEstado = filterEstado === "" || d.estado_actual === filterEstado;
    const matchBarrio = filterBarrio === "" || (d.barrio_afectado || "").toLowerCase().includes(filterBarrio.toLowerCase());
    
    return matchNombre && matchDocumento && matchEstado && matchBarrio;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Registro de Damnificados</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button variant="secondary" onClick={fetchData}>
            Actualizar
          </Button>
          {canEdit && (
            <Button onClick={() => navigate("/damnificados/nuevo")}>
              + Nuevo Damnificado
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "150px" }}>
          <Input 
            placeholder="Buscar por documento..." 
            value={filterDocumento} 
            onChange={(e) => setFilterDocumento(e.target.value)} 
          />
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <Input 
            placeholder="Buscar por nombre..." 
            value={filterNombre} 
            onChange={(e) => setFilterNombre(e.target.value)} 
          />
        </div>
        <div style={{ flex: 1, minWidth: "150px" }}>
          <Input 
            placeholder="Buscar por barrio..." 
            value={filterBarrio} 
            onChange={(e) => setFilterBarrio(e.target.value)} 
          />
        </div>
        <div style={{ flex: 1, minWidth: "150px" }}>
          <Select 
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            options={[
              { value: "", label: "Todos los estados" },
              { value: "en_albergue", label: "En Albergue" },
              { value: "sin_ubicacion", label: "Sin Ubicación" },
              { value: "en_casa_familiar", label: "Casa Familiar" }
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div>Cargando registros...</div>
      ) : (
        <Table columns={columns} data={filteredDamnificados} itemsPerPage={10} />
      )}
    </div>
  );
};
