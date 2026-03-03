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
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { treinamentosService } from '../services/treinamentos.service';
import { CURRENT_YEAR } from '../config/constants';
import { Treinamento } from '../types';

export default function TreinamentosPage() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [data, setData] = useState<Treinamento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [atividade, setAtividade] = useState('');
  const [local, setLocal] = useState('');
  const [horas, setHoras] = useState('');

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    treinamentosService.list(user.id, month, CURRENT_YEAR).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [user, month]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!atividade) { showToast('Preencha a atividade'); return; }
    try {
      await treinamentosService.create({ month, year: CURRENT_YEAR, atividade, local, horas: Number(horas) || 0 });
      setModalOpen(false); setAtividade(''); setLocal(''); setHoras('');
      showToast('Participação registrada'); load();
    } catch { showToast('Erro ao salvar'); }
  };

  const handleDelete = async (id: string) => {
    try { await treinamentosService.delete(id); showToast('Registro excluído'); load(); } catch { showToast('Erro ao excluir'); }
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';

  return (
    <div>
      <PageHeader title="Treinamentos e Ações" description="Participação em reuniões, treinamentos e plantões" action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Registrar Participação</Button>} />
      <MonthTabs activeMonth={month} onSelect={setMonth} />

      <DataSection title="Participações" badge={`${data.length} registros`}>
        {loading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : data.length === 0 ? <EmptyState /> : (
          <table className="w-full border-collapse">
            <thead><tr>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Atividade</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Local</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Carga Horária</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Ações</th>
            </tr></thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.atividade}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.local}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.horas}h</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Button variant="icon" size="sm" onClick={() => handleDelete(row.id)}><Trash2 size={14} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Participação">
        <FormGroup label="Atividade"><input type="text" value={atividade} onChange={e => setAtividade(e.target.value)} placeholder="Nome da atividade" className={inputClass} /></FormGroup>
        <FormRow>
          <FormGroup label="Local"><input type="text" value={local} onChange={e => setLocal(e.target.value)} placeholder="Local ou online" className={inputClass} /></FormGroup>
          <FormGroup label="Carga Horária (horas)"><input type="number" value={horas} onChange={e => setHoras(e.target.value)} placeholder="0" step="0.5" className={inputClass} /></FormGroup>
        </FormRow>
        <div className="flex gap-3 justify-end mt-6"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></div>
      </Modal>
      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
