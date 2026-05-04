import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/client';
import type { Alerta } from '../types';

interface AlertContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

let alertListeners: ((payload: any) => void)[] = [];
let globalChannel: ReturnType<typeof supabase.channel> | null = null;

const initGlobalChannel = () => {
  if (!globalChannel) {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      // Autenticamos el socket en tiempo real con el JWT para que pase las políticas de RLS
      supabase.realtime.setAuth(token);
    }

    globalChannel = supabase
      .channel('public:alertas')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alertas' },
        (payload) => {
          alertListeners.forEach(listener => listener(payload));
        }
      )
      .subscribe();
  }
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const alertas = await apiFetch<Alerta[]>('/alertas');
      const unread = alertas.filter(a => !a.leida).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread alerts:', error);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    initGlobalChannel();

    const listener = (payload: any) => {
      const nuevaAlerta = payload.new as Alerta;
      
      // Incrementar contador de no leidas
      setUnreadCount(prev => prev + 1);

      // Mostrar toast según el nivel
      const message = nuevaAlerta.mensaje;
      if (nuevaAlerta.nivel === 'critical') {
        toast.error(message, { duration: 6000, position: 'top-right' });
      } else if (nuevaAlerta.nivel === 'warning') {
        toast(message, { icon: '⚠️', duration: 5000, position: 'top-right' });
      } else {
        toast.success(message, { icon: 'ℹ️', duration: 4000, position: 'top-right' });
      }
    };

    alertListeners.push(listener);

    return () => {
      alertListeners = alertListeners.filter(l => l !== listener);
    };
  }, []);

  return (
    <AlertContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
