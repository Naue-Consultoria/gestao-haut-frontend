import { ORIGENS } from '../config/constants';

export function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return 'R$ 0,00';
  return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export function fmtNumber(n: number): string {
  return Number(n).toLocaleString('pt-BR');
}

export function labelOrigem(value: string): string {
  return ORIGENS.find(o => o.value === value)?.label ?? value;
}
