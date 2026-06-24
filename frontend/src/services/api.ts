import axios, { AxiosError } from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5283/api';
const MEDIA_BASE = API_BASE.replace('/api', '');

/**
 * Converts a relative upload path (e.g. /uploads/photos/x.jpg)
 * to a full URL pointing at the backend file server.
 */
export const getMediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path; // already absolute
  return `${MEDIA_BASE}${path}`;
};

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response interceptor — auto-logout on 401
api.interceptors.response.use(
  res => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string, baseUrl: string) =>
    api.post('/auth/forgot-password', { email, baseUrl }),
  resetPassword: (email: string, token: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  updateEmail: (newEmail: string, password: string) =>
    api.put('/auth/update-email', { newEmail, password }),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileService = {
  get: (slug: string) => api.get(`/profile/${slug}`),
  getMine: () => api.get('/profile/me'),
  update: (data: any) => api.put('/profile', data),
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/profile/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadCV: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/profile/cv', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  removeCV: () => api.delete('/profile/cv'),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectService = {
  getAll: (userId: number) => api.get(`/projects/${userId}`),     // Public
  getMine: () => api.get('/projects/mine'),                        // Authenticated
  create: (data: any) => api.post('/projects', data),
  update: (id: number, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// ── Skills ────────────────────────────────────────────────────────────────────
export const skillService = {
  getAll: (userId: number) => api.get(`/skills/${userId}`),
  getMine: () => api.get('/skills/mine'),
  create: (data: any) => api.post('/skills', data),
  update: (id: number, data: any) => api.put(`/skills/${id}`, data),
  delete: (id: number) => api.delete(`/skills/${id}`),
};

// ── Timeline ──────────────────────────────────────────────────────────────────
export const timelineService = {
  getAll: (userId: number) => api.get(`/timeline/${userId}`),
  getMine: () => api.get('/timeline/mine'),
  create: (data: any) => api.post('/timeline', data),
  update: (id: number, data: any) => api.put(`/timeline/${id}`, data),
  delete: (id: number) => api.delete(`/timeline/${id}`),
};

// ── Blog ──────────────────────────────────────────────────────────────────────
export const blogService = {
  getAll: (userId: number, search?: string) =>
    api.get(`/blog/${userId}`, { params: { search } }),
  getMine: (search?: string) =>
    api.get('/blog/mine', { params: { search } }),
  getOne: (id: number) => api.get(`/blog/post/${id}`),
  create: (data: any) => api.post('/blog', data),
  update: (id: number, data: any) => api.put(`/blog/${id}`, data),
  delete: (id: number) => api.delete(`/blog/${id}`),
};

// ── Gallery ───────────────────────────────────────────────────────────────────
export const galleryService = {
  getAll: (userId: number) => api.get(`/gallery/${userId}`),
  getMine: () => api.get('/gallery/mine'),
  upload: (file: File, caption: string, category: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('caption', caption);
    form.append('category', category);
    return api.post('/gallery', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (id: number) => api.delete(`/gallery/${id}`),
};

// ── Testimonials ──────────────────────────────────────────────────────────────
export const testimonialService = {
  getAll: (userId: number) => api.get(`/testimonials/${userId}`),
  getMine: () => api.get('/testimonials/mine'),
  create: (data: any) => api.post('/testimonials', data),
  update: (id: number, data: any) => api.put(`/testimonials/${id}`, data),
  delete: (id: number) => api.delete(`/testimonials/${id}`),
};

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactService = {
  send: (data: { name: string; email: string; message: string; recipientSlug?: string }) =>
    api.post('/contact', data),
};

// ── Public Landing ────────────────────────────────────────────────────────────
export const landingService = {
  getContent: () => api.get('/landing/content'),
  getTemplates: () => api.get('/landing/templates'),
  getStats: () => api.get('/landing/stats'),
  getTestimonials: () => api.get('/landing/testimonials'),
  getFeatures: () => api.get('/landing/features'),
};

// ── SuperAdmin ────────────────────────────────────────────────────────────────
export const adminService = {
  getAllContent: () => api.get('/admin/content'),
  upsertContent: (key: string, data: { value: string; valueNp?: string; section: string }) =>
    api.put(`/admin/content/${key}`, data),
  getTemplates: () => api.get('/admin/templates'),
  createTemplate: (data: any) => api.post('/admin/templates', data),
  updateTemplate: (id: number, data: any) => api.put(`/admin/templates/${id}`, data),
  deleteTemplate: (id: number) => api.delete(`/admin/templates/${id}`),
  getStats: () => api.get('/admin/stats'),
  createStat: (data: any) => api.post('/admin/stats', data),
  updateStat: (id: number, data: any) => api.put(`/admin/stats/${id}`, data),
  deleteStat: (id: number) => api.delete(`/admin/stats/${id}`),
  getFeatures: () => api.get('/admin/features'),
  createFeature: (data: any) => api.post('/admin/features', data),
  updateFeature: (id: number, data: any) => api.put(`/admin/features/${id}`, data),
  deleteFeature: (id: number) => api.delete(`/admin/features/${id}`),
  getPlatformTestimonials: () => api.get('/admin/platform-testimonials'),
  createPlatformTestimonial: (data: any) => api.post('/admin/platform-testimonials', data),
  updatePlatformTestimonial: (id: number, data: any) => api.put(`/admin/platform-testimonials/${id}`, data),
  deletePlatformTestimonial: (id: number) => api.delete(`/admin/platform-testimonials/${id}`),
  getUsers: () => api.get('/admin/users'),
  toggleUser: (id: number) => api.put(`/admin/users/${id}/toggle`),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getSettings: () => api.get('/admin/settings'),
  saveAllSettings: (updates: { key: string; value: string }[]) => api.put('/admin/settings', updates),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/admin/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
