// frontend/src/api/client.ts

// En producció (Render all-in-one), el frontend és servit per FastAPI al mateix host.
// Les crides a l'API han de ser relatives (URL buida), no 'http://localhost:8000'.
// En dev (npm run dev), s'usa 'http://localhost:8000' com a fallback.
// Si VITE_API_URL està definida explícitament (qualsevol entorn), s'usa aquell valor.
const rawApiUrl: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  (import.meta.env.PROD ? '' : 'http://localhost:8000');

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('murense_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Ignorar error al parsear JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
