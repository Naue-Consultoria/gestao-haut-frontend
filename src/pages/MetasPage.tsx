import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { FormGroup } from '../components/ui/FormGroup';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useBrokerSelector } from '../hooks/useBrokerSelector';
import { useToast } from '../hooks/useToast';
import { metasService } from '../services/metas.service';
import { MONTHS, CURRENT_YEAR } from '../config/constants';

export default function MetasPage() {
  const { brokers, selectedBrokerId, setSelectedBrokerId } = useBrokerSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [vgvAnual, setVgvAnual] = useState('');
  const [captacoes, setCaptacoes] = useState('');
  const [captExclusivas, setCaptExclusivas] = useState('');
  const [negocios, setNegocios] = useState('');
  const [treinamento, setTreinamento] = useState('');
  const [investimento, setInvestimento] = useState('');
  const [positivacao, setPositivacao] = useState('');

  // Auto-calculate mensal from anual
  const vgvMensal = vgvAnual ? String(Math.round((Number(vgvAnual) / 12) * 100) / 100) : '';

  const clearForm = () => {
    setVgvAnual('');
    setCaptacoes('');
    setCaptExclusivas('');
    setNegocios('');
    setTreinamento('');
    setInvestimento('');
    setPositivacao('');
  };

  const loadMeta = useCallback(async () => {
    if (!selectedBrokerId) return;
    setFetching(true);
    try {
      const meta = await metasService.getByBrokerAndMonth(selectedBrokerId, month, year);
      if (meta) {
        setVgvAnual(meta.vgv_anual ? String(meta.vgv_anual) : '');
        setCaptacoes(meta.captacoes ? String(meta.captacoes) : '');
        setCaptExclusivas(meta.capt_exclusivas ? String(meta.capt_exclusivas) : '');
        setNegocios(meta.negocios ? String(meta.negocios) : '');
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
  }, [selectedBrokerId, month, year]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const handleSave = async () => {
    if (!selectedBrokerId) {
      showToast('Selecione um corretor');
      return;
    }

    setLoading(true);
    try {
      const vgvAnualNum = Number(vgvAnual) || 0;
      const vgvMensalNum = Number(vgvMensal) || 0;

      // 1. Save VGV anual + mensal for ALL 12 months
      await metasService.bulkUpsertVgv(selectedBrokerId, year, vgvAnualNum, vgvMensalNum);

      // 2. Save all fields for the current month (sequential to avoid race condition)
      await metasService.upsert(selectedBrokerId, month, year, {
        vgv_anual: vgvAnualNum,
        vgv_mensal: vgvMensalNum,
        captacoes: Number(captacoes) || 0,
        capt_exclusivas: Number(captExclusivas) || 0,
        negocios: Number(negocios) || 0,
        treinamento: Number(treinamento) || 0,
        investimento: Number(investimento) || 0,
        positivacao: Number(positivacao) || 0,
      });

      // 3. Re-fetch to confirm data was persisted
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
      <PageHeader title="Definir Metas" description="Configure os objetivos de cada corretor" />

      {/* Seletores */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <select
          value={selectedBrokerId}
          onChange={e => setSelectedBrokerId(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]"
        >
          {brokers.map(b => <option key={b.id} value={b.id}>{b.name} — {b.team}</option>)}
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

      {/* Metas VGV — Aplicadas ao ano inteiro */}
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

      {/* Outras Metas — Por mês */}
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
          <FormGroup label="Meta Negócios Levantados (R$)">
            <CurrencyInput value={negocios} onChange={setNegocios} className={inputClass} />
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

      {/* Botão Salvar */}
      <Button onClick={handleSave} disabled={loading || fetching || !selectedBrokerId} className="mb-6">
        {loading ? 'Salvando...' : 'Salvar Metas'}
      </Button>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
