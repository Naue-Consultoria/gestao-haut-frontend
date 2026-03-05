import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthTabs } from '../components/ui/MonthTabs';
import { DataSection } from '../components/ui/DataSection';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { FormRow } from '../components/ui/FormRow';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { captacoesService } from '../services/captacoes.service';
import { CURRENT_YEAR, ORIGENS } from '../config/constants';
import { fmt } from '../utils/formatters';
import { Captacao } from '../types';

export default function CaptacaoPage() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<Captacao[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [oportunidade, setOportunidade] = useState('');
  const [exclusivo, setExclusivo] = useState('NÃO');
  const [origem, setOrigem] = useState('RELACIONAMENTO');
  const [vgv, setVgv] = useState('');

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    captacoesService.list(user.id, month, year)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, month, year]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!oportunidade) { showToast('Preencha a oportunidade'); return; }
    try {
      await captacoesService.create({ month, year, oportunidade, exclusivo, origem: origem as Captacao['origem'], vgv: Number(vgv) || 0 });
      setModalOpen(false);
      setOportunidade(''); setExclusivo('NÃO'); setOrigem('RELACIONAMENTO'); setVgv('');
      showToast('Captação registrada');
      load();
    } catch { showToast('Erro ao salvar'); }
  };

  const handleDelete = async (id: string) => {
    try { await captacoesService.delete(id); showToast('Registro excluído'); load(); } catch { showToast('Erro ao excluir'); }
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';

  return (
    <div>
      <PageHeader title="Quadro de Captação" description="Imóveis captados no mês" action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Registrar Captação</Button>} />
      <MonthTabs activeMonth={month} onSelect={setMonth} activeYear={year} onYearChange={setYear} />

      <DataSection title="Captações Registradas" badge={`${data.length} registros`}>
        {loading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : data.length === 0 ? <EmptyState /> : (
          <table className="w-full border-collapse">
            <thead><tr>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Oportunidade</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Exclusivo</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Origem</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">VGV Bruto</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Ações</th>
            </tr></thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.oportunidade}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.exclusivo}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.origem}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{fmt(row.vgv)}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Button variant="icon" size="sm" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Captação">
        <FormGroup label="Oportunidade / Imóvel"><input type="text" value={oportunidade} onChange={e => setOportunidade(e.target.value)} placeholder="Nome do imóvel" className={inputClass} /></FormGroup>
        <FormRow>
          <FormGroup label="Exclusivo?"><select value={exclusivo} onChange={e => setExclusivo(e.target.value)} className={inputClass}><option>NÃO</option><option>SIM</option></select></FormGroup>
          <FormGroup label="Origem"><select value={origem} onChange={e => setOrigem(e.target.value)} className={inputClass}>{ORIGENS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormGroup>
        </FormRow>
        <FormGroup label="VGV Bruto (R$)"><CurrencyInput value={vgv} onChange={setVgv} className={inputClass} /></FormGroup>
        <div className="flex gap-3 justify-end mt-6"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></div>
      </Modal>
      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
