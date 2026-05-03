import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import type { Alerta } from '../../types';
import { useAlerts } from '../../lib/AlertContext';
import { Bell, AlertTriangle, Info, AlertOctagon, Check } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import styles from './Alertas.module.css';

export const Alertas: React.FC = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { refreshUnreadCount } = useAlerts();

  const fetchAlertas = async () => {
    try {
      const data = await apiFetch<Alerta[]>('/alertas');
      setAlertas(data);
    } catch (error) {
      console.error('Error fetching alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/alertas/${id}`, {
        method: 'PATCH',
        data: { leida: true }
      });
      // Actualizar localmente para no recargar toda la lista
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
      refreshUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const filteredAlertas = alertas.filter(a => filter === 'all' || !a.leida);

  const getIcon = (nivel: string) => {
    switch (nivel) {
      case 'critical': return <AlertOctagon size={24} color="#dc2626" />;
      case 'warning': return <AlertTriangle size={24} color="#d97706" />;
      default: return <Info size={24} color="#2563eb" />;
    }
  };

  const getIconBg = (nivel: string) => {
    switch (nivel) {
      case 'critical': return '#fee2e2';
      case 'warning': return '#fef3c7';
      default: return '#dbeafe';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Bell size={28} />
          Centro de Alertas
        </h1>
        <div className={styles.filterGroup}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'unread' ? styles.active : ''}`}
            onClick={() => setFilter('unread')}
          >
            No Leídas
          </button>
        </div>
      </div>

      {loading ? (
        <div>Cargando alertas...</div>
      ) : filteredAlertas.length === 0 ? (
        <div className={styles.emptyState}>
          <Check size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h3>Todo está tranquilo</h3>
          <p>No hay alertas {filter === 'unread' ? 'no leídas' : 'registradas'} en este momento.</p>
        </div>
      ) : (
        <div className={styles.alertList}>
          {filteredAlertas.map(alerta => (
            <div key={alerta.id} className={`${styles.alertCard} ${!alerta.leida ? styles.unread : ''}`}>
              <div 
                className={styles.alertIcon} 
                style={{ backgroundColor: getIconBg(alerta.nivel) }}
              >
                {getIcon(alerta.nivel)}
              </div>
              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  <span className={styles.alertLevel} style={{ 
                    color: alerta.nivel === 'critical' ? '#dc2626' : alerta.nivel === 'warning' ? '#d97706' : '#2563eb' 
                  }}>
                    {alerta.nivel}
                  </span>
                  <span className={styles.alertTime}>
                    {new Date(alerta.created_at).toLocaleString()}
                  </span>
                </div>
                <p className={styles.alertMessage}>{alerta.mensaje}</p>
                {!alerta.leida && (
                  <div className={styles.alertActions}>
                    <Button variant="secondary" onClick={() => markAsRead(alerta.id)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                      Marcar como leída
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
