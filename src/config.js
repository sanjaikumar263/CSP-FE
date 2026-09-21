const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || 'https://csp-be.onrender.com';
export const BACKEND_URL = rawBackendUrl ? rawBackendUrl.replace(/\/+$/, '') : '';

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || (BACKEND_URL ? `${BACKEND_URL}/api` : '/api');
export const API_BASE_URL = rawApiBaseUrl ? rawApiBaseUrl.replace(/\/+$/, '') : '';
