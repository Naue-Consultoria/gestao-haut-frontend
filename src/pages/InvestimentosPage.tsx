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
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { investimentosService } from '../services/investimentos.service';
import { CURRENT_YEAR, INVESTIMENTO_TIPOS } from '../config/constants';
import { fmt } from '../utils/formatters';
import { Investimento } from '../types';

export default function InvestimentosPage() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<Investimento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [tipo, setTipo] = useState('PORTAL');
  const [produto, setProduto] = useState('');
  const [valor, setValor] = useState('');
  const [leads, setLeads] = useState('');

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    investimentosService.list(user.id, month, year).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [user, month, year]);

  useEffect(() => { load(); }, [load]);

  const totalValor = data.reduce((s, i) => s + Number(i.valor), 0);
  const totalLeads = data.reduce((s, i) => s + Number(i.leads), 0);

  const handleSave = async () => {
    try {
      await investimentosService.create({ month, year, tipo: tipo as Investimento['tipo'], produto, valor: Number(valor) || 0, leads: Number(leads) || 0 });
      setModalOpen(false); setTipo('PORTAL'); setProduto(''); setValor(''); setLeads('');
      showToast('Investimento registrado'); load();
    } catch { showToast('Erro ao salvar'); }
  };

  const handleDelete = async (id: string) => {
    try { await investimentosService.delete(id); showToast('Registro excluído'); load(); } catch { showToast('Erro ao excluir'); }
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';

  return (
    <div>
      <PageHeader title="Investimentos" description="Portais, patrocinados e outras ações" action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Registrar Investimento</Button>} />
      <MonthTabs activeMonth={month} onSelect={setMonth} activeYear={year} onYearChange={setYear} />

      <StatsGrid>
        <StatCard label="Valor Total Investido" value={fmt(totalValor)} />
        <StatCard label="Total Leads" value={String(totalLeads)} />
        <StatCard label="Investimentos" value={String(data.length)} />
      </StatsGrid>

      <DataSection title="Investimentos Registrados" badge={`${data.length} registros`}>
        {loading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : data.length === 0 ? <EmptyState /> : (
          <table className="w-full border-collapse">
            <thead><tr>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Tipo</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Produto</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Valor</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Leads Gerados</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Ações</th>
            </tr></thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.tipo}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.produto}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{fmt(row.valor)}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.leads}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Button variant="icon" size="sm" onClick={() => handleDelete(row.id)}><Trash2 size={14} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Investimento">
        <FormRow>
          <FormGroup label="Tipo"><select value={tipo} onChange={e => setTipo(e.target.value)} className={inputClass}>{INVESTIMENTO_TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></FormGroup>
          <FormGroup label="Produto / Descrição"><input type="text" value={produto} onChange={e => setProduto(e.target.value)} placeholder="Descrição" className={inputClass} /></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Valor Investido (R$)"><input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" className={inputClass} /></FormGroup>
          <FormGroup label="Leads Gerados"><input type="number" value={leads} onChange={e => setLeads(e.target.value)} placeholder="0" className={inputClass} /></FormGroup>
        </FormRow>
        <div className="flex gap-3 justify-end mt-6"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></div>
      </Modal>
      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
