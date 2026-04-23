export type UserRole = 'corretor' | 'gestor';
export type OrigemType = 'RELACIONAMENTO' | 'PATROCINADO' | 'CORRETOR_EXTERNO' | 'CORRETOR_INTERNO' | 'PORTAL' | 'PLANTAO_HAUT' | 'GRUPO_CORRETORES_WHATSAPP' | 'CLIENTE_DE_CARTEIRA' | 'PROSPECCAO_ATIVA';
export type InvestimentoType = 'PORTAL' | 'PATROCINADO' | 'CURSO' | 'NETWORKING' | 'PRESENTE_CLIENTE' | 'BRINDE' | 'OUTRO';

export interface User {
  id: string;
  name: string;
  email: string;
  team: string;
  role: UserRole;
  active: boolean;
  must_change_password: boolean;
  avatar_url?: string | null;
}

export interface Meta {
  id: string;
  broker_id: string;
  month: number;
  year: number;
  vgv_anual: number;
  vgv_mensal: number;
  captacoes: number;
  capt_exclusivas: number;
  negocios: number;
  treinamento: number;
  investimento: number;
  positivacao: number;
}

export interface Positivacao {
  id: string;
  broker_id: string;
  month: number;
  year: number;
  oportunidade: string;
  parceria: string;
  vgv: number;
  comissao: number;
}

export interface Captacao {
  id: string;
  broker_id: string;
  month: number;
  year: number;
  oportunidade: string;
  exclusivo: string;
  origem: OrigemType;
  vgv: number;
}

export interface Negocio {
  id: string;
  broker_id: string;
  month: number;
  year: number;
  oportunidade: string;
  origem: OrigemType;
  vgv: number;
  notas?: string;
}

export interface Treinamento {
  id: string;
  broker_id: string;
  month: number;
  year: number;
  atividade: string;
  local: string;
  horas: number;
}

export interface Investimento {
  id: string;
  broker_id: string;
  month: number;
  year: number;
  tipo: InvestimentoType;
  produto: string;
  valor: number;
  leads: number;
}

export interface Comentario {
  id: string;
  broker_id?: string;
  parceria_id?: string;
  gestor_id: string;
  month: number;
  year: number;
  texto: string;
  gestor?: { name: string };
}

export type PlanoStatus = 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface PlanoAcao {
  id: string;
  broker_id: string;
  gestor_id: string;
  month: number;
  year: number;
  texto: string;
  prazo: string;
  status: PlanoStatus;
  created_at: string;
  gestor?: { name: string };
}

export interface Parceria {
  id: string;
  nome: string;
  active: boolean;
  created_at: string;
  parceria_membros?: ParceriaMembro[];
}

export interface ParceriaMembro {
  id: string;
  parceria_id: string;
  broker_id: string;
  created_at: string;
  broker?: { id: string; name: string; email: string; team: string };
}

export interface MetaParceria {
  id: string;
  parceria_id: string;
  month: number;
  year: number;
  vgv_anual: number;
  vgv_mensal: number;
  captacoes: number;
  capt_exclusivas: number;
  negocios: number;
  treinamento: number;
  investimento: number;
  positivacao: number;
}

export interface BrokerSummary {
  id: string;
  name: string;
  team: string;
  metaAnual: number;
  realizado: number;
  percentual: number;
  desvio: number;
  isParceria?: boolean;
}

export interface DashboardConsolidated {
  totalVGV: number;
  totalCaptacoes: number;
  totalNegocios: number;
  totalTreinamentoHoras: number;
  totalInvestimento: number;
  totalPositivacoes: number;
  totalComissoes: number;
  metaVGV: number;
  brokers: BrokerSummary[];
}

export interface DashboardIndividual {
  broker: { id: string; name: string; team: string };
  isParceria?: boolean;
  parceriaId?: string;
  vgvRealizado: number;
  metaVGVMensal: number;
  metaVGVMensalAcumulada: number;
  captacoes: number;
  metaCaptacoes: number;
  captExclusivas: number;
  metaCaptExclusivas: number;
  negociosVGV: number;
  metaNegocios: number;
  treinamentoHoras: number;
  metaTreinamento: number;
  investimentoValor: number;
  metaInvestimento: number;
  positivacoes: number;
  metaPositivacao: number;
  comissaoTotal: number;
  comentario?: string;
}

export interface DashboardIndividualYearly {
  broker: { id: string; name: string; team: string };
  isParceria?: boolean;
  vgvRealizado: number;
  metaVGVAnual: number;
  captacoes: number;
  metaCaptacoes: number;
  captExclusivas: number;
  metaCaptExclusivas: number;
  negociosVGV: number;
  metaNegocios: number;
  treinamentoHoras: number;
  metaTreinamento: number;
  investimentoValor: number;
  metaInvestimento: number;
  positivacoes: number;
  metaPositivacao: number;
  comissaoTotal: number;
}

export interface RankingItem {
  position: number;
  brokerId: string;
  name: string;
  team: string;
  vgvRealizado: number;
  captacoes: number;
  negocios: number;
  treinamentoHoras: number;
  investimento: number;
  positivacoes: number;
  isParceria?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RoiEntry {
  brokerId: string;
  brokerName: string;
  receita: number;
  investimento: number;
  roi: number | null; // decimal ratio — 2.5 means 250%. null means zero investimento in period
}
