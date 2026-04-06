import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { FormGroup } from '../components/ui/FormGroup';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useBrokerSelector } from '../hooks/useBrokerSelector';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { comentariosService } from '../services/comentarios.service';
import { parceriasService } from '../services/parcerias.service';
import { MONTHS, CURRENT_YEAR } from '../config/constants';
import { Comentario, Parceria } from '../types';
import { Modal } from '../components/ui/Modal';
import { Pencil, Trash2 } from 'lucide-react';

export default function ComentariosPage() {
  const { user } = useAuth();
  const isGestor = user?.role === 'gestor';
  const { brokers, selectedBrokerId } = useBrokerSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [texto, setTexto] = useState('');
  const [history, setHistory] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comentario | null>(null);

  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    parceriasService.getActive().then(setParcerias).catch(console.error);
  }, []);

  // For corretor: filter parcerias to only those they belong to
  const visibleParcerias = isGestor
    ? parcerias
    : parcerias.filter(p => (p.parceria_membros || []).some(m => m.broker_id === user?.id));

  // Sync selectedId with first available option
  useEffect(() => {
    if (selectedId) return;
    if (isGestor) {
      if (parcerias.length > 0) {
        setSelectedId(parcerias[0].id);
      } else if (selectedBrokerId) {
        setSelectedId(selectedBrokerId);
      }
    } else {
      // Corretor: prefer their parceria, otherwise their own ID
      if (visibleParcerias.length > 0) {
        setSelectedId(visibleParcerias[0].id);
      } else if (user?.id) {
        setSelectedId(user.id);
      }
    }
  }, [parcerias, selectedBrokerId, isGestor, visibleParcerias, user]);

  // Brokers in partnerships (excluded from solo list)
  const brokersInParcerias = new Set(
    parcerias.flatMap(p => (p.parceria_membros || []).map(m => m.broker_id))
  );
  const soloBrokers = isGestor
    ? brokers.filter(b => !brokersInParcerias.has(b.id))
    : brokers.filter(b => b.id === user?.id && !brokersInParcerias.has(b.id));

  const isParceriaSelected = visibleParcerias.some(p => p.id === selectedId);

  const loadData = useCallback(async () => {
    if (!selectedId) return;

    try {
      if (isParceriaSelected) {
        const c = await parceriasService.getComentarioByMonth(selectedId, month, year);
        setTexto(c?.texto || '');
        setEditingId(null);
        const all = await parceriasService.getComentarios(selectedId);
        setHistory(all);
      } else {
        const c = await comentariosService.getByBrokerAndMonth(selectedId, month, year);
        setTexto(c?.texto || '');
        setEditingId(null);
        const all = await comentariosService.getByBroker(selectedId);
        setHistory(all);
      }
    } catch {
      setTexto('');
      setHistory([]);
    }
  }, [selectedId, isParceriaSelected, month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!texto.trim()) { showToast('Escreva um comentário'); return; }
    setLoading(true);
    try {
      if (isParceriaSelected) {
        await parceriasService.upsertComentario(selectedId, month, year, texto);
      } else {
        await comentariosService.upsert(selectedId, month, year, texto);
      }
      showToast('Comentário salvo');
      setEditingId(null);
      await loadData();
    } catch { showToast('Erro ao salvar'); }
    setLoading(false);
  };

  const handleEdit = (c: Comentario) => {
    setMonth(c.month);
    setYear(c.year);
    setTexto(c.texto);
    setEditingId(c.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (isParceriaSelected) {
        await parceriasService.deleteComentario(deleteTarget.id);
      } else {
        await comentariosService.delete(deleteTarget.id);
      }
      showToast('Comentário excluído');
      if (editingId === deleteTarget.id) {
        setTexto('');
        setEditingId(null);
      }
      await loadData();
    } catch { showToast('Erro ao excluir'); }
    setDeleteTarget(null);
  };

  const handleCancel = async () => {
    setEditingId(null);
    try {
      if (isParceriaSelected) {
        const c = await parceriasService.getComentarioByMonth(selectedId, month, year);
        setTexto(c?.texto || '');
      } else {
        const c = await comentariosService.getByBrokerAndMonth(selectedId, month, year);
        setTexto(c?.texto || '');
      }
    } catch {
      setTexto('');
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white min-h-[100px] resize-y';

  return (
    <div>
      <PageHeader
        title={isGestor ? "Comentários do Gestor" : "Comentários"}
        description={isGestor ? "Feedback mensal para corretores e parcerias" : "Feedback mensal do gestor"}
      />

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {(isGestor || visibleParcerias.length + soloBrokers.length > 1) && (
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]"
          >
            {visibleParcerias.length > 0 && (
              <optgroup label="Parcerias">
                {visibleParcerias.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </optgroup>
            )}
            {soloBrokers.length > 0 && (
              <optgroup label={isGestor ? "Corretores" : "Individual"}>
                {soloBrokers.map(b => (
                  <option key={b.id} value={b.id}>{b.name} — {b.team}</option>
                ))}
              </optgroup>
            )}
          </select>
        )}
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer">
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer">
          {Array.from({ length: CURRENT_YEAR - 2024 }, (_, i) => CURRENT_YEAR - i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {isGestor && (
        <div className="bg-white border border-gray-200 rounded-[12px] p-8 mb-6">
          <FormGroup label={editingId ? `Editando comentário — ${MONTHS[month]} ${year}` : 'Comentário do Diretor / Gente e Gestão'}>
            <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escreva seu feedback sobre a performance neste mês..." className={inputClass} />
          </FormGroup>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar Comentário'}</Button>
            {editingId && (
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-main text-gray-500 hover:text-gray-700 transition-colors">
                Cancelar edição
              </button>
            )}
          </div>
        </div>
      )}

      {history.filter(c => c.texto).map(c => (
        <div key={c.id} className="group bg-gray-50 border-l-[3px] border-l-black py-5 px-6 rounded-r-sm mx-6 mb-6 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              {MONTHS[c.month]} {c.year} — {c.gestor?.name || 'Gestor'}
            </div>
            {isGestor && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(c)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors" title="Editar">
                  <Pencil size={18} />
                </button>
                <button onClick={() => setDeleteTarget(c)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
          <div className="text-sm leading-relaxed text-gray-700">{c.texto}</div>
        </div>
      ))}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Excluir comentário">
        <p className="text-sm text-gray-600 mb-6">
          Tem certeza que deseja excluir o comentário de <strong>{deleteTarget && `${MONTHS[deleteTarget.month]} ${deleteTarget.year}`}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-main text-gray-500 hover:text-gray-700 transition-colors">
            Cancelar
          </button>
          <button onClick={confirmDelete} className="px-4 py-2 text-sm font-main bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors">
            Excluir
          </button>
        </div>
      </Modal>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
