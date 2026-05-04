import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { Albergue } from "../../types";
import { Button } from "../../components/Button/Button";
import { useAuth } from "../../lib/AuthContext";
import { MapPin, Users, Activity } from "lucide-react";
import defaultAlbergueImg from "../../assets/albergue_generic.jpg";
import styles from "./Albergues.module.css";

export const Albergues: React.FC = () => {
  const [albergues, setAlbergues] = useState<Albergue[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Albergue[]>("/albergues");
      setAlbergues(data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.rol === "ADMIN" || user?.rol === "OPERADOR";

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "#ef4444"; // Red for full
    if (percentage >= 80) return "#f59e0b"; // Yellow for almost full
    return "#10b981"; // Green for available
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Albergues</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button variant="secondary" onClick={fetchData}>
            Actualizar
          </Button>
          {canEdit && (
            <Button onClick={() => navigate("/albergues/nuevo")}>
              + Nuevo Albergue
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>Cargando registros...</div>
      ) : (
        <div className={styles.grid}>
          {albergues.map((albergue) => {
            const percentage = Math.min(
              100,
              Math.round((albergue.capacidad_actual / albergue.capacidad_maxima) * 100)
            );
            const progressColor = getProgressColor(percentage);

            return (
              <div key={albergue.id} className={styles.card}>
                <div className={styles.cardImageContainer}>
                  <img
                    src={albergue.imagen_url || defaultAlbergueImg}
                    alt={albergue.nombre}
                    className={styles.cardImage}
                  />
                  <div
                    className={styles.statusBadge}
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
                    }}
                  >
                    {albergue.estado}
                  </div>
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{albergue.nombre}</h3>
                  <div className={styles.cardInfoRow}>
                    <MapPin size={16} />
                    <span>{albergue.direccion}, {albergue.barrio}</span>
                  </div>
                  
                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <div className={styles.cardInfoRow}>
                        <Users size={16} />
                        <span className={styles.progressText}>
                          Ocupación: {albergue.capacidad_actual} / {albergue.capacidad_maxima}
                        </span>
                      </div>
                      <span className={styles.percentageText} style={{ color: progressColor }}>
                        {percentage}%
                      </span>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div
                        className={styles.progressBarFill}
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: progressColor,
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.cardActions}>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/albergues/${albergue.id}`)}
                      className={styles.actionBtn}
                    >
                      Detalles
                    </Button>
                    {canEdit && (
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/albergues/${albergue.id}/editar`)}
                        className={styles.actionBtn}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
