import { AxiosError } from 'axios';
import api from '../config/api';
import { MapaAmbicao, MapaAmbicaoSummary } from '../types/mapa-ambicao';

export const mapaAmbicaoGestorService = {
  list: async (): Promise<MapaAmbicaoSummary[]> => {
    const res = await api.get('/mapas-ambicao');
    return res.data.data as MapaAmbicaoSummary[];
  },

  getByBrokerId: async (brokerId: string): Promise<MapaAmbicao | null> => {
    try {
      const res = await api.get(`/mapas-ambicao/${brokerId}`);
      return res.data.data as MapaAmbicao;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) return null;
      throw err;
    }
  },
};
