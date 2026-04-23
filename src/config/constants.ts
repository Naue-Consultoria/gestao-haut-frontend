export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const MONTHS_SHORT = MONTHS.map(m => m.substring(0, 3));

export const ORIGENS: { value: string; label: string }[] = [
  { value: 'RELACIONAMENTO', label: 'Relacionamento' },
  { value: 'PATROCINADO', label: 'Patrocinado' },
  { value: 'CORRETOR_EXTERNO', label: 'Corretor Externo' },
  { value: 'CORRETOR_INTERNO', label: 'Corretor Interno' },
  { value: 'CLIENTE_DE_CARTEIRA', label: 'Cliente de Carteira' },
  { value: 'PROSPECCAO_ATIVA', label: 'Prospecção Ativa' },
  { value: 'PORTAL', label: 'Portal' },
  { value: 'PLANTAO_HAUT', label: 'Plantão Haut' },
  { value: 'GRUPO_CORRETORES_WHATSAPP', label: 'Grupo de Corretores (WhatsApp)' },
];

export const INVESTIMENTO_TIPOS: { value: string; label: string }[] = [
  { value: 'PORTAL', label: 'Portal' },
  { value: 'PATROCINADO', label: 'Patrocinado' },
  { value: 'CURSO', label: 'Curso' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'PRESENTE_CLIENTE', label: 'Presente Cliente' },
  { value: 'BRINDE', label: 'Brinde' },
  { value: 'OUTRO', label: 'Outro' },
];

export const PLANO_STATUS: { value: string; label: string }[] = [
  { value: 'PLANEJADO', label: 'Planejado' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
];

export const CURRENT_YEAR = 2026;
