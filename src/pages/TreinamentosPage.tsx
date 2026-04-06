import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthTabs } from '../components/ui/MonthTabs';
import { DataSection } from '../components/ui/DataSection';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { FormRow } from '../components/ui/FormRow';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { useBrokerParceriaSelector } from '../hooks/useBrokerParceriaSelector';
import { treinamentosService } from '../services/treinamentos.service';
import { CURRENT_YEAR } from '../config/constants';
import { Treinamento } from '../types';

const decimalToHHMM = (val: number): string => {
  const h = Math.floor(val);
  const m = Math.round((val - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const hhmmToDecimal = (str: string): number => {
  const parts = str.split(':');
  return (parseInt(parts[0]) || 0) + (parseInt(parts[1]) || 0) / 60;
};

const formatHoras = (val: number): string => {
  const h = Math.floor(val);
  const m = Math.round((val - h) * 60);
  return `${h}h${String(m).padStart(2, '0')}min`;
};

export default function TreinamentosPage() {
  const { isGestor, parcerias, soloBrokers, selectedId, setSelectedId, getEffectiveBrokerId, getListBrokerId } = useBrokerParceriaSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<Treinamento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [atividade, setAtividade] = useState('');
  const [local, setLocal] = useState('');
  const [horas, setHoras] = useState('00:00');

  const load = useCallback(() => {
    const brokerId = getListBrokerId();
    if (!brokerId) return;
    setLoading(true);
    treinamentosService.list(brokerId, month, year).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [selectedId, month, year]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setModalOpen(false); setEditingId(null); setAtividade(''); setLocal(''); setHoras('00:00');
  };

  const handleSave = async () => {
    if (!atividade) { showToast('Preencha a atividade'); return; }
    try {
      if (editingId) {
        await treinamentosService.update(editingId, { atividade, local, horas: hhmmToDecimal(horas) });
        showToast('Participação atualizada');
      } else {
        const payload: any = { month, year, atividade, local, horas: hhmmToDecimal(horas) };
        if (isGestor) payload.broker_id = getEffectiveBrokerId();
        await treinamentosService.create(payload);
        showToast('Participação registrada');
      }
      resetForm(); load();
    } catch { showToast('Erro ao salvar'); }
  };

  const handleEdit = (row: Treinamento) => {
    setEditingId(row.id);
    setAtividade(row.atividade);
    setLocal(row.local);
    setHoras(decimalToHHMM(Number(row.horas)));
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try { await treinamentosService.delete(id); showToast('Registro excluído'); load(); } catch { showToast('Erro ao excluir'); }
  };

  const selectClass = 'px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]';
  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';

  return (
    <div>
      <PageHeader title="Treinamentos e Ações" description="Participação em reuniões, treinamentos e plantões" action={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setModalOpen(true); }}>Registrar Participação</Button>} />

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
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{formatHoras(Number(row.horas))}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 flex gap-1"><Button variant="icon" size="sm" onClick={() => handleEdit(row)}><Pencil size={18} /></Button><Button variant="icon" size="sm" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      <Modal isOpen={modalOpen} onClose={resetForm} title={editingId ? 'Editar Participação' : 'Registrar Participação'}>
        <FormGroup label="Atividade"><input type="text" value={atividade} onChange={e => setAtividade(e.target.value)} placeholder="Nome da atividade" className={inputClass} /></FormGroup>
        <FormRow>
          <FormGroup label="Local"><input type="text" value={local} onChange={e => setLocal(e.target.value)} placeholder="Local ou online" className={inputClass} /></FormGroup>
          <FormGroup label="Carga Horária (HH:MM)"><input type="time" value={horas} onChange={e => setHoras(e.target.value)} className={inputClass} /></FormGroup>
        </FormRow>
        <div className="flex gap-3 justify-end mt-6"><Button variant="outline" onClick={resetForm}>Cancelar</Button><Button onClick={handleSave}>{editingId ? 'Atualizar' : 'Salvar'}</Button></div>
      </Modal>
      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
