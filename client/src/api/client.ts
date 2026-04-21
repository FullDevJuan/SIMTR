// src/api/client.ts
const API_URL = 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;
  const token = localStorage.getItem('access_token');

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  // Tratamos de parsear el JSON incluso en errores para extraer el mensaje
  let responseData;
  try {
    responseData = await response.json();
  } catch (err) {
    responseData = null;
  }

  if (!response.ok) {
    throw new Error(responseData?.error || 'Un error inesperado ocurrió en el servidor');
  }

  return responseData as T;
}
