import api from '../config/api';
import { Treinamento } from '../types';

export const treinamentosService = {
  list: async (brokerId: string, month: number, year: number): Promise<Treinamento[]> => {
    const res = await api.get('/treinamentos', { params: { brokerId, month, year } });
    return res.data.data;
  },
  create: (data: Omit<Treinamento, 'id' | 'broker_id'> & { broker_id?: string }) =>
    api.post('/treinamentos', data),
  update: (id: string, data: { atividade: string; local: string; horas: number }) =>
    api.put(`/treinamentos/${id}`, data),
  delete: (id: string) =>
    api.delete(`/treinamentos/${id}`),
};
