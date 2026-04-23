import { useMemo } from 'react';
import { MapaDados } from '../../../types/mapa-ambicao';
import {
  EXPENSE_SECTIONS,
  EXPENSE_CATEGORY_COLORS,
  calcCustoAnual,
  calcExpenseByCategory,
  calcPatrimonioAtual,
  calcPatrimonioNecessario,
  calcProgressoPct,
  calcDiferenca,
  calcTempoEstimado,
  fmtBRL,
  fmtInput,
  parseBRL,
} from '../../../utils/mapaCalc';
import { DonutChart, DonutSegment } from '../charts/DonutChart';
import { BarCompareChart } from '../charts/BarCompareChart';

interface DashboardTabProps {
  dados: MapaDados;
  onChange: (patch: Partial<MapaDados>) => void;
}

interface KpiDef {
  label: string;
  value: string;
  subtitle: string;
  valueClass?: string;
}

export function DashboardTab({ dados, onChange }: DashboardTabProps) {
  const expenses = dados.expenses || {};
  const assets = dados.assets || {};
  const rendaAnual = dados.rendaAnual || 0;

  const custoAnual = useMemo(() => calcCustoAnual(expenses), [expenses]);
  const patrimonioAtual = useMemo(() => calcPatrimonioAtual(assets), [assets]);
  const patrimonioNecessario = useMemo(
    () => (custoAnual > 0 ? calcPatrimonioNecessario(custoAnual) : 0),
    [custoAnual]
  );
  const progressoPct = useMemo(
    () => calcProgressoPct(patrimonioAtual, patrimonioNecessario),
    [patrimonioAtual, patrimonioNecessario]
  );
  const diferenca = useMemo(
    () => calcDiferenca(patrimonioNecessario, patrimonioAtual),
    [patrimonioNecessario, patrimonioAtual]
  );
  const tempoEstimado = useMemo(
    () => calcTempoEstimado(diferenca, rendaAnual),
    [diferenca, rendaAnual]
  );

  const progressoColor =
    patrimonioNecessario <= 0
      ? 'text-gray-900'
      : progressoPct >= 100
      ? 'text-green-500'
      : progressoPct >= 50
      ? 'text-amber-500'
      : 'text-red-500';

  const kpis: KpiDef[] = [
    {
      label: 'Custo Anual da Vida Ideal',
      value: custoAnual > 0 ? fmtBRL(custoAnual) : '—',
      subtitle: 'Soma de todas as despesas anuais',
    },
    {
      label: 'Patrimônio Necessário',
      value: custoAnual > 0 ? fmtBRL(patrimonioNecessario) : '—',
      subtitle: 'Para viver de renda a 6% a.a.',
    },
    {
      label: 'Patrimônio Atual',
      value: fmtBRL(patrimonioAtual),
      subtitle: 'Soma dos ativos declarados',
    },
    {
      label: 'Progresso',
      value: patrimonioNecessario > 0 ? progressoPct.toFixed(1) + '%' : '0%',
      subtitle: 'Atual / Necessário',
      valueClass: progressoColor,
    },
    {
      label: 'Diferença a Acumular',
      value: custoAnual > 0 ? fmtBRL(diferenca) : '—',
      subtitle: 'Necessário − Atual',
    },
    {
      label: 'Tempo Estimado',
      value: tempoEstimado !== null ? tempoEstimado.toFixed(1) + ' anos' : '—',
      subtitle: 'Diferença / Renda Anual',
    },
  ];

  // Build DonutChart segments from EXPENSE_SECTIONS (ordered + titled)
  const expenseByCat = useMemo(() => calcExpenseByCategory(expenses), [expenses]);
  const donutSegments: DonutSegment[] = useMemo(() => {
    const segs: DonutSegment[] = [];
    const seen = new Set<string>();
    for (const section of EXPENSE_SECTIONS) {
      if (seen.has(section.cat)) continue;
      seen.add(section.cat);
      const val = expenseByCat[section.cat] ?? 0;
      if (val > 0) {
        segs.push({
          label: section.title,
          value: val,
          color: EXPENSE_CATEGORY_COLORS[section.cat] ?? '#737373',
        });
      }
    }
    return segs;
  }, [expenseByCat]);

  return (
    <>
      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-6 mb-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-[12px] p-6 shadow"
          >
            <div className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500 mb-1">
              {kpi.label}
            </div>
            <div
              className={`text-[28px] font-semibold tracking-tight leading-tight ${
                kpi.valueClass ?? 'text-gray-900'
              }`}
            >
              {kpi.value}
            </div>
            <p className="text-xs text-gray-400 mt-1">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Renda Anual input card */}
      <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow mb-6">
        <div className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500 mb-1">
          Dado Complementar
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Renda Anual</h3>
        <p className="text-sm text-gray-500 mb-4">
          Informe sua renda anual estimada para calcular o Tempo Estimado de acumulação.
        </p>
        <div className="flex items-center gap-4 max-w-xs">
          <input
            type="text"
            value={fmtInput(rendaAnual)}
            onChange={(e) => onChange({ rendaAnual: parseBRL(e.target.value) })}
            placeholder="R$ 0,00"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-sm text-sm font-main outline-none focus:border-gray-400 focus:bg-white text-right transition-all"
          />
        </div>
      </div>

      {/* Chart grid */}
      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        <DonutChart segments={donutSegments} title="Composição de Despesas" />
        <BarCompareChart
          atual={patrimonioAtual}
          necessario={patrimonioNecessario}
          title="Patrimônio: Atual vs. Necessário"
        />
      </div>
    </>
  );
}
