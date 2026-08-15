export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // We use localStorage to get the token directly since Zustand persist saves it there
  let token = null;
  if (typeof window !== 'undefined') {
    const storageStr = localStorage.getItem('auth-storage');
    if (storageStr) {
      try {
        const authData = JSON.parse(storageStr);
        token = authData.state?.token;
      } catch (e) {
        console.error("Failed to parse auth token", e);
      }
    }
  }

  const headers = new Headers(options.headers || {});
  
  // If it's not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized globally
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'An error occurred during the request');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
