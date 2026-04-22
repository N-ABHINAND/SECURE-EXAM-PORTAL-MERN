import { getToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
