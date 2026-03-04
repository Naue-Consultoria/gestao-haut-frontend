import api from '../config/api';
import { Comentario } from '../types';

export const comentariosService = {
  getByBroker: async (brokerId: string): Promise<Comentario[]> => {
    const res = await api.get(`/comentarios/${brokerId}`);
    return res.data.data;
  },
  getByBrokerAndMonth: async (brokerId: string, month: number, year: number): Promise<Comentario | null> => {
    const res = await api.get(`/comentarios/${brokerId}/${month}`, { params: { year } });
    return res.data.data;
  },
  upsert: (brokerId: string, month: number, year: number, texto: string) =>
    api.put(`/comentarios/${brokerId}/${month}`, { texto }, { params: { year } }),
  delete: (id: string) => api.delete(`/comentarios/${id}`),
};
