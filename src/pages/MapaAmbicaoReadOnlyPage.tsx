import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Tag } from '../components/ui/Tag';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { mapaAmbicaoGestorService } from '../services/mapa-ambicao-gestor.service';
import { MapaAmbicao, MapaDados, emptyMapaDados } from '../types/mapa-ambicao';
import { TabBar, TabId } from '../components/mapa-ambicao/TabBar';
import { PropositorTab } from '../components/mapa-ambicao/tabs/PropositorTab';
import { RastreamentoTab } from '../components/mapa-ambicao/tabs/RastreamentoTab';
import { PlanoAcaoTab } from '../components/mapa-ambicao/tabs/PlanoAcaoTab';
import { EstiloDeVidaTab } from '../components/mapa-ambicao/tabs/EstiloDeVidaTab';
import { EstratificacaoTab } from '../components/mapa-ambicao/tabs/EstratificacaoTab';
import { DashboardTab } from '../components/mapa-ambicao/tabs/DashboardTab';
import { calcCustoAnual, calcPatrimonioNecessario } from '../utils/mapaCalc';

function StatusBadge({ status }: { status: MapaAmbicao['status'] }) {
  if (status === 'preenchido') return <Tag variant="success">Preenchido</Tag>;
  if (status === 'parcial') return <Tag variant="warning">Parcial</Tag>;
  return <Tag variant="light">Vazio</Tag>;
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface LocationState {
  brokerName?: string;
}

export default function MapaAmbicaoReadOnlyPage() {
  const { brokerId } = useParams<{ brokerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast } = useToast();
  const brokerNameFromState = (location.state as LocationState | null)?.brokerName ?? null;
  const [mapa, setMapa] = useState<MapaAmbicao | null>(null);
  const [dados, setDados] = useState<MapaDados>(emptyMapaDados);
  const [activeTab, setActiveTab] = useState<TabId>('proposito');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!brokerId) return;
    setLoading(true);
    setNotFound(false);
    mapaAmbicaoGestorService
      .getByBrokerId(brokerId)
      .then((m) => {
        if (m) {
          setMapa(m);
          setDados({ ...emptyMapaDados(), ...m.dados });
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar Mapa de Ambição', err);
        showToast('Erro ao carregar o Mapa de Ambição.');
      })
      .finally(() => setLoading(false));
  }, [brokerId, showToast]);

  // No-op onChange — fieldset disabled prevents any interaction anyway.
  const noopChange = useCallback((_patch: Partial<MapaDados>) => {
    // intentionally empty — read-only view
  }, []);

  const custoAnual = useMemo(() => calcCustoAnual(dados.expenses || {}), [dados.expenses]);
  const patrimonioNecessario = useMemo(
    () => (custoAnual > 0 ? calcPatrimonioNecessario(custoAnual) : 0),
    [custoAnual]
  );

  const brokerName = brokerNameFromState;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/mapas-ambicao')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 cursor-pointer transition-colors"
      >
        <ArrowLeft size={14} />
        Voltar à lista
      </button>

      <PageHeader
        title={brokerName ? `Mapa de Ambição — ${brokerName}` : 'Mapa de Ambição'}
        description="Visualização read-only — alterações apenas pelo próprio corretor."
        action={
          mapa && (
            <div className="flex items-center gap-3">
              <StatusBadge status={mapa.status} />
              <span className="text-xs text-gray-500">Atualizado: {fmtDateTime(mapa.updated_at)}</span>
            </div>
          )
        }
      />

      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-[12px] p-6 animate-pulse">
              <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-48 bg-gray-200 rounded mb-4" />
              <div className="h-[120px] bg-gray-100 rounded-sm" />
            </div>
          ))}
        </div>
      ) : notFound ? (
        <div className="bg-white border border-gray-200 rounded-[12px] p-10 text-center">
          <div className="text-sm text-gray-500">Este corretor ainda não preencheu o Mapa de Ambição.</div>
        </div>
      ) : (
        <fieldset disabled className="border-0 p-0 m-0 min-w-0 [&_button]:cursor-not-allowed [&_input]:cursor-not-allowed [&_textarea]:cursor-not-allowed [&_select]:cursor-not-allowed">
          {activeTab === 'proposito' && <PropositorTab dados={dados} onChange={noopChange} />}
          {activeTab === 'estilo' && <EstiloDeVidaTab dados={dados} onChange={noopChange} />}
          {activeTab === 'patrimonio' && <EstratificacaoTab dados={dados} onChange={noopChange} />}
          {activeTab === 'rastreamento' && (
            <RastreamentoTab dados={dados} onChange={noopChange} patrimonioNecessario={patrimonioNecessario} />
          )}
          {activeTab === 'plano' && (
            <PlanoAcaoTab dados={dados} onChange={noopChange} patrimonioNecessario={patrimonioNecessario} />
          )}
          {activeTab === 'dashboard' && <DashboardTab dados={dados} onChange={noopChange} />}
        </fieldset>
      )}

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
