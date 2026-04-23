// ─────────────────────────────────────────────────────────────────
// mapaCalc.ts — Mapa de Ambição: constants, formulas, formatters
// Zero external imports. Pure TypeScript/ESNext module.
// ─────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────

export interface ExpenseSectionItem {
  id: string;
  label: string;
  type: 'monthly' | 'annual' | 'travel';
  cat: string;
}

export interface ExpenseSection {
  title: string;
  cat: string;
  items: ExpenseSectionItem[];
}

export interface AssetCategory {
  id: string;
  label: string;
  color: string;
}

// ── Constants ─────────────────────────────────────────────────────

export const EXPENSE_SECTIONS: ExpenseSection[] = [
  {
    title: 'Despesas Básicas de Alto Padrão',
    cat: 'basicas',
    items: [
      { id: 'moradia',     label: 'Moradia (aluguel/manutenção, impostos, funcionários)', type: 'monthly', cat: 'basicas' },
      { id: 'contas',      label: 'Contas (água, luz, gás, internet, segurança)',          type: 'monthly', cat: 'basicas' },
      { id: 'alimentacao', label: 'Alimentação e Bebidas Premium',                          type: 'monthly', cat: 'basicas' },
      { id: 'transporte',  label: 'Transporte (combustível, manutenção, motorista)',        type: 'monthly', cat: 'basicas' },
      { id: 'seguros',     label: 'Seguros (residencial, veículos, vida)',                  type: 'monthly', cat: 'basicas' },
    ],
  },
  {
    title: 'Saúde e Bem-estar',
    cat: 'saude',
    items: [
      { id: 'saude-plano',       label: 'Planos de Saúde Premium',                         type: 'monthly', cat: 'saude' },
      { id: 'saude-tratamentos', label: 'Tratamentos e Procedimentos Médicos',              type: 'monthly', cat: 'saude' },
      { id: 'saude-personal',    label: 'Personal Trainer e Academia',                      type: 'monthly', cat: 'saude' },
      { id: 'saude-terapia',     label: 'Terapias (psicológica, coaching, etc.)',           type: 'monthly', cat: 'saude' },
      { id: 'saude-spa',         label: 'Spa, Massagem e Bem-estar',                        type: 'monthly', cat: 'saude' },
    ],
  },
  {
    title: 'Viagens e Lazer',
    cat: 'viagens',
    items: [
      { id: 'viagem-int', label: 'Viagens internacionais',                                  type: 'travel',  cat: 'viagens' },
      { id: 'viagem-nac', label: 'Viagens nacionais',                                       type: 'travel',  cat: 'viagens' },
      { id: 'lazer',      label: 'Lazer e Entretenimento (cinemas, shows, etc.)',            type: 'monthly', cat: 'viagens' },
    ],
  },
  {
    title: 'Filantropia e Legado',
    cat: 'filantropia',
    items: [
      { id: 'filantropia', label: 'Doações e Investimentos em Causas Sociais', type: 'monthly', cat: 'filantropia' },
    ],
  },
  {
    title: 'Hobbies e Paixões',
    cat: 'hobbies',
    items: [
      { id: 'hobbies', label: 'Carros, Barcos, Arte, Vinhos, Esportes', type: 'monthly', cat: 'hobbies' },
    ],
  },
  {
    title: 'Família e Educação',
    cat: 'familia',
    items: [
      { id: 'educacao', label: 'Educação dos Filhos (escolas, cursos, etc.)', type: 'monthly', cat: 'familia' },
      { id: 'familia',  label: 'Ajuda a Familiares',                          type: 'monthly', cat: 'familia' },
    ],
  },
  {
    title: 'Fundo para Loucuras',
    cat: 'loucuras',
    items: [
      { id: 'loucuras', label: 'Desejos e Compras Não Planejadas (valor anual)', type: 'annual', cat: 'loucuras' },
    ],
  },
];

export const ASSET_CATEGORIES: AssetCategory[] = [
  { id: 'imoveis',       label: 'Imóveis',                                          color: '#022c22' },
  { id: 'investimentos', label: 'Investimentos Bancários (CDB, LCI, Fundos)',       color: '#014d3a' },
  { id: 'acoes',         label: 'Ações e Renda Variável',                            color: '#047857' },
  { id: 'saldos',        label: 'Saldos em Contas (corrente, poupança)',             color: '#00B74F' },
  { id: 'societaria',    label: 'Participação Societária / Empresas',               color: '#34d399' },
  { id: 'veiculos',      label: 'Veículos (carros, motos, embarcações)',             color: '#6ee7b7' },
  { id: 'previdencia',   label: 'Previdência Privada',                              color: '#a7f3d0' },
  { id: 'outros',        label: 'Outros Ativos (arte, joias, coleções, etc.)',      color: '#d1fae5' },
];

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  basicas:     '#a41925',
  saude:       '#dc2626',
  viagens:     '#2563eb',
  filantropia: '#7c3aed',
  hobbies:     '#d97706',
  familia:     '#059669',
  loucuras:    '#0891b2',
};

// ── Internal helpers ───────────────────────────────────────────────

type ItemType = 'monthly' | 'annual' | 'travel';

function itemAnnual(expenses: Record<string, number>, id: string, type: ItemType): number {
  if (type === 'monthly') return (expenses[id] ?? 0) * 12;
  if (type === 'annual')  return expenses[id] ?? 0;
  if (type === 'travel')  return (expenses[id + '-qtd'] ?? 0) * (expenses[id + '-custo'] ?? 0);
  return 0;
}

// ── Formulas ──────────────────────────────────────────────────────

export function calcCustoAnual(expenses: Record<string, number>): number {
  return EXPENSE_SECTIONS.flatMap(s => s.items).reduce((sum, item) =>
    sum + itemAnnual(expenses, item.id, item.type), 0);
}

export function calcExpenseByCategory(expenses: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const section of EXPENSE_SECTIONS) {
    const cat = section.cat;
    result[cat] = (result[cat] ?? 0) + section.items.reduce((s, item) =>
      s + itemAnnual(expenses, item.id, item.type), 0);
  }
  return result;
}

export function calcPatrimonioAtual(assets: Record<string, number>): number {
  return ASSET_CATEGORIES.reduce((sum, a) => sum + (assets[a.id] ?? 0), 0);
}

export function calcPatrimonioNecessario(custoAnual: number): number {
  return custoAnual / 0.06;
}

export function calcProgressoPct(atual: number, necessario: number): number {
  if (necessario <= 0) return 0;
  return (atual / necessario) * 100;
}

export function calcDiferenca(necessario: number, atual: number): number {
  return Math.max(0, necessario - atual);
}

export function calcTempoEstimado(diferenca: number, rendaAnual: number): number | null {
  if (rendaAnual <= 0) return null;
  const result = diferenca / rendaAnual;
  if (!isFinite(result)) return null;
  return result;
}

// ── Formatters ────────────────────────────────────────────────────

export function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseBRL(raw: string): number {
  // Remove everything except digits and commas, then replace ALL commas with dot
  const cleaned = raw.replace(/[^\d,]/g, '').replace(/,/g, '.');
  // If more than one dot remains (e.g. "1.234.567"), keep only the last one as decimal
  const lastDot = cleaned.lastIndexOf('.');
  const normalized =
    lastDot === -1
      ? cleaned
      : cleaned.slice(0, lastDot).replace(/\./g, '') + '.' + cleaned.slice(lastDot + 1);
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

export function fmtInput(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '';
  // Show "0,00" for zero so the controlled input is never blank
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
