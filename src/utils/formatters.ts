export function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return 'R$ 0';
  return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export function fmtNumber(n: number): string {
  return Number(n).toLocaleString('pt-BR');
}
