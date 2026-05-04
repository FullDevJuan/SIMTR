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

import { supabase } from '../../lib/supabase';

export const AlbergueForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Albergue>();

  useEffect(() => {
    const init = async () => {
      if (isEdit) {
        try {
          const albergueData = await apiFetch<Albergue>(`/albergues/${id}`);
          reset(albergueData);
          if (albergueData.imagen_url) {
            setPreviewUrl(albergueData.imagen_url);
          }
        } catch (error: any) {
          setErrorMsg('Error cargando datos: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [id, isEdit, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: Albergue) => {
    setSaving(true);
    setErrorMsg('');

    try {
      let finalImageUrl = data.imagen_url || undefined;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Aseguramos la sesión manualmente antes de subir para evitar errores de RLS
        const token = sessionStorage.getItem("access_token");
        if (token) {
          await supabase.auth.setSession({ access_token: token, refresh_token: "" });
        }

        const { error: uploadError } = await supabase.storage
          .from('albergues_imgs')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error('Error subiendo imagen: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('albergues_imgs')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const payload: any = { ...data };
      payload.capacidad_maxima = Number(payload.capacidad_maxima);
      payload.capacidad_actual = Number(payload.capacidad_actual) || 0;
      
      if (payload.latitud) payload.latitud = Number(payload.latitud);
      if (payload.longitud) payload.longitud = Number(payload.longitud);

      if (payload.fecha_cierre === '') delete payload.fecha_cierre;
      if (finalImageUrl) payload.imagen_url = finalImageUrl;

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
            
            <div className={styles.imageUploadSection} style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Imagen del Albergue</label>
              {previewUrl && (
                <div style={{ marginBottom: '1rem' }}>
                  <img src={previewUrl} alt="Vista previa" style={{ width: '100%', maxWidth: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ padding: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '8px', width: '100%' }}
              />
            </div>

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
