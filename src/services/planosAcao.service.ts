import api from '../config/api';
import { PlanoAcao } from '../types';

export const planosAcaoService = {
  getByBroker: async (brokerId: string): Promise<PlanoAcao[]> => {
    const res = await api.get(`/planos-acao/${brokerId}`);
    return res.data.data;
  },
  getByBrokerAndMonth: async (brokerId: string, month: number, year: number): Promise<PlanoAcao[]> => {
    const res = await api.get(`/planos-acao/${brokerId}/${month}`, { params: { year } });
    return res.data.data;
  },
  create: (brokerId: string, data: { texto: string; prazo: string; status: string; month: number; year: number }) =>
    api.post(`/planos-acao/${brokerId}`, data),
  update: (id: string, data: { texto?: string; prazo?: string; status?: string }) =>
    api.put(`/planos-acao/${id}`, data),
  delete: (id: string) =>
    api.delete(`/planos-acao/${id}`),
};
