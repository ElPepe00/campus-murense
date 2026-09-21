// frontend/src/api/authApi.ts
import { apiClient } from './client';
import type { LoginResponse, Usuari } from '../types/auth';

export async function loginStaff(username: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    let errorMsg = 'Error en iniciar sessió';
    try {
      const err = await response.json();
      if (err.detail) errorMsg = err.detail;
    } catch {
      // Ignorar parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function getPerfilStaff(): Promise<Usuari> {
  return apiClient<Usuari>('/api/auth/me');
}
