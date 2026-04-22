import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthTabs } from '../components/ui/MonthTabs';
import { StatsGrid } from '../components/ui/StatsGrid';
import { StatCard } from '../components/ui/StatCard';
import { DataSection } from '../components/ui/DataSection';
import { RankingCard } from '../components/ranking/RankingCard';
import { RankingItem } from '../components/ranking/RankingItem';
import { dashboardService } from '../services/dashboard.service';
import { CURRENT_YEAR } from '../config/constants';
import { fmt } from '../utils/formatters';
import { RankingItem as RankingItemType, RoiEntry } from '../types';
import { Users } from 'lucide-react';

export default function RankingPage() {
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<RankingItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [roi, setRoi] = useState<RoiEntry[]>([]);

  useEffect(() => {
    setLoading(true);
    dashboardService.ranking(month, year)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => {
    const controller = new AbortController();
    setRoi([]);
    dashboardService.roi(month, year, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setRoi(result); })
      .catch((err) => { if (err.name !== 'CanceledError' && err.name !== 'AbortError') console.error(err); });
    return () => controller.abort();
  }, [month, year]);

  const roiByBroker = new Map(roi.map((r) => [r.brokerId, r.roi]));

  const totalVGV = data.reduce((s, r) => s + r.vgvRealizado, 0);
  const totalCaptacoes = data.reduce((s, r) => s + r.captacoes, 0);
  const totalNegocios = data.reduce((s, r) => s + r.negocios, 0);

  return (
    <div>
      <PageHeader title="Ranking de Performance" description="Comparativo entre corretores" />
      <MonthTabs activeMonth={month} onSelect={setMonth} activeYear={year} onYearChange={setYear} />

      {loading ? <div className="text-center py-16 text-gray-400">Carregando...</div> : (
        <>
          <StatsGrid>
            <StatCard label="VGV Total" value={fmt(totalVGV)} />
            <StatCard label="Total Captações" value={String(totalCaptacoes)} />
            <StatCard label="Total Negócios" value={String(totalNegocios)} />
          </StatsGrid>

          <RankingCard>
            {data.map(r => (
              <RankingItem
                key={r.brokerId}
                position={r.position}
                name={r.name}
                team={r.isParceria ? '' : r.team}
                stats={[
                  { label: 'VGV', value: fmt(r.vgvRealizado) },
                  { label: 'Captações', value: String(r.captacoes) },
                  { label: 'Negócios', value: String(r.negocios) },
                ]}
              />
            ))}
          </RankingCard>

          <DataSection title="Comparativo Detalhado">
            <table className="w-full border-collapse">
              <thead><tr>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">#</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Corretor</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">VGV Realizado</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Captações</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Negócios</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Treinamentos (h)</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Investimento</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Positivação</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-right px-6 py-3.5 bg-gray-50 border-b border-gray-200">ROI</th>
              </tr></thead>
              <tbody>
                {data.map(r => (
                  <tr key={r.brokerId} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 text-sm border-b border-gray-100 font-mono font-bold text-gray-400">{r.position}</td>
                    <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700 font-semibold">
                      <span className="flex items-center gap-1.5">
                        {r.isParceria && <Users size={14} className="text-gray-400 flex-shrink-0" />}
                        {r.name}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{fmt(r.vgvRealizado)}</td>
                    <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{r.captacoes}</td>
                    <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{r.negocios}</td>
                    <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{r.treinamentoHoras}h</td>
                    <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{fmt(r.investimento)}</td>
                    <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{r.positivacoes}</td>
                    <td className="px-6 py-3.5 text-sm border-b border-gray-100 font-mono text-right">
                      {(() => {
                        const v = roiByBroker.get(r.brokerId);
                        if (v === undefined || v === null) {
                          return (
                            <span
                              title="sem investimento no período"
                              aria-label="sem investimento no período"
                              className="text-gray-400 cursor-help"
                            >
                              —
                            </span>
                          );
                        }
                        const cls = v > 0 ? 'text-positive font-semibold' : v < 0 ? 'text-negative font-semibold' : 'text-gray-700';
                        return <span className={cls}>{(v * 100).toFixed(2)}%</span>;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataSection>
        </>
      )}
    </div>
  );
}
