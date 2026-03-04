import api from '../config/api';
import { User } from '../types';

export const profilesService = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get('/profiles');
    return res.data.data;
  },
  getBrokers: async (): Promise<User[]> => {
    const res = await api.get('/profiles/brokers');
    return res.data.data;
  },
  create: (data: { email: string; password: string; name: string; team: string; role: string }) =>
    api.post('/profiles', data),
  update: (id: string, data: Partial<User>) =>
    api.put(`/profiles/${id}`, data),
  delete: (id: string) => api.delete(`/profiles/${id}`),
  resetPassword: (id: string, password: string) =>
    api.post(`/profiles/${id}/reset-password`, { password }),
  uploadAvatar: async (id: string, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post(`/profiles/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  removeAvatar: async (id: string): Promise<User> => {
    const res = await api.delete(`/profiles/${id}/avatar`);
    return res.data.data;
  },
};
