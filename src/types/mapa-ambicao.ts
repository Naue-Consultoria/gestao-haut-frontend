// Rastreamento row
export interface TrackingRow {
  data: string;          // ISO date string "YYYY-MM-DD"
  patrimonio: number;    // raw numeric value
  notas: string;
}

// Timeline action row
export interface ActionRow {
  descricao: string;
  prazo: string;         // free-text, e.g. "Mar/2027"
  status: '' | 'pendente' | 'andamento' | 'concluido';
}

// Expense item (Phase 5 — declare now, leave undefined in Phase 4)
export interface ExpenseItem {
  value: number;
  obs: string;
}

// Full dados JSONB shape — covers ALL 6 tabs (forward-compatible with Phase 5)
export interface MapaDados {
  // --- Tab: Propósito e Visão ---
  p1Visao: string;
  p1Atividades: string;
  p1Legado: string;
  p1Causas: string;
  p1Dia: string;

  // --- Tab: Estilo de Vida (Phase 5) ---
  expenses: Record<string, number>;      // keyed by expense item id
  expenseObs: Record<string, string>;    // keyed by expense item id

  // --- Tab: Estratificação do Patrimônio (Phase 5) ---
  assets: Record<string, number>;        // keyed by asset category id
  patObservacoes: string;

  // --- Tab: Rastreamento ---
  tracking: TrackingRow[];
  refAprendizado: string;
  refProximos: string;

  // --- Tab: Plano de Ação ---
  p3Negocio: string;
  p3Acoes: string;
  p3Depois: string;
  p3Limites: string;
  pfMeta1: number;       // Curto Prazo (Ano 1) patrimônio target
  pfMeta3: number;       // Médio Prazo (Ano 3) patrimônio target
  actionsShort: ActionRow[];
  actionsMedium: ActionRow[];
  actionsLong: ActionRow[];
}

// Full API record (matches backend MapaAmbicao type)
export interface MapaAmbicao {
  id: string;
  broker_id: string;
  dados: MapaDados;
  status: 'vazio' | 'parcial' | 'preenchido';
  created_at: string;
  updated_at: string;
}

export function emptyMapaDados(): MapaDados {
  return {
    p1Visao: '', p1Atividades: '', p1Legado: '', p1Causas: '', p1Dia: '',
    expenses: {}, expenseObs: {},
    assets: {}, patObservacoes: '',
    tracking: [{ data: '', patrimonio: 0, notas: '' }],
    refAprendizado: '', refProximos: '',
    p3Negocio: '', p3Acoes: '', p3Depois: '', p3Limites: '',
    pfMeta1: 0, pfMeta3: 0,
    actionsShort: [{ descricao: '', prazo: '', status: '' }],
    actionsMedium: [{ descricao: '', prazo: '', status: '' }],
    actionsLong: [{ descricao: '', prazo: '', status: '' }],
  };
}
