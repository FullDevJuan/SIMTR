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
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar Sesión</h1>
        
        {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input 
            label="Correo Electrónico" 
            type="email" 
            {...register('email', { required: 'El correo es requerido' })}
            error={errors.email?.message as string}
          />
          
          <Input 
            label="Contraseña" 
            type="password" 
            {...register('password', { required: 'La contraseña es requerida' })}
            error={errors.password?.message as string}
          />
          
          <div className={styles.submitBtn}>
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
