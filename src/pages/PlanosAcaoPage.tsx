import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { FormGroup } from '../components/ui/FormGroup';
import { FormRow } from '../components/ui/FormRow';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { EmptyState } from '../components/ui/EmptyState';
import { DataSection } from '../components/ui/DataSection';
import { useBrokerSelector } from '../hooks/useBrokerSelector';
import { useToast } from '../hooks/useToast';
import { planosAcaoService } from '../services/planosAcao.service';
import { MONTHS, CURRENT_YEAR, PLANO_STATUS } from '../config/constants';
import { PlanoAcao, PlanoStatus } from '../types';

const statusColors: Record<PlanoStatus, string> = {
  PLANEJADO: 'bg-blue-100 text-blue-700',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
};

const statusLabel: Record<PlanoStatus, string> = {
  PLANEJADO: 'Planejado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
};

export default function PlanosAcaoPage() {
  const { brokers, selectedBrokerId, setSelectedBrokerId } = useBrokerSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [planos, setPlanos] = useState<PlanoAcao[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [texto, setTexto] = useState('');
  const [prazo, setPrazo] = useState('');
  const [status, setStatus] = useState<string>('PLANEJADO');

  const load = useCallback(() => {
    if (!selectedBrokerId) return;
    setLoading(true);
    planosAcaoService.getByBrokerAndMonth(selectedBrokerId, month, year)
      .then(setPlanos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBrokerId, month, year]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!texto.trim()) { showToast('Escreva a descrição da ação'); return; }
    try {
      await planosAcaoService.create(selectedBrokerId, { texto, prazo, status, month, year });
      setModalOpen(false);
      setTexto(''); setPrazo(''); setStatus('PLANEJADO');
      showToast('Plano de ação criado');
      load();
    } catch { showToast('Erro ao salvar'); }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await planosAcaoService.update(id, { status: newStatus });
      showToast('Status atualizado');
      load();
    } catch { showToast('Erro ao atualizar'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await planosAcaoService.delete(id);
      showToast('Plano excluído');
      load();
    } catch { showToast('Erro ao excluir'); }
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';

  return (
    <div>
      <PageHeader title="Plano de Ação" description="Defina ações e prazos para cada corretor" action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Nova Ação</Button>} />

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

      <DataSection title="Ações Registradas" badge={`${planos.length} itens`}>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : planos.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200 w-12">#</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Ação</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200 w-36">Prazo</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200 w-44">Status</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200 w-20">Ações</th>
              </tr>
            </thead>
            <tbody>
              {planos.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-400 font-medium">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{p.texto}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{p.prazo ? new Date(p.prazo + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100">
                    <select
                      value={p.status}
                      onChange={e => handleStatusChange(p.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 outline-none cursor-pointer ${statusColors[p.status]}`}
                    >
                      {PLANO_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100">
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Ação">
        <FormGroup label="Descrição da Ação">
          <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Descreva a ação a ser realizada..." className={`${inputClass} min-h-[100px] resize-y`} />
        </FormGroup>
        <FormRow>
          <FormGroup label="Prazo">
            <input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} className={inputClass} />
          </FormGroup>
          <FormGroup label="Status">
            <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
              {PLANO_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormGroup>
        </FormRow>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate}>Salvar</Button>
        </div>
      </Modal>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
