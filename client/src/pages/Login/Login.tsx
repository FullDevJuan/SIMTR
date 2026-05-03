import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../lib/AuthContext';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await apiFetch<any>('/auth/login', {
        method: 'POST',
        data
      });
      
      login(response.session.access_token, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sección Izquierda: Branding (Solo en Desktop) */}
      <div className={styles.brandSection}>
        <div className={styles.brandContent}>
          <h1 className={styles.logo}>SIMTR</h1>
          <h2 className={styles.tagline}>Monitoreo de emergencias</h2>
          <p className={styles.location}>Montería, Córdoba</p>
        </div>
      </div>

      {/* Sección Derecha: Formulario */}
      <div className={styles.formSection}>
        <div className={styles.card}>
          <div className={styles.mobileHeader}>
            <h1 className={styles.logoMobile}>SIMTR</h1>
            <p className={styles.taglineMobile}>Monitoreo de emergencias<br/>Montería, Córdoba</p>
          </div>

          <h2 className={styles.title}>Bienvenido de nuevo</h2>
          <p className={styles.subtitle}>Ingresa tus credenciales para acceder al sistema.</p>
          
          {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
          
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <Input 
              label="Correo Electrónico" 
              type="email" 
              placeholder="tu@correo.com"
              {...register('email', { required: 'El correo es requerido' })}
              error={errors.email?.message as string}
            />
            
            <Input 
              label="Contraseña" 
              type="password" 
              placeholder="••••••••"
              {...register('password', { required: 'La contraseña es requerida' })}
              error={errors.password?.message as string}
            />
            
            <div className={styles.submitBtn}>
              <Button type="submit" fullWidth disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
