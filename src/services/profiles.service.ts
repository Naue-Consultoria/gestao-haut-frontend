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
};
