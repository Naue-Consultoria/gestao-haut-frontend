import { AxiosError } from 'axios';
import api from '../config/api';
import { MapaAmbicao, MapaDados } from '../types/mapa-ambicao';

export const mapaAmbicaoService = {
  /**
   * Busca o Mapa de Ambição do corretor autenticado.
   * Retorna null quando o backend responde 404 (mapa ainda não existe).
   * Re-throwa qualquer outro erro (5xx, network, etc.) para o caller tratar.
   */
  get: async (): Promise<MapaAmbicao | null> => {
    try {
      const res = await api.get('/mapa-ambicao');
      return res.data.data as MapaAmbicao;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Upsert do Mapa de Ambição do corretor autenticado.
   * Envia `{ dados, status }` no body; backend retorna o registro atualizado.
   */
  upsert: async (dados: MapaDados, status: 'vazio' | 'parcial' | 'preenchido'): Promise<MapaAmbicao> => {
    const res = await api.put('/mapa-ambicao', { dados, status });
    return res.data.data as MapaAmbicao;
  },
};
