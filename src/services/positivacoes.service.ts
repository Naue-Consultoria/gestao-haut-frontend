import api from '../config/api';
import { Positivacao } from '../types';

export const positivacoesService = {
  list: async (brokerId: string, month: number, year: number): Promise<Positivacao[]> => {
    const res = await api.get('/positivacoes', { params: { brokerId, month, year } });
    return res.data.data;
  },
  create: (data: Omit<Positivacao, 'id' | 'broker_id'> & { broker_id?: string }) =>
    api.post('/positivacoes', data),
  update: (id: string, data: { oportunidade: string; parceria: string; vgv: number; comissao: number }) =>
    api.put(`/positivacoes/${id}`, data),
  delete: (id: string) =>
    api.delete(`/positivacoes/${id}`),
};
