import { DataSection } from '../ui/DataSection';
import { RoiEntry } from '../../types';
import { fmt } from '../../utils/formatters';

interface RoiTableProps {
  title: string;
  period: string;
  data: RoiEntry[];
  loading: boolean;
}

// ROI display: backend returns decimal ratio (2.5 = 250%, -0.5 = -50%). Multiply by 100 + 2 decimal places + %.
// Negative values preserve the minus sign via JS number formatting. null means zero investimento in period — rendered as "—" at call site.
function formatRoiPct(roi: number): string {
  return (roi * 100).toFixed(2) + '%';
}

function roiColorClass(roi: number): string {
  if (roi > 0) return 'text-positive';
  if (roi < 0) return 'text-negative';
  return 'text-gray-700';
}

export function RoiTable({ title, period, data, loading }: RoiTableProps) {
  if (loading) {
    return (
      <DataSection title={title} badge={period}>
        <div className="text-center py-10 text-sm text-gray-400">Carregando...</div>
      </DataSection>
    );
  }

  const safeData = data ?? [];

  if (safeData.length === 0) {
    return (
      <DataSection title={title} badge={period}>
        <div className="text-center py-10 text-sm text-gray-400">
          Nenhum corretor com atividade neste período
        </div>
      </DataSection>
    );
  }

  return (
    <DataSection title={title} badge={period}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-12 text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-center px-6 py-3.5 bg-gray-50 border-b border-gray-200 whitespace-nowrap"
              >
                #
              </th>
              <th
                scope="col"
                className="min-w-[160px] text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200 whitespace-nowrap"
              >
                Corretor
              </th>
              <th
                scope="col"
                className="min-w-[140px] text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-right px-6 py-3.5 bg-gray-50 border-b border-gray-200 whitespace-nowrap"
              >
                Receita
              </th>
              <th
                scope="col"
                className="min-w-[140px] text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-right px-6 py-3.5 bg-gray-50 border-b border-gray-200 whitespace-nowrap"
              >
                Investimento
              </th>
              <th
                scope="col"
                className="min-w-[100px] text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-right px-6 py-3.5 bg-gray-50 border-b border-gray-200 whitespace-nowrap"
              >
                ROI
              </th>
            </tr>
          </thead>
          <tbody>
            {safeData.map((entry, idx) => {
              const rank = idx + 1;
              const rankClass =
                rank === 1
                  ? 'text-accent font-mono font-bold text-xs text-center'
                  : 'text-gray-400 font-mono font-bold text-xs text-center';
              return (
                <tr
                  key={entry.brokerId}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <td className={`px-6 py-3.5 ${rankClass}`}>#{rank}</td>
                  <td className="px-6 py-3.5 font-semibold text-[15px] text-gray-700">
                    {entry.brokerName}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-700 font-mono text-right">
                    {fmt(entry.receita)}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-700 font-mono text-right">
                    {fmt(entry.investimento)}
                  </td>
                  <td className="px-6 py-3.5 text-sm font-mono text-right">
                    {entry.roi === null ? (
                      <span
                        title="sem investimento no período"
                        aria-label="sem investimento no período"
                        className="text-gray-400 cursor-help"
                      >
                        —
                      </span>
                    ) : (
                      <span className={`${entry.roi === 0 ? '' : 'font-semibold'} ${roiColorClass(entry.roi)}`}>
                        {formatRoiPct(entry.roi)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DataSection>
  );
}
