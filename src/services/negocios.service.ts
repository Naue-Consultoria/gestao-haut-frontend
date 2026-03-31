import api from '../config/api';
import { Negocio } from '../types';

export const negociosService = {
  list: async (brokerId: string, month: number, year: number): Promise<Negocio[]> => {
    const res = await api.get('/negocios', { params: { brokerId, month, year } });
    return res.data.data;
  },
  create: (data: Omit<Negocio, 'id' | 'broker_id'> & { broker_id?: string }) =>
    api.post('/negocios', data),
  update: (id: string, data: { oportunidade: string; origem: string; vgv: number }) =>
    api.put(`/negocios/${id}`, data),
  delete: (id: string) =>
    api.delete(`/negocios/${id}`),
};
