import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import type { Albergue } from '../../types';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import styles from './Albergues.module.css';

export const AlbergueForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Albergue>();

  useEffect(() => {
    const init = async () => {
      if (isEdit) {
        try {
          const albergueData = await apiFetch<Albergue>(`/albergues/${id}`);
          reset(albergueData);
        } catch (error: any) {
          setErrorMsg('Error cargando datos: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [id, isEdit, reset]);

  const onSubmit = async (data: Albergue) => {
    setSaving(true);
    setErrorMsg('');

    const payload = { ...data };
    payload.capacidad_maxima = Number(payload.capacidad_maxima);
    payload.capacidad_actual = Number(payload.capacidad_actual) || 0;
    
    if (payload.latitud) payload.latitud = Number(payload.latitud);
    if (payload.longitud) payload.longitud = Number(payload.longitud);

    if (payload.fecha_cierre === '') delete (payload as any).fecha_cierre;

    try {
      if (isEdit) {
        await apiFetch(`/albergues/${id}`, {
          method: 'PATCH',
          data: payload
        });
      } else {
        await apiFetch('/albergues', {
          method: 'POST',
          data: payload
        });
      }
      navigate('/albergues');
    } catch (error: any) {
      setErrorMsg(error.message || 'Ocurrió un error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando información...</div>;

  return (
    <div>
      <Card title={isEdit ? 'Editar Albergue' : 'Registrar Nuevo Albergue'}>
        {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGrid}>
            <div className={styles.sectionTitle}>Información General</div>
            
            <Input 
              label="Nombre del Albergue" 
              {...register('nombre', { required: 'Obligatorio' })} 
              error={errors.nombre?.message} 
            />
            
            <Select 
              label="Tipo de Establecimiento" 
              {...register('tipo', { required: 'Obligatorio' })} 
              error={errors.tipo?.message}
              options={[
                { value: 'colegio', label: 'Colegio / Escuela' },
                { value: 'polideportivo', label: 'Polideportivo' },
                { value: 'iglesia', label: 'Iglesia / Templo' },
                { value: 'coliseo', label: 'Coliseo' },
                { value: 'sede_comunal', label: 'Sede Comunal' },
                { value: 'otro', label: 'Otro' },
              ]}
            />
            
            <Input 
              label="Dirección" 
              {...register('direccion', { required: 'Obligatorio' })} 
              error={errors.direccion?.message} 
            />
            
            <Input 
              label="Barrio" 
              {...register('barrio', { required: 'Obligatorio' })} 
              error={errors.barrio?.message} 
            />

            <div className={styles.sectionTitle}>Capacidad y Estado</div>
            
            <Input 
              label="Capacidad Máxima (personas)" 
              type="number"
              min="1"
              {...register('capacidad_maxima', { required: 'Obligatorio', min: 1 })} 
              error={errors.capacidad_maxima?.message} 
            />
            
            <Input 
              label="Capacidad Actual (personas)" 
              type="number"
              min="0"
              {...register('capacidad_actual')} 
              error={errors.capacidad_actual?.message} 
            />
            
            <Select 
              label="Estado" 
              {...register('estado', { required: 'Obligatorio' })} 
              error={errors.estado?.message}
              options={[
                { value: 'activo', label: 'Activo / Abierto' },
                { value: 'saturado', label: 'Saturado / Lleno' },
                { value: 'cerrado', label: 'Cerrado' },
              ]}
            />
            
            <Select 
              label="Condiciones Sanitarias" 
              {...register('condiciones_sanitarias', { required: 'Obligatorio' })} 
              error={errors.condiciones_sanitarias?.message}
              options={[
                { value: 'buenas', label: 'Buenas' },
                { value: 'regulares', label: 'Regulares' },
                { value: 'malas', label: 'Malas' },
              ]}
            />

            <div className={styles.sectionTitle}>Geolocalización y Fechas</div>
            
            <Input 
              label="Latitud" 
              type="number"
              step="any"
              {...register('latitud', { required: 'Obligatorio' })} 
              error={errors.latitud?.message}
            />
            
            <Input 
              label="Longitud" 
              type="number"
              step="any"
              {...register('longitud', { required: 'Obligatorio' })} 
              error={errors.longitud?.message}
            />
            
            <Input 
              label="Fecha de Apertura" 
              type="date"
              {...register('fecha_apertura', { required: 'Obligatorio' })} 
              error={errors.fecha_apertura?.message}
            />
            
            <Input 
              label="Fecha de Cierre" 
              type="date"
              {...register('fecha_cierre')} 
            />
          </div>

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => navigate('/albergues')} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Datos'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
