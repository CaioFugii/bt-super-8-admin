import axios from 'axios';
import type { LoginResponse } from '../types/auth';
import type {
  CreateOrganizerResponse,
  DashboardStats,
  Organizer,
  ResetPasswordResponse,
} from '../types/organizer';
import { clearSession, getAccessToken } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function fetchDashboard() {
  const { data } = await api.get<DashboardStats>('/admin/dashboard');
  return data;
}

export async function fetchOrganizers() {
  const { data } = await api.get<Organizer[]>('/admin/organizers');
  return data;
}

export async function createOrganizer(payload: {
  name: string;
  email: string;
  temporaryPassword?: string;
}) {
  const { data } = await api.post<CreateOrganizerResponse>(
    '/admin/organizers',
    payload,
  );
  return data;
}

export async function updateOrganizer(
  id: string,
  payload: { name: string; email: string },
) {
  const { data } = await api.put<Organizer>(`/admin/organizers/${id}`, payload);
  return data;
}

export async function activateOrganizer(id: string) {
  const { data } = await api.post<Organizer>(
    `/admin/organizers/${id}/activate`,
  );
  return data;
}

export async function deactivateOrganizer(id: string) {
  const { data } = await api.post<Organizer>(
    `/admin/organizers/${id}/deactivate`,
  );
  return data;
}

export async function resetOrganizerPassword(id: string) {
  const { data } = await api.post<ResetPasswordResponse>(
    `/admin/organizers/${id}/reset-password`,
  );
  return data;
}

export { api };
