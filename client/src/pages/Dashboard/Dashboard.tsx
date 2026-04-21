import React, { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import type { Albergue } from "../../types";
import styles from "./Dashboard.module.css";

export const Dashboard: React.FC = () => {
  const [albergues, setAlbergues] = useState<Albergue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch<Albergue[]>("/albergues");
        setAlbergues(data);
      } catch (error) {
        console.error("Error fetching albergues", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Cargando dashboard...</div>;

  const totalCapacidad = albergues.reduce(
    (acc, curr) => acc + curr.capacidad_maxima,
    0,
  );
  const totalActual = albergues.reduce(
    (acc, curr) => acc + curr.capacidad_actual,
    0,
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Panel General</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Albergues Activos</div>
          <div className={styles.statValue}>{albergues.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Damnificados Refugiados</div>
          <div className={styles.statValue}>{totalActual}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Capacidad Total</div>
          <div className={styles.statValue}>{totalCapacidad}</div>
        </div>
      </div>
    </div>
  );
};
