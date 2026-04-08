import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { FormGroup } from '../components/ui/FormGroup';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useBrokerSelector } from '../hooks/useBrokerSelector';
import { useToast } from '../hooks/useToast';
import { metasService } from '../services/metas.service';
import { parceriasService } from '../services/parcerias.service';
import { MONTHS, CURRENT_YEAR } from '../config/constants';
import { Parceria } from '../types';

export default function MetasPage() {
  const { brokers, selectedBrokerId, setSelectedBrokerId } = useBrokerSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [selectedId, setSelectedId] = useState('');

  const [vgvAnual, setVgvAnual] = useState('');
  const [captacoes, setCaptacoes] = useState('');
  const [captExclusivas, setCaptExclusivas] = useState('');
  const [treinamento, setTreinamento] = useState('');
  const [investimento, setInvestimento] = useState('');
  const [positivacao, setPositivacao] = useState('');

  const vgvMensal = vgvAnual ? String(Math.round((Number(vgvAnual) / 12) * 100) / 100) : '';

  useEffect(() => {
    parceriasService.getActive().then(setParcerias).catch(console.error);
  }, []);

  // Sync selectedId with first available option
  useEffect(() => {
    if (selectedId) return;
    if (parcerias.length > 0) {
      setSelectedId(parcerias[0].id);
    } else if (selectedBrokerId) {
      setSelectedId(selectedBrokerId);
    }
  }, [parcerias, selectedBrokerId]);

  // Brokers in partnerships (excluded from solo list)
  const brokersInParcerias = new Set(
    parcerias.flatMap(p => (p.parceria_membros || []).map(m => m.broker_id))
  );
  const soloBrokers = brokers.filter(b => !brokersInParcerias.has(b.id));

  // Determine if selected is a parceria or a broker
  const isParceriaSelected = parcerias.some(p => p.id === selectedId);

  const clearForm = () => {
    setVgvAnual('');
    setCaptacoes('');
    setCaptExclusivas('');
    setTreinamento('');
    setInvestimento('');
    setPositivacao('');
  };

  const loadMeta = useCallback(async () => {
    if (!selectedId) return;

    setFetching(true);
    try {
      const meta = isParceriaSelected
        ? await parceriasService.getMetaByMonth(selectedId, month, year)
        : await metasService.getByBrokerAndMonth(selectedId, month, year);

      if (meta) {
        setVgvAnual(meta.vgv_anual ? String(meta.vgv_anual) : '');
        setCaptacoes(meta.captacoes ? String(meta.captacoes) : '');
        setCaptExclusivas(meta.capt_exclusivas ? String(meta.capt_exclusivas) : '');
        setTreinamento(meta.treinamento ? String(meta.treinamento) : '');
        setInvestimento(meta.investimento ? String(meta.investimento) : '');
        setPositivacao(meta.positivacao ? String(meta.positivacao) : '');
      } else {
        clearForm();
      }
    } catch {
      clearForm();
    }
    setFetching(false);
  }, [selectedId, isParceriaSelected, month, year]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const handleSave = async () => {
    if (!selectedId) return showToast('Selecione um corretor ou parceria');

    setLoading(true);
    try {
      const vgvAnualNum = Number(vgvAnual) || 0;
      const metaData = {
        captacoes: Number(captacoes) || 0,
        capt_exclusivas: Number(captExclusivas) || 0,
        treinamento: Number(treinamento) || 0,
        investimento: Number(investimento) || 0,
        positivacao: Number(positivacao) || 0,
      };

      if (isParceriaSelected) {
        await parceriasService.bulkUpsertVgv(selectedId, year, vgvAnualNum);
        await parceriasService.upsertMeta(selectedId, month, year, metaData);
      } else {
        await metasService.bulkUpsertVgv(selectedId, year, vgvAnualNum);
        await metasService.upsert(selectedId, month, year, metaData);
      }

      await loadMeta();
      showToast('Metas salvas com sucesso');
    } catch {
      showToast('Erro ao salvar metas');
    }
    setLoading(false);
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';
  const disabledInputClass = 'w-full px-4 py-3 bg-gray-100 border border-gray-200 text-gray-500 rounded-sm font-main text-sm outline-none cursor-not-allowed';

  return (
    <div>
      <PageHeader title="Definir Metas" description="Configure os objetivos de corretores e parcerias" />

      {/* Seletores */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
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
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer"
        >
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer"
        >
          {Array.from({ length: CURRENT_YEAR - 2024 }, (_, i) => CURRENT_YEAR - i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {fetching && <span className="text-xs text-gray-400 font-main">Carregando...</span>}
      </div>

      {/* Metas VGV */}
      <div className="bg-white border border-gray-200 rounded-[12px] p-8 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="text-[15px] font-semibold tracking-tight">Meta VGV — Anual</div>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Ao salvar, o VGV anual e mensal serão aplicados automaticamente para todos os meses de {year}.
        </p>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <FormGroup label="Meta VGV Líquido Anual (R$)">
            <CurrencyInput value={vgvAnual} onChange={setVgvAnual} className={inputClass} />
          </FormGroup>
          <FormGroup label="Meta VGV Líquido Mensal (R$) — calculado automaticamente">
            <CurrencyInput value={vgvMensal} onChange={() => {}} className={disabledInputClass} disabled />
          </FormGroup>
        </div>
      </div>

      {/* Outras Metas */}
      <div className="bg-white border border-gray-200 rounded-[12px] p-8 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="text-[15px] font-semibold tracking-tight">Metas Mensais — {MONTHS[month]}</div>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Estas metas são específicas para o mês selecionado.
        </p>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <FormGroup label="Meta Captações no Mês">
            <input type="number" value={captacoes} onChange={e => setCaptacoes(e.target.value)} placeholder="0" className={inputClass} />
          </FormGroup>
          <FormGroup label="Meta Captações Exclusivas">
            <input type="number" value={captExclusivas} onChange={e => setCaptExclusivas(e.target.value)} placeholder="0" className={inputClass} />
          </FormGroup>
          <FormGroup label="Meta Horas Treinamento">
            <input type="number" value={treinamento} onChange={e => setTreinamento(e.target.value)} placeholder="0" className={inputClass} />
          </FormGroup>
          <FormGroup label="Meta Investimento (R$)">
            <CurrencyInput value={investimento} onChange={setInvestimento} className={inputClass} />
          </FormGroup>
          <FormGroup label="Taxa Positivação (%)">
            <input type="number" value={positivacao} onChange={e => setPositivacao(e.target.value)} placeholder="0" step="0.1" className={inputClass} />
          </FormGroup>
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading || fetching || !selectedId} className="mb-6">
        {loading ? 'Salvando...' : 'Salvar Metas'}
      </Button>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
