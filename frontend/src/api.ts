import axios from 'axios';
import type { Site, LogbookEntry, Stats } from './types';

const api = axios.create({
  baseURL: '/api',
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (username: string, email: string, password: string) =>
  api.post('/auth/register', { username, email, password });

export const getMe = () => api.get('/auth/me');

// Sites
export const getSites = () => api.get<Site[]>('/sites');

export const getSite = (id: number) => api.get<Site>(`/sites/${id}`);

export const createSite = (data: Partial<Site>) => api.post<Site>('/sites', data);

export const updateSite = (id: number, data: Partial<Site>) =>
  api.put<Site>(`/sites/${id}`, data);

export const deleteSite = (id: number) => api.delete(`/sites/${id}`);

// Climbing routes
export const getRoutesForSite = (siteId: number) =>
  api.get(`/climbing-routes/site/${siteId}`);

export const createRoute = (data: object) => api.post('/climbing-routes', data);

export const updateRoute = (id: number, data: object) =>
  api.put(`/climbing-routes/${id}`, data);

export const deleteRoute = (id: number) => api.delete(`/climbing-routes/${id}`);

// Logbook
export const getLogbook = () => api.get<LogbookEntry[]>('/logbook');

export const addLogbookEntry = (data: {
  route_id: number;
  date: string;
  feeling?: number;
  comment?: string;
}) => api.post<LogbookEntry>('/logbook', data);

export const updateLogbookEntry = (
  id: number,
  data: { date?: string; feeling?: number; comment?: string }
) => api.put<LogbookEntry>(`/logbook/${id}`, data);

export const deleteLogbookEntry = (id: number) => api.delete(`/logbook/${id}`);

export const getStats = () => api.get<Stats>('/logbook/stats');

export default api;
