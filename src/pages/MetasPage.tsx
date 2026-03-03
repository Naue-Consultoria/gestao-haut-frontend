import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { BrokerSelect } from '../components/ui/BrokerSelect';
import { FormGroup } from '../components/ui/FormGroup';
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

  const [vgvAnual, setVgvAnual] = useState('');
  const [vgvMensal, setVgvMensal] = useState('');
  const [captacoes, setCaptacoes] = useState('');
  const [captExclusivas, setCaptExclusivas] = useState('');
  const [negocios, setNegocios] = useState('');
  const [treinamento, setTreinamento] = useState('');
  const [investimento, setInvestimento] = useState('');
  const [positivacao, setPositivacao] = useState('');

  useEffect(() => {
    if (!selectedBrokerId) return;
    metasService.getByBrokerAndMonth(selectedBrokerId, month, year).then(meta => {
      if (meta) {
        setVgvAnual(String(meta.vgv_anual || ''));
        setVgvMensal(String(meta.vgv_mensal || ''));
        setCaptacoes(String(meta.captacoes || ''));
        setCaptExclusivas(String(meta.capt_exclusivas || ''));
        setNegocios(String(meta.negocios || ''));
        setTreinamento(String(meta.treinamento || ''));
        setInvestimento(String(meta.investimento || ''));
        setPositivacao(String(meta.positivacao || ''));
      } else {
        setVgvAnual(''); setVgvMensal(''); setCaptacoes(''); setCaptExclusivas('');
        setNegocios(''); setTreinamento(''); setInvestimento(''); setPositivacao('');
      }
    });
  }, [selectedBrokerId, month, year]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await metasService.upsert(selectedBrokerId, month, year, {
        vgv_anual: Number(vgvAnual) || 0,
        vgv_mensal: Number(vgvMensal) || 0,
        captacoes: Number(captacoes) || 0,
        capt_exclusivas: Number(captExclusivas) || 0,
        negocios: Number(negocios) || 0,
        treinamento: Number(treinamento) || 0,
        investimento: Number(investimento) || 0,
        positivacao: Number(positivacao) || 0,
      });
      showToast('Metas salvas');
    } catch { showToast('Erro ao salvar metas'); }
    setLoading(false);
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';

  return (
    <div>
      <PageHeader title="Definir Metas" description="Configure os objetivos de cada corretor" />

      <div className="flex items-center gap-4 mb-6">
        <select value={selectedBrokerId} onChange={e => setSelectedBrokerId(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]">
          {brokers.map(b => <option key={b.id} value={b.id}>{b.name} — {b.team}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer">
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer">
          {Array.from({ length: CURRENT_YEAR - 2024 }, (_, i) => CURRENT_YEAR - i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-[12px] p-8 mb-6">
        <div className="text-[15px] font-semibold tracking-tight mb-4">Metas de Performance</div>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <FormGroup label="Meta VGV Líquido Anual (R$)"><input type="number" value={vgvAnual} onChange={e => setVgvAnual(e.target.value)} placeholder="0,00" className={inputClass} /></FormGroup>
          <FormGroup label="Meta VGV Líquido Mensal (R$)"><input type="number" value={vgvMensal} onChange={e => setVgvMensal(e.target.value)} placeholder="0,00" className={inputClass} /></FormGroup>
          <FormGroup label="Meta Captações no Mês"><input type="number" value={captacoes} onChange={e => setCaptacoes(e.target.value)} placeholder="0" className={inputClass} /></FormGroup>
          <FormGroup label="Meta Captações Exclusivas"><input type="number" value={captExclusivas} onChange={e => setCaptExclusivas(e.target.value)} placeholder="0" className={inputClass} /></FormGroup>
          <FormGroup label="Meta Negócios Levantados (R$)"><input type="number" value={negocios} onChange={e => setNegocios(e.target.value)} placeholder="0,00" className={inputClass} /></FormGroup>
          <FormGroup label="Meta Horas Treinamento"><input type="number" value={treinamento} onChange={e => setTreinamento(e.target.value)} placeholder="0" className={inputClass} /></FormGroup>
          <FormGroup label="Meta Investimento (R$)"><input type="number" value={investimento} onChange={e => setInvestimento(e.target.value)} placeholder="0,00" className={inputClass} /></FormGroup>
          <FormGroup label="Taxa Positivação (%)"><input type="number" value={positivacao} onChange={e => setPositivacao(e.target.value)} placeholder="0" step="0.1" className={inputClass} /></FormGroup>
        </div>
        <Button onClick={handleSave} disabled={loading} className="mt-4">{loading ? 'Salvando...' : 'Salvar Metas'}</Button>
      </div>
      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
