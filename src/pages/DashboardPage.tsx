import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthTabs } from '../components/ui/MonthTabs';
import { StatsGrid } from '../components/ui/StatsGrid';
import { StatCard } from '../components/ui/StatCard';
import { DataSection } from '../components/ui/DataSection';
import { DataTable } from '../components/ui/DataTable';
import { BarChart } from '../components/ui/BarChart';
import { Indicator } from '../components/ui/Indicator';
import { dashboardService } from '../services/dashboard.service';
import { MONTHS, CURRENT_YEAR } from '../config/constants';
import { fmt, fmtPct } from '../utils/formatters';
import { DashboardConsolidated, RoiEntry } from '../types';
import { Users } from 'lucide-react';
import { RoiTable } from '../components/ranking/RoiTable';

export default function DashboardPage() {
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<DashboardConsolidated | null>(null);
  const [yearly, setYearly] = useState<DashboardConsolidated | null>(null);
  const [evolution, setEvolution] = useState<{ month: number; meta: number; realizado: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  // ROI Phase 2 — covers ROI-01, ROI-02, ROI-07. Initial loading = false because
  // cards only fetch when the relevant tab is active (mirrors consolidated/yearly pattern).
  const [roi, setRoi] = useState<RoiEntry[]>([]);
  const [roiYearly, setRoiYearly] = useState<RoiEntry[]>([]);
  const [roiLoading, setRoiLoading] = useState(false);
  const [roiYearlyLoading, setRoiYearlyLoading] = useState(false);

  // Evolution only depends on year (cached across month changes)
  useEffect(() => {
    setEvolution([]);
    dashboardService.consolidatedEvolution(year)
      .then(setEvolution)
      .catch(console.error);
  }, [year]);

  // Consolidated data depends on month + year (only when month is selected)
  useEffect(() => {
    if (month === -1) return;
    setLoading(true);
    dashboardService.consolidated(month, year)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year]);

  // Monthly ROI — fetches only when a specific month is selected
  useEffect(() => {
    if (month === -1) return;
    const controller = new AbortController();
    setRoi([]);
    setRoiLoading(true);
    dashboardService.roi(month, year, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setRoi(result); })
      .catch((err) => { if (err.name !== 'CanceledError' && err.name !== 'AbortError') console.error(err); })
      .finally(() => { if (!controller.signal.aborted) setRoiLoading(false); });
    return () => controller.abort();
  }, [month, year]);

  // Yearly consolidated (only when "Anual" tab is active)
  useEffect(() => {
    if (month !== -1) return;
    setYearlyLoading(true);
    setYearly(null);
    dashboardService.consolidatedYearly(year)
      .then(setYearly)
      .catch(console.error)
      .finally(() => setYearlyLoading(false));
  }, [month, year]);

  // Yearly ROI — fetches only when "Anual" tab is active
  useEffect(() => {
    if (month !== -1) return;
    const controller = new AbortController();
    setRoiYearlyLoading(true);
    setRoiYearly([]);
    dashboardService.roiYearly(year, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setRoiYearly(result); })
      .catch((err) => { if (err.name !== 'CanceledError' && err.name !== 'AbortError') console.error(err); })
      .finally(() => { if (!controller.signal.aborted) setRoiYearlyLoading(false); });
    return () => controller.abort();
  }, [month, year]);

  // MD-02: clear stale yearly ROI when switching back to a monthly tab
  useEffect(() => {
    if (month !== -1) setRoiYearly([]);
  }, [month]);

  const chartData = evolution.length > 0
    ? evolution.map(e => ({ meta: e.meta, realizado: e.realizado }))
    : Array.from({ length: 12 }, () => ({ meta: 0, realizado: 0 }));

  const renderBrokerTable = (brokers: DashboardConsolidated['brokers']) => (
    <DataSection title="Resumo por Corretor">
      <DataTable
        columns={[
          { key: 'name', label: 'Corretor', render: (v, row) => (
            <strong className="flex items-center gap-1.5">
              {(row as any).isParceria && <Users size={14} className="text-gray-400 flex-shrink-0" />}
              {String(v)}
            </strong>
          )},
          { key: 'metaAnual', label: 'Meta Anual', render: (v) => fmt(Number(v)) },
          { key: 'realizado', label: 'Realizado', render: (v) => <strong>{fmt(Number(v))}</strong> },
          { key: 'percentual', label: '% Atingido', render: (v) => {
            const pct = Number(v);
            const color = pct >= 0.08 ? 'green' : pct >= 0.04 ? 'yellow' : 'red';
            return <Indicator value={fmtPct(pct)} dotColor={color as 'green' | 'yellow' | 'red'} />;
          }},
          { key: 'desvio', label: 'Desvio', render: (v) => fmt(Number(v)) },
        ]}
        data={(brokers || []).map(b => ({ ...b }))}
      />
    </DataSection>
  );

  return (
    <div>
      <PageHeader title="Painel Consolidado" description="Visão geral de performance — todos os corretores" />
      <MonthTabs activeMonth={month} onSelect={setMonth} activeYear={year} onYearChange={setYear} showYearlyTab />

      {month === -1 ? (
        yearlyLoading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : yearly ? (
          <>
            <StatsGrid>
              <StatCard label="Meta Total Anual" value={fmt(yearly.metaVGV)} />
              <StatCard
                label="Realizado Anual"
                value={fmt(yearly.totalVGV)}
                change={`${fmtPct(yearly.metaVGV > 0 ? yearly.totalVGV / yearly.metaVGV : 0)} da meta`}
                changeType={yearly.totalVGV >= yearly.metaVGV ? 'positive' : 'negative'}
              />
              <StatCard label="Negócios" value={String(yearly.totalNegocios)} />
              <StatCard label="Captações" value={String(yearly.totalCaptacoes)} />
            </StatsGrid>

            <RoiTable
              title="ROI Anual"
              period={String(year)}
              data={roiYearly}
              loading={roiYearlyLoading}
            />

            <BarChart data={chartData} title="Meta × Realizado Mensal" />

            {renderBrokerTable(yearly.brokers)}
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">Nenhum dado encontrado</div>
        )
      ) : loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : data && (
        <>
          <StatsGrid>
            <StatCard label="Meta Total Anual" value={fmt(data.metaVGV)} />
            <StatCard label="Realizado Acumulado" value={fmt(data.totalVGV)} />
            <StatCard label={`Negócios em ${MONTHS[month]}`} value={String(data.totalNegocios)} />
            <StatCard label={`Captações em ${MONTHS[month]}`} value={String(data.totalCaptacoes)} />
          </StatsGrid>

          <RoiTable
            title="ROI Mensal"
            period={`${MONTHS[month]} ${year}`}
            data={roi}
            loading={roiLoading}
          />

          <BarChart data={chartData} title="Meta × Realizado Mensal" highlightIndex={month} />

          {renderBrokerTable(data.brokers)}
        </>
      )}
    </div>
  );
}
