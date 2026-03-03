import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthTabs } from '../components/ui/MonthTabs';
import { StatsGrid } from '../components/ui/StatsGrid';
import { StatCard } from '../components/ui/StatCard';
import { DataSection } from '../components/ui/DataSection';
import { DataTable } from '../components/ui/DataTable';
import { BarChart } from '../components/ui/BarChart';
import { Tag } from '../components/ui/Tag';
import { Indicator } from '../components/ui/Indicator';
import { dashboardService } from '../services/dashboard.service';
import { MONTHS, CURRENT_YEAR } from '../config/constants';
import { fmt, fmtPct } from '../utils/formatters';
import { DashboardConsolidated } from '../types';

export default function DashboardPage() {
  const [month, setMonth] = useState(0);
  const [data, setData] = useState<DashboardConsolidated | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardService.consolidated(month, CURRENT_YEAR)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month]);

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    meta: i === month ? (data?.metaVGV || 0) : 0,
    realizado: i === month ? (data?.totalVGV || 0) : 0,
  }));

  return (
    <div>
      <PageHeader title="Painel Consolidado" description="Visão geral de performance — todos os corretores" />
      <MonthTabs activeMonth={month} onSelect={setMonth} />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : data && (
        <>
          <StatsGrid>
            <StatCard label="Meta Total Anual" value={fmt(data.metaVGV)} />
            <StatCard label="Realizado Acumulado" value={fmt(data.totalVGV)} />
            <StatCard label={`Negócios em ${MONTHS[month]}`} value={String(data.totalNegocios)} />
            <StatCard label={`Captações em ${MONTHS[month]}`} value={String(data.totalCaptacoes)} />
          </StatsGrid>

          <BarChart data={chartData} title="Meta × Realizado Mensal" />

          <DataSection title="Resumo por Corretor">
            <DataTable
              columns={[
                { key: 'name', label: 'Corretor', render: (v) => <strong>{String(v)}</strong> },
                { key: 'team', label: 'Equipe', render: (v) => <Tag variant="light">{String(v)}</Tag> },
                { key: 'metaAnual', label: 'Meta Anual', render: (v) => fmt(Number(v)) },
                { key: 'realizado', label: 'Realizado', render: (v) => <strong>{fmt(Number(v))}</strong> },
                { key: 'percentual', label: '% Atingido', render: (v) => {
                  const pct = Number(v);
                  const color = pct >= 0.08 ? 'green' : pct >= 0.04 ? 'yellow' : 'red';
                  return <Indicator value={fmtPct(pct)} dotColor={color as 'green' | 'yellow' | 'red'} />;
                }},
                { key: 'desvio', label: 'Desvio', render: (v) => fmt(Number(v)) },
              ]}
              data={(data.brokers || []).map(b => ({ ...b }))}
            />
          </DataSection>
        </>
      )}
    </div>
  );
}
