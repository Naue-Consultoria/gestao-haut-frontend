import api from '../config/api';

export interface ReportData {
  broker: { name: string; team: string; avatar_url?: string | null };
  meta: {
    vgv_anual: number;
    vgv_mensal: number;
    captacoes: number;
    capt_exclusivas: number;
    negocios: number;
    treinamento: number;
    investimento: number;
    positivacao: number;
  } | null;
  totals: {
    vgvRealizado: number;
    comissaoTotal: number;
    negociosVgvTotal: number;
    negociosCount: number;
    treinamentoHoras: number;
    investimentoTotal: number;
    investimentoLeads: number;
    captacoesCount: number;
    captExclusivas: number;
    vgvAcumuladoAno: number;
    taxaPositivacao: number;
  };
  positivacoes: { oportunidade: string; parceria: string; vgv: number; comissao: number }[];
  captacoes: { oportunidade: string; exclusivo: string; origem: string; vgv: number }[];
  negocios: { oportunidade: string; origem: string; vgv: number }[];
  treinamentos: { atividade: string; local: string; horas: number }[];
  investimentos: { tipo: string; produto: string; valor: number; leads: number }[];
  comentario: { texto: string; gestorName: string } | null;
  planosAcao: { texto: string; prazo: string; status: string }[];
  monthlyVgv: number[];
  monthlyMeta: number[];
}

export const reportsService = {
  getBrokerReport: async (brokerId: string, month: number, year: number): Promise<ReportData> => {
    const res = await api.get(`/reports/broker/${brokerId}`, { params: { month, year } });
    return res.data.data;
  },
};
