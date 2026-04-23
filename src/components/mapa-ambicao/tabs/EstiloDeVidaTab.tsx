import { MapaDados } from '../../../types/mapa-ambicao';
import { CurrencyInput } from '../../ui/CurrencyInput';
import {
  EXPENSE_SECTIONS,
  ExpenseSectionItem,
  calcCustoAnual,
  calcPatrimonioNecessario,
  fmtBRL,
} from '../../../utils/mapaCalc';

interface EstiloDeVidaTabProps {
  dados: MapaDados;
  onChange: (patch: Partial<MapaDados>) => void;
}

const inputClass = 'w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-sm font-main outline-none transition-all focus:border-gray-400 focus:bg-white text-right';
const inputClassSmall = 'w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-sm font-main outline-none transition-all focus:border-gray-400 focus:bg-white';

function computeItemAnnual(expenses: Record<string, number>, item: ExpenseSectionItem): number {
  if (item.type === 'monthly') return (expenses[item.id] ?? 0) * 12;
  if (item.type === 'annual') return expenses[item.id] ?? 0;
  if (item.type === 'travel') return (expenses[item.id + '-qtd'] ?? 0) * (expenses[item.id + '-custo'] ?? 0);
  return 0;
}

export function EstiloDeVidaTab({ dados, onChange }: EstiloDeVidaTabProps) {
  const expenses = dados.expenses || {};
  const expenseObs = dados.expenseObs || {};
  const custoAnual = calcCustoAnual(expenses);
  const patrimonioNecessario = custoAnual > 0 ? calcPatrimonioNecessario(custoAnual) : 0;

  const updateExpense = (key: string, value: number) => {
    onChange({ expenses: { ...expenses, [key]: value } });
  };

  const updateObs = (key: string, value: string) => {
    onChange({ expenseObs: { ...expenseObs, [key]: value } });
  };

  return (
    <>
      {EXPENSE_SECTIONS.map((section) => {
        const isLoucuras = section.cat === 'loucuras';
        const monthlyHeader = isLoucuras ? 'Valor Anual (R$)' : 'Mensal (R$)';

        return (
          <div
            key={section.cat}
            className="bg-white border border-gray-200 rounded-[12px] shadow mb-4"
          >
            {/* Section header */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-[12px]">
              <span className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-600">
                {section.title}
              </span>
            </div>

            {/* Column header */}
            <div className="grid grid-cols-[1fr_200px_180px_200px] gap-x-5 px-6 py-2 border-b border-gray-100 text-[10px] font-semibold tracking-widest uppercase text-gray-400">
              <span>Despesa</span>
              <span>{monthlyHeader}</span>
              <span className="pl-2">Anual (R$)</span>
              <span>Observações</span>
            </div>

            {/* Rows */}
            {section.items.map((item) => {
              const annual = computeItemAnnual(expenses, item);
              const annualDisplay = annual > 0 ? fmtBRL(annual) : '—';

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_200px_180px_200px] gap-x-5 px-6 py-3 border-b border-gray-100 last:border-0 items-center"
                >
                  <span className="text-sm text-gray-700 pr-4">{item.label}</span>

                  {item.type === 'travel' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={expenses[item.id + '-qtd'] ?? 0}
                        onChange={(e) => updateExpense(item.id + '-qtd', Number(e.target.value) || 0)}
                        placeholder="Qtd/ano"
                        className="w-14 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-sm text-center outline-none focus:border-gray-400 focus:bg-white"
                      />
                      <span className="text-gray-400 text-xs">×</span>
                      <CurrencyInput
                        value={expenses[item.id + '-custo'] ? String(expenses[item.id + '-custo']) : ''}
                        onChange={(raw) => updateExpense(item.id + '-custo', Number(raw) || 0)}
                        placeholder="0,00"
                        className="w-24 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-sm outline-none focus:border-gray-400 focus:bg-white text-right"
                      />
                    </div>
                  ) : (
                    <CurrencyInput
                      value={expenses[item.id] ? String(expenses[item.id]) : ''}
                      onChange={(raw) => updateExpense(item.id, Number(raw) || 0)}
                      placeholder="0,00"
                      className={inputClass}
                    />
                  )}

                  <span className="pl-2 text-sm text-gray-700 font-medium">{annualDisplay}</span>

                  <input
                    type="text"
                    value={expenseObs[item.id] ?? ''}
                    onChange={(e) => updateObs(item.id, e.target.value)}
                    placeholder="Obs..."
                    className={inputClassSmall}
                  />
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Total Banner */}
      <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow mt-4">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Custo Anual Total da Vida Ideal</span>
          <span className="text-[15px] font-semibold text-gray-900">
            {custoAnual > 0 ? fmtBRL(custoAnual) : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-gray-700">Patrimônio Necessário</span>
            <p className="text-xs text-gray-400 mt-0.5">Para viver dos rendimentos a 6% a.a.</p>
          </div>
          <span className="text-[15px] font-semibold text-gray-900">
            {custoAnual > 0 ? fmtBRL(patrimonioNecessario) : '—'}
          </span>
        </div>
      </div>
    </>
  );
}
