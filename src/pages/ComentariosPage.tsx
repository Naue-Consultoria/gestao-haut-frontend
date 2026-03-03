import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { CommentBox } from '../components/ui/CommentBox';
import { FormGroup } from '../components/ui/FormGroup';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useBrokerSelector } from '../hooks/useBrokerSelector';
import { useToast } from '../hooks/useToast';
import { comentariosService } from '../services/comentarios.service';
import { MONTHS, CURRENT_YEAR } from '../config/constants';
import { Comentario } from '../types';

export default function ComentariosPage() {
  const { brokers, selectedBrokerId, setSelectedBrokerId } = useBrokerSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [texto, setTexto] = useState('');
  const [history, setHistory] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedBrokerId) return;
    comentariosService.getByBrokerAndMonth(selectedBrokerId, month, year).then(c => {
      setTexto(c?.texto || '');
    });
    comentariosService.getByBroker(selectedBrokerId).then(setHistory);
  }, [selectedBrokerId, month, year]);

  const handleSave = async () => {
    if (!texto.trim()) { showToast('Escreva um comentário'); return; }
    setLoading(true);
    try {
      await comentariosService.upsert(selectedBrokerId, month, year, texto);
      showToast('Comentário salvo');
      comentariosService.getByBroker(selectedBrokerId).then(setHistory);
    } catch { showToast('Erro ao salvar'); }
    setLoading(false);
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white min-h-[100px] resize-y';

  return (
    <div>
      <PageHeader title="Comentários do Gestor" description="Feedback mensal para cada corretor" />

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
        <FormGroup label="Comentário do Diretor / Gente e Gestão">
          <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escreva seu feedback sobre a performance do corretor neste mês..." className={inputClass} />
        </FormGroup>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar Comentário'}</Button>
      </div>

      {history.filter(c => c.texto).map(c => (
        <CommentBox key={c.id} author={`${MONTHS[c.month]} ${c.year} — ${c.gestor?.name || 'Gestor'}`} text={c.texto} />
      ))}

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
