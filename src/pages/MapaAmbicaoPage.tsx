import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { useDebouncedEffect } from '../hooks/useDebouncedEffect';
import { mapaAmbicaoService } from '../services/mapa-ambicao.service';
import { MapaDados, emptyMapaDados } from '../types/mapa-ambicao';
import { TabBar, TabId } from '../components/mapa-ambicao/TabBar';
import { SaveIndicator, SaveState } from '../components/mapa-ambicao/SaveIndicator';
import { PropositorTab } from '../components/mapa-ambicao/tabs/PropositorTab';
import { RastreamentoTab } from '../components/mapa-ambicao/tabs/RastreamentoTab';
import { PlanoAcaoTab } from '../components/mapa-ambicao/tabs/PlanoAcaoTab';
import { EstiloDeVidaTab } from '../components/mapa-ambicao/tabs/EstiloDeVidaTab';
import { EstratificacaoTab } from '../components/mapa-ambicao/tabs/EstratificacaoTab';
import { DashboardTab } from '../components/mapa-ambicao/tabs/DashboardTab';
import { calcCustoAnual, calcPatrimonioAtual, calcPatrimonioNecessario } from '../utils/mapaCalc';

type MapaStatus = 'vazio' | 'parcial' | 'preenchido';

function computeStatus(dados: MapaDados): MapaStatus {
  const hasVisao = dados.p1Visao.trim() !== '';
  const hasNegocio = dados.p3Negocio.trim() !== '';
  const hasAnyNarrative =
    hasVisao ||
    hasNegocio ||
    dados.p1Atividades.trim() !== '' ||
    dados.p1Legado.trim() !== '' ||
    dados.p1Causas.trim() !== '' ||
    dados.p1Dia.trim() !== '' ||
    dados.p3Acoes.trim() !== '' ||
    dados.p3Depois.trim() !== '' ||
    dados.p3Limites.trim() !== '' ||
    dados.refAprendizado.trim() !== '' ||
    dados.refProximos.trim() !== '';
  const hasTrackingContent = dados.tracking.some((r) => r.data !== '' || r.patrimonio > 0 || r.notas.trim() !== '');
  const hasActionContent = [dados.actionsShort, dados.actionsMedium, dados.actionsLong].some((arr) =>
    arr.some((r) => r.descricao.trim() !== '' || r.prazo.trim() !== '' || r.status !== '')
  );
  const custoAnual = calcCustoAnual(dados.expenses || {});
  const patrimonioAtual = calcPatrimonioAtual(dados.assets || {});

  if (!hasAnyNarrative && !hasTrackingContent && !hasActionContent && dados.pfMeta1 === 0 && dados.pfMeta3 === 0 && custoAnual === 0 && patrimonioAtual === 0 && (dados.rendaAnual ?? 0) === 0) {
    return 'vazio';
  }
  // Phase 5 refinement: "preenchido" requires both narrative anchor AND financial anchor
  if ((hasVisao || hasNegocio) && custoAnual > 0 && patrimonioAtual > 0) {
    return 'preenchido';
  }
  return 'parcial';
}

export default function MapaAmbicaoPage() {
  const { toast, showToast } = useToast();
  const [dados, setDados] = useState<MapaDados>(emptyMapaDados);
  const [activeTab, setActiveTab] = useState<TabId>('proposito');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [loading, setLoading] = useState(true);
  const isHydratingRef = useRef(true);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hydration on mount
  useEffect(() => {
    setLoading(true);
    mapaAmbicaoService
      .get()
      .then((mapa) => {
        if (mapa) {
          setDados({ ...emptyMapaDados(), ...mapa.dados });
        } else {
          setDados(emptyMapaDados());
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar Mapa de Ambição', err);
        setDados(emptyMapaDados());
        showToast('Erro ao carregar o Mapa de Ambição.');
      })
      .finally(() => {
        setLoading(false);
        // Allow autosave to start AFTER hydration settles (prevents immediate PUT on mount)
        setTimeout(() => {
          isHydratingRef.current = false;
        }, 0);
      });
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [showToast]);

  const handleChange = useCallback((patch: Partial<MapaDados>) => {
    setDados((prev) => ({ ...prev, ...patch }));
  }, []);

  const custoAnual = useMemo(() => calcCustoAnual(dados.expenses || {}), [dados.expenses]);
  const patrimonioNecessario = useMemo(
    () => (custoAnual > 0 ? calcPatrimonioNecessario(custoAnual) : 0),
    [custoAnual]
  );

  // Autosave: 2s debounce after last change to `dados`.
  // Memoised so the callbackRef update in useDebouncedEffect only fires when
  // the actual closure dependencies change, not on every render.
  const autosaveCallback = useCallback(() => {
    if (isHydratingRef.current) return; // don't save during initial load
    if (loading) return;

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setSaveState('saving');
    const status = computeStatus(dados);

    mapaAmbicaoService
      .upsert(dados, status, abortRef.current.signal)
      .then(() => {
        setSaveState('saved');
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaveState('idle'), 3000);
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        console.error('Erro ao salvar Mapa de Ambição', err);
        setSaveState('error');
        showToast('Erro ao salvar o Mapa de Ambição. Tente novamente.');
      });
  }, [dados, loading, showToast]);

  useDebouncedEffect(autosaveCallback, [dados], 2000);

  return (
    <div>
      <PageHeader
        title="Mapa de Ambição"
        description="Seu plano de vida e ambição"
        action={<SaveIndicator state={saveState} />}
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
      ) : (
        <>
          {activeTab === 'proposito' && <PropositorTab dados={dados} onChange={handleChange} />}
          {activeTab === 'estilo' && <EstiloDeVidaTab dados={dados} onChange={handleChange} />}
          {activeTab === 'patrimonio' && <EstratificacaoTab dados={dados} onChange={handleChange} />}
          {activeTab === 'rastreamento' && (
            <RastreamentoTab dados={dados} onChange={handleChange} patrimonioNecessario={patrimonioNecessario} />
          )}
          {activeTab === 'plano' && (
            <PlanoAcaoTab dados={dados} onChange={handleChange} patrimonioNecessario={patrimonioNecessario} />
          )}
          {activeTab === 'dashboard' && <DashboardTab dados={dados} onChange={handleChange} />}
        </>
      )}

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
