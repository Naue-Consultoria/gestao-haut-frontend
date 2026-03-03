import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthTabs } from '../components/ui/MonthTabs';
import { BrokerSelect } from '../components/ui/BrokerSelect';
import { StatsGrid } from '../components/ui/StatsGrid';
import { StatCard } from '../components/ui/StatCard';
import { BarChart } from '../components/ui/BarChart';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CommentBox } from '../components/ui/CommentBox';
import { DataSection } from '../components/ui/DataSection';
import { useAuth } from '../hooks/useAuth';
import { useBrokerSelector } from '../hooks/useBrokerSelector';
import { dashboardService } from '../services/dashboard.service';
import { MONTHS, CURRENT_YEAR } from '../config/constants';
import { fmt, fmtPct } from '../utils/formatters';
import { DashboardIndividual } from '../types';

export default function IndividualPage() {
  const { user } = useAuth();
  const { brokers, selectedBrokerId, setSelectedBrokerId } = useBrokerSelector();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<DashboardIndividual | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedBrokerId) return;
    setLoading(true);
    dashboardService.individual(selectedBrokerId, month, year)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBrokerId, month, year]);

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    meta: i === month ? (data?.metaVGVMensal || 0) : 0,
    realizado: i === month ? (data?.vgvRealizado || 0) : 0,
  }));

  return (
    <div>
      <PageHeader title="Corretor Individual" description="Acompanhamento de performance mensal detalhado" />

      {user?.role === 'gestor' && (
        <BrokerSelect brokers={brokers} selectedId={selectedBrokerId} onChange={setSelectedBrokerId} />
      )}

      <MonthTabs activeMonth={month} onSelect={setMonth} activeYear={year} onYearChange={setYear} />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : data && (
        <>
          <StatsGrid>
            <StatCard
              label={`VGV Realizado — ${MONTHS[month]}`}
              value={fmt(data.vgvRealizado)}
              change={`Meta: ${fmt(data.metaVGVMensal)}`}
              changeType={data.vgvRealizado >= data.metaVGVMensal ? 'positive' : 'negative'}
            />
            <StatCard label="Captações" value={String(data.captacoes)} change={`Meta: ${data.metaCaptacoes}`} changeType={data.captacoes >= data.metaCaptacoes ? 'positive' : 'negative'} />
            <StatCard label="Horas Treinamento" value={`${data.treinamentoHoras}h`} change={`Meta: ${data.metaTreinamento}h`} changeType={data.treinamentoHoras >= data.metaTreinamento ? 'positive' : 'negative'} />
            <StatCard label="Investimentos" value={fmt(data.investimentoValor)} change={`Meta: ${fmt(data.metaInvestimento)}`} changeType={data.investimentoValor >= data.metaInvestimento ? 'positive' : 'negative'} />
          </StatsGrid>

          <BarChart data={chartData} title="Evolução Mensal — Meta × Realizado" />

          <DataSection title="Efetividade">
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Captações: {data.captacoes} / {data.metaCaptacoes}</div>
                <ProgressBar percentage={data.metaCaptacoes > 0 ? (data.captacoes / data.metaCaptacoes) * 100 : 0} />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Treinamento: {data.treinamentoHoras}h / {data.metaTreinamento}h</div>
                <ProgressBar percentage={data.metaTreinamento > 0 ? (data.treinamentoHoras / data.metaTreinamento) * 100 : 0} />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Investimento: {fmt(data.investimentoValor)} / {fmt(data.metaInvestimento)}</div>
                <ProgressBar percentage={data.metaInvestimento > 0 ? (data.investimentoValor / data.metaInvestimento) * 100 : 0} />
              </div>
            </div>
          </DataSection>

          {data.comentario && (
            <CommentBox author="Comentário do Gestor" text={data.comentario} />
          )}
        </>
      )}
    </div>
  );
}
