import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useBrokerSelector } from '../hooks/useBrokerSelector';
import { useToast } from '../hooks/useToast';
import { MONTHS, CURRENT_YEAR } from '../config/constants';

export default function RelatoriosPage() {
  const navigate = useNavigate();
  const { brokers, selectedBrokerId, setSelectedBrokerId } = useBrokerSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);

  const handleGenerate = () => {
    if (!selectedBrokerId) { showToast('Selecione um corretor'); return; }
    const broker = brokers.find(b => b.id === selectedBrokerId);
    const slug = (broker?.name || 'corretor').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
    navigate(`/relatorios/preview/${slug}?brokerId=${selectedBrokerId}&month=${month}&year=${year}`);
  };

  const selectClass = 'px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]';

  return (
    <div>
      <PageHeader title="Relatórios" description="Gere relatórios de performance dos corretores" />

      <div className="bg-white border border-gray-200 rounded-[12px] p-8 mb-6">
        <div className="text-[15px] font-semibold tracking-tight mb-4">Relatório Individual de Performance</div>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Corretor</label>
            <select value={selectedBrokerId} onChange={e => setSelectedBrokerId(e.target.value)} className={selectClass}>
              {brokers.map(b => <option key={b.id} value={b.id}>{b.name} — {b.team}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Mês</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClass} style={{ minWidth: 150 }}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Ano</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClass} style={{ minWidth: 100 }}>
              {Array.from({ length: CURRENT_YEAR - 2024 }, (_, i) => CURRENT_YEAR - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <Button icon={<FileText size={16} />} onClick={handleGenerate}>
            Gerar Relatório
          </Button>
        </div>
      </div>
      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
