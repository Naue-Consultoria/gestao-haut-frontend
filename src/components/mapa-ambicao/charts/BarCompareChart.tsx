import { fmtBRL } from '../../../utils/mapaCalc';

interface BarCompareChartProps {
  atual: number;
  necessario: number;
  title?: string;
}

export function BarCompareChart({ atual, necessario, title }: BarCompareChartProps) {
  const isEmpty = atual === 0 && necessario === 0;
  const maxVal = Math.max(1, necessario);
  const atualPct = Math.min(100, (atual / maxVal) * 100);
  const diferenca = Math.max(0, necessario - atual);

  return (
    <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow min-h-[320px]">
      {title && (
        <h3 className="text-[15px] font-semibold tracking-tight mb-4 text-gray-900">{title}</h3>
      )}

      {isEmpty ? (
        <div className="flex items-center justify-center min-h-[220px]">
          <p className="text-sm text-gray-500 text-center">
            Preencha Estilo de Vida e Estratificação para visualizar
          </p>
        </div>
      ) : (
        <>
          {/* Atual bar */}
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Patrimônio Atual
            </span>
            <span className="text-xs text-gray-500">{fmtBRL(atual)}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: atualPct + '%', background: '#a41925' }}
            />
          </div>

          {/* Necessario bar */}
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Patrimônio Necessário
            </span>
            <span className="text-xs text-gray-500">{fmtBRL(necessario)}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: '100%', background: '#e5e5e5' }}
            />
          </div>

          {/* Diferença footer */}
          <div className="mt-2 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Diferença a Acumular</span>
            <span className="text-sm font-semibold text-gray-700">
              {diferenca > 0 ? fmtBRL(diferenca) : '—'}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
