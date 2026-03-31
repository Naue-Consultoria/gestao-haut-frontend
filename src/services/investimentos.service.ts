import api from '../config/api';
import { Investimento } from '../types';

export const investimentosService = {
  list: async (brokerId: string, month: number, year: number): Promise<Investimento[]> => {
    const res = await api.get('/investimentos', { params: { brokerId, month, year } });
    return res.data.data;
  },
  create: (data: Omit<Investimento, 'id' | 'broker_id'> & { broker_id?: string }) =>
    api.post('/investimentos', data),
  update: (id: string, data: { tipo: string; produto: string; valor: number; leads: number }) =>
    api.put(`/investimentos/${id}`, data),
  delete: (id: string) =>
    api.delete(`/investimentos/${id}`),
};
