import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthTabs } from '../components/ui/MonthTabs';
import { StatsGrid } from '../components/ui/StatsGrid';
import { StatCard } from '../components/ui/StatCard';
import { DataSection } from '../components/ui/DataSection';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { FormRow } from '../components/ui/FormRow';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { useBrokerParceriaSelector } from '../hooks/useBrokerParceriaSelector';
import { negociosService } from '../services/negocios.service';
import { CURRENT_YEAR, ORIGENS } from '../config/constants';
import { fmt } from '../utils/formatters';
import { Negocio } from '../types';

export default function NegociosPage() {
  const { isGestor, parcerias, soloBrokers, selectedId, setSelectedId, getEffectiveBrokerId, getListBrokerId } = useBrokerParceriaSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<Negocio[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [oportunidade, setOportunidade] = useState('');
  const [origem, setOrigem] = useState('RELACIONAMENTO');
  const [vgv, setVgv] = useState('');

  const load = useCallback(() => {
    const brokerId = getListBrokerId();
    if (!brokerId) return;
    setLoading(true);
    negociosService.list(brokerId, month, year).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [selectedId, month, year]);

  useEffect(() => { load(); }, [load]);

  const totalVGV = data.reduce((s, n) => s + Number(n.vgv), 0);

  const handleSave = async () => {
    if (!oportunidade) { showToast('Preencha a oportunidade'); return; }
    try {
      const payload: any = { month, year, oportunidade, origem: origem as Negocio['origem'], vgv: Number(vgv) || 0 };
      if (isGestor) payload.broker_id = getEffectiveBrokerId();
      await negociosService.create(payload);
      setModalOpen(false); setOportunidade(''); setOrigem('RELACIONAMENTO'); setVgv('');
      showToast('Negócio registrado'); load();
    } catch { showToast('Erro ao salvar'); }
  };

  const handleDelete = async (id: string) => {
    try { await negociosService.delete(id); showToast('Registro excluído'); load(); } catch { showToast('Erro ao excluir'); }
  };

  const selectClass = 'px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]';
  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';

  return (
    <div>
      <PageHeader title="Negócios Levantados" description="Oportunidades geradas no mês" action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Registrar Negócio</Button>} />

      {isGestor && (
        <div className="flex items-center gap-4 mb-4">
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={selectClass}>
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

      <MonthTabs activeMonth={month} onSelect={setMonth} activeYear={year} onYearChange={setYear} />

      <StatsGrid>
        <StatCard label="VGV Total Negócios" value={fmt(totalVGV)} />
        <StatCard label="Total Negócios" value={String(data.length)} />
      </StatsGrid>

      <DataSection title="Negócios Registrados" badge={`${data.length} registros`}>
        {loading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : data.length === 0 ? <EmptyState /> : (
          <table className="w-full border-collapse">
            <thead><tr>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Oportunidade</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Origem</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">VGV Bruto</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Ações</th>
            </tr></thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.oportunidade}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.origem}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{fmt(row.vgv)}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Button variant="icon" size="sm" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Negócio">
        <FormGroup label="Oportunidade / Descrição"><input type="text" value={oportunidade} onChange={e => setOportunidade(e.target.value)} placeholder="Descrição da oportunidade" className={inputClass} /></FormGroup>
        <FormRow>
          <FormGroup label="Origem"><select value={origem} onChange={e => setOrigem(e.target.value)} className={inputClass}>{ORIGENS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormGroup>
          <FormGroup label="VGV Bruto (R$)"><CurrencyInput value={vgv} onChange={setVgv} className={inputClass} /></FormGroup>
        </FormRow>
        <div className="flex gap-3 justify-end mt-6"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></div>
      </Modal>
      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
