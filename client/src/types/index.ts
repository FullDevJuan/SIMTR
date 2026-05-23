// src/types/index.ts

export interface User {
  email: string;
  id: string;
  rol: "ADMIN" | "OPERADOR" | "VISUALIZADOR";
  nombre_completo: string;
  activo: boolean;
}

export interface Usuario {
  id: string;
  auth_user_id: string;
  rol: "ADMIN" | "OPERADOR" | "VISUALIZADOR";
  nombre_completo: string;
  telefono?: string;
  activo: boolean;
  created_at: string;
}

export interface Albergue {
  id: string;
  nombre: string;
  tipo:
    | "colegio"
    | "polideportivo"
    | "iglesia"
    | "coliseo"
    | "sede_comunal"
    | "otro";
  direccion: string;
  barrio: string;
  latitud: number;
  longitud: number;
  capacidad_maxima: number;
  capacidad_actual: number;
  estado: "activo" | "saturado" | "cerrado";
  condiciones_sanitarias: "buenas" | "regulares" | "malas";
  fecha_apertura: string;
  fecha_cierre?: string;
  responsable_id?: string;
  imagen_url?: string;
}

export interface Damnificado {
  id?: string;
  numero_documento: string;
  tipo_documento: string;
  nombres: string;
  apellidos: string;
  genero: string;
  fecha_nacimiento?: string;
  telefono?: string;
  estado_actual: string;
  barrio_afectado: string;
  total_miembros: number;
  activo?: boolean;
}

export interface AsignacionAlbergue {
  id?: string;
  damnificado_id: string;
  albergue_id: string;
  fecha_ingreso?: string;
  fecha_salida?: string;
  motivo_salida?: string;
}

export interface Alerta {
  id: string;
  mensaje: string;
  nivel: "info" | "warning" | "critical";
  leida: boolean;
  created_at: string;
}

export interface TipoAyuda {
  id: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  created_at: string;
}

export interface EntregaAyuda {
  id: string;
  damnificado_id: string;
  tipo_ayuda_id: string;
  cantidad: number;
  descripcion_detalle?: string;
  registrado_por: string;
  fecha_entrega: string;
  fuente_recurso:
    | "alcaldia"
    | "gobernacion"
    | "cruz_roja"
    | "defensa_civil"
    | "ong"
    | "donacion_privada"
    | "ungrd"
    | "otra";
  observaciones?: string;
  estado: "entregada" | "anulada" | "espera";
  motivo_anulacion?: string;
  created_at: string;
  // Joins
  damnificados?: {
    nombres: string;
    apellidos: string;
    numero_documento: string;
    barrio_afectado: string;
  };
  tipos_ayuda?: {
    nombre: string;
    unidad_medida: string;
  };
  usuarios?: {
    nombre_completo: string;
  };
}
