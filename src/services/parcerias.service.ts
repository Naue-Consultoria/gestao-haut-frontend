import api from '../config/api';
import { Parceria, MetaParceria, Comentario } from '../types';

export const parceriasService = {
  getAll: async (): Promise<Parceria[]> => {
    const res = await api.get('/parcerias');
    return res.data.data;
  },
  getActive: async (): Promise<Parceria[]> => {
    const res = await api.get('/parcerias/active');
    return res.data.data;
  },
  getById: async (id: string): Promise<Parceria> => {
    const res = await api.get(`/parcerias/${id}`);
    return res.data.data;
  },
  getByBrokerId: async (brokerId: string): Promise<Parceria | null> => {
    const res = await api.get(`/parcerias/broker/${brokerId}`);
    return res.data.data;
  },
  create: async (nome: string, brokerIds: string[]): Promise<Parceria> => {
    const res = await api.post('/parcerias', { nome, brokerIds });
    return res.data.data;
  },
  update: async (id: string, nome: string, active: boolean): Promise<Parceria> => {
    const res = await api.put(`/parcerias/${id}`, { nome, active });
    return res.data.data;
  },
  updateMembros: async (id: string, brokerIds: string[]): Promise<Parceria> => {
    const res = await api.put(`/parcerias/${id}/membros`, { brokerIds });
    return res.data.data;
  },
  delete: async (id: string) => {
    await api.delete(`/parcerias/${id}`);
  },

  // Metas
  getMetas: async (parceriaId: string): Promise<MetaParceria[]> => {
    const res = await api.get(`/parcerias/${parceriaId}/metas`);
    return res.data.data;
  },
  getMetaByMonth: async (parceriaId: string, month: number, year: number): Promise<MetaParceria | null> => {
    const res = await api.get(`/parcerias/${parceriaId}/metas/${month}`, { params: { year } });
    return res.data.data;
  },
  upsertMeta: (parceriaId: string, month: number, year: number, data: Partial<MetaParceria>) =>
    api.put(`/parcerias/${parceriaId}/metas/${month}`, data, { params: { year } }),
  bulkUpsertVgv: (parceriaId: string, year: number, vgv_anual: number, vgv_mensal: number) =>
    api.put(`/parcerias/${parceriaId}/metas/bulk-vgv`, { vgv_anual, vgv_mensal }, { params: { year } }),

  // Comentários
  getComentarios: async (parceriaId: string): Promise<Comentario[]> => {
    const res = await api.get(`/parcerias/${parceriaId}/comentarios`);
    return res.data.data;
  },
  getComentarioByMonth: async (parceriaId: string, month: number, year: number): Promise<Comentario | null> => {
    const res = await api.get(`/parcerias/${parceriaId}/comentarios/${month}`, { params: { year } });
    return res.data.data;
  },
  upsertComentario: (parceriaId: string, month: number, year: number, texto: string) =>
    api.put(`/parcerias/${parceriaId}/comentarios/${month}`, { texto }, { params: { year } }),
  deleteComentario: (id: string) => api.delete(`/parcerias/comentarios/${id}`),
};
