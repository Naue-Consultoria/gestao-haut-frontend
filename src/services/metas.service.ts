import api from '../config/api';
import { Meta } from '../types';

export const metasService = {
  getByBroker: async (brokerId: string): Promise<Meta[]> => {
    const res = await api.get(`/metas/${brokerId}`);
    return res.data.data;
  },
  getByBrokerAndMonth: async (brokerId: string, month: number, year: number): Promise<Meta | null> => {
    const res = await api.get(`/metas/${brokerId}/${month}`, { params: { year } });
    return res.data.data;
  },
  upsert: (brokerId: string, month: number, year: number, data: Partial<Meta>) =>
    api.put(`/metas/${brokerId}/${month}`, data, { params: { year } }),
  bulkUpsertVgv: (brokerId: string, year: number, vgv_anual: number) =>
    api.put(`/metas/${brokerId}/bulk-vgv`, { vgv_anual }, { params: { year } }),
};
