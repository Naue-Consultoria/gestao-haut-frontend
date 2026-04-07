import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthTabs } from '../components/ui/MonthTabs';
import { StatsGrid } from '../components/ui/StatsGrid';
import { StatCard } from '../components/ui/StatCard';
import { BarChart } from '../components/ui/BarChart';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CommentBox } from '../components/ui/CommentBox';
import { DataSection } from '../components/ui/DataSection';
import { useAuth } from '../hooks/useAuth';
import { useBrokerSelector } from '../hooks/useBrokerSelector';
import { dashboardService } from '../services/dashboard.service';
import { parceriasService } from '../services/parcerias.service';
import { MONTHS, CURRENT_YEAR } from '../config/constants';
import { fmt } from '../utils/formatters';
import { DashboardIndividual, DashboardIndividualYearly, Parceria } from '../types';

export default function IndividualPage() {
  const { user } = useAuth();
  const { brokers, selectedBrokerId, setSelectedBrokerId } = useBrokerSelector();
  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<DashboardIndividual | null>(null);
  const [evolution, setEvolution] = useState<{ month: number; meta: number; realizado: number; metaAcumulada: number }[]>([]);
  const [yearly, setYearly] = useState<DashboardIndividualYearly | null>(null);
  const [loading, setLoading] = useState(true);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'gestor') {
      parceriasService.getActive().then(setParcerias).catch(console.error);
    }
  }, [user]);

  // For parcerias, we pass the first member's brokerId to the dashboard endpoint
  // which will auto-detect the partnership
  const getEffectiveId = () => {
    // Check if selected is a parceria ID
    const parceria = parcerias.find(p => p.id === selectedBrokerId);
    if (parceria && parceria.parceria_membros?.length) {
      return parceria.parceria_membros[0].broker_id;
    }
    return selectedBrokerId;
  };

  useEffect(() => {
    const effectiveId = getEffectiveId();
    if (!effectiveId) return;
    setEvolution([]);
    dashboardService.yearlyEvolution(effectiveId, year)
      .then(setEvolution)
      .catch(console.error);
  }, [selectedBrokerId, year, parcerias]);

  // Fetch yearly consolidated only when "Ano" tab is active
  useEffect(() => {
    if (month !== -1) return;
    const effectiveId = getEffectiveId();
    if (!effectiveId) return;
    setYearlyLoading(true);
    setYearly(null);
    dashboardService.individualYearly(effectiveId, year)
      .then(setYearly)
      .catch(console.error)
      .finally(() => setYearlyLoading(false));
  }, [selectedBrokerId, year, parcerias, month]);

  // Fetch monthly data only when a specific month is selected
  useEffect(() => {
    if (month === -1) return;
    const effectiveId = getEffectiveId();
    if (!effectiveId) return;
    setLoading(true);
    dashboardService.individual(effectiveId, month, year)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBrokerId, month, year, parcerias]);

  const chartData = evolution.length > 0
    ? evolution.map(e => ({ meta: e.metaAcumulada ?? e.meta, realizado: e.realizado }))
    : Array.from({ length: 12 }, () => ({ meta: 0, realizado: 0 }));

  // Build select options: brokers that are NOT in a partnership + parcerias
  const brokersInParcerias = new Set(
    parcerias.flatMap(p => (p.parceria_membros || []).map(m => m.broker_id))
  );
  const soloBrokers = brokers.filter(b => !brokersInParcerias.has(b.id));

  return (
    <div>
      <PageHeader title="Painel de Performance" description="Acompanhamento de performance mensal detalhado" />

      {user?.role === 'gestor' && (
        <div className="flex items-center gap-4 mb-6">
          <select
            value={selectedBrokerId}
            onChange={e => setSelectedBrokerId(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]"
          >
            {parcerias.length > 0 && (
              <optgroup label="Parcerias">
                {parcerias.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </optgroup>
            )}
            <optgroup label="Corretores">
              {soloBrokers.map(b => (
                <option key={b.id} value={b.id}>{b.name} — {b.team}</option>
              ))}
            </optgroup>
          </select>
        </div>
      )}

      <MonthTabs activeMonth={month} onSelect={setMonth} activeYear={year} onYearChange={setYear} showYearlyTab />

      {month === -1 ? (
        yearlyLoading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : yearly ? (
          <>
            <StatsGrid>
              <StatCard
                label={`VGV Realizado — ${year}`}
                value={fmt(yearly.vgvRealizado)}
                change={`Meta: ${fmt(yearly.metaVGVAnual)}`}
                changeType={yearly.vgvRealizado >= yearly.metaVGVAnual ? 'positive' : 'negative'}
              />
              <StatCard label="Captações" value={String(yearly.captacoes)} change={`Meta: ${yearly.metaCaptacoes}`} changeType={yearly.captacoes >= yearly.metaCaptacoes ? 'positive' : 'negative'} />
              <StatCard label="Positivações" value={String(yearly.positivacoes)} change={`Meta: ${yearly.metaPositivacao}`} changeType={yearly.positivacoes >= yearly.metaPositivacao ? 'positive' : 'negative'} />
              <StatCard label="Comissão Total" value={fmt(yearly.comissaoTotal)} />
            </StatsGrid>

            <BarChart data={chartData} title="Evolução Mensal — Meta Acumulada × Realizado" metaLabel="Meta Acum." />

            <DataSection title={`Efetividade — Consolidado ${year}`}>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Captações: {yearly.captacoes} / {yearly.metaCaptacoes}</div>
                  <ProgressBar percentage={yearly.metaCaptacoes > 0 ? (yearly.captacoes / yearly.metaCaptacoes) * 100 : 0} />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Negócios Levantados: {fmt(yearly.negociosVGV)} / {fmt(yearly.metaNegocios)}</div>
                  <ProgressBar percentage={yearly.metaNegocios > 0 ? (yearly.negociosVGV / yearly.metaNegocios) * 100 : 0} />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Treinamento: {yearly.treinamentoHoras}h / {yearly.metaTreinamento}h</div>
                  <ProgressBar percentage={yearly.metaTreinamento > 0 ? (yearly.treinamentoHoras / yearly.metaTreinamento) * 100 : 0} />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Investimento: {fmt(yearly.investimentoValor)} / {fmt(yearly.metaInvestimento)}</div>
                  <ProgressBar percentage={yearly.metaInvestimento > 0 ? (yearly.investimentoValor / yearly.metaInvestimento) * 100 : 0} />
                </div>
              </div>
            </DataSection>
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">Nenhum dado encontrado</div>
        )
      ) : loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : data && (
        <>
          <StatsGrid>
            <StatCard
              label={`VGV Realizado — ${MONTHS[month]}`}
              value={fmt(data.vgvRealizado)}
              change={`Meta Acum.: ${fmt(data.metaVGVMensalAcumulada)}`}
              changeType={data.vgvRealizado >= data.metaVGVMensalAcumulada ? 'positive' : 'negative'}
            >
              <div className="text-xs mt-1 font-mono text-gray-500">Meta Mensal: {fmt(data.metaVGVMensal)}</div>
            </StatCard>
            <StatCard label="Captações" value={String(data.captacoes)} change={`Meta: ${data.metaCaptacoes}`} changeType={data.captacoes >= data.metaCaptacoes ? 'positive' : 'negative'} />
            <StatCard label="Horas Treinamento" value={`${data.treinamentoHoras}h`} change={`Meta: ${data.metaTreinamento}h`} changeType={data.treinamentoHoras >= data.metaTreinamento ? 'positive' : 'negative'} />
            <StatCard label="Investimentos" value={fmt(data.investimentoValor)} change={`Meta: ${fmt(data.metaInvestimento)}`} changeType={data.investimentoValor >= data.metaInvestimento ? 'positive' : 'negative'} />
          </StatsGrid>

          <BarChart data={chartData} title="Evolução Mensal — Meta Acumulada × Realizado" highlightIndex={month} metaLabel="Meta Acum." />

          <DataSection title="Efetividade">
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Captações: {data.captacoes} / {data.metaCaptacoes}</div>
                <ProgressBar percentage={data.metaCaptacoes > 0 ? (data.captacoes / data.metaCaptacoes) * 100 : 0} />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Negócios Levantados: {fmt(data.negociosVGV)} / {fmt(data.metaNegocios)}</div>
                <ProgressBar percentage={data.metaNegocios > 0 ? (data.negociosVGV / data.metaNegocios) * 100 : 0} />
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
