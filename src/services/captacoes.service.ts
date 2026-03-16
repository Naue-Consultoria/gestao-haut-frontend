import api from '../config/api';
import { Captacao } from '../types';

export const captacoesService = {
  list: async (brokerId: string, month: number, year: number): Promise<Captacao[]> => {
    const res = await api.get('/captacoes', { params: { brokerId, month, year } });
    return res.data.data;
  },
  create: (data: Omit<Captacao, 'id' | 'broker_id'> & { broker_id?: string }) =>
    api.post('/captacoes', data),
  delete: (id: string) =>
    api.delete(`/captacoes/${id}`),
};
