// src/types/index.ts

export interface User {
  email: string;
  id: string;
  rol: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';
  nombre_completo: string;
  activo: boolean;
}

export interface Albergue {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string;
  barrio: string;
  capacidad_maxima: number;
  capacidad_actual: number;
  estado: string;
}

export interface Damnificado {
  id: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  estado_actual: string;
  barrio_afectado: string;
  total_miembros: number;
}
