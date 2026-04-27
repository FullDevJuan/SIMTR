import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { Home, Users, LogOut, MapPin, Settings } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './Layout.module.css';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>SIMTR</div>
        <nav className={styles.nav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <Home size={20} />
            Inicio
          </NavLink>
          <NavLink
            to="/damnificados"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <Users size={20} />
            Damnificados
          </NavLink>
          <NavLink
            to="/albergues"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <MapPin size={20} />
            Albergues
          </NavLink>
          
          {user?.rol === 'ADMIN' && (
            <NavLink
              to="/configuracion/usuarios"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <Settings size={20} />
              Configuración
            </NavLink>
          )}
        </nav>
      </aside>
      
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.userInfo}>
            {user && (
              <>
                <span style={{ fontSize: '0.875rem' }}>{user.nombre_completo}</span>
                <span className={styles.roleBadge}>{user.rol}</span>
              </>
            )}
            <Button variant="secondary" onClick={handleLogout} style={{ padding: '0.4rem', border: 'none' }}>
              <LogOut size={18} />
            </Button>
          </div>
        </header>
        
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
