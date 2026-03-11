import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useBrokerSelector } from '../hooks/useBrokerSelector';
import { useToast } from '../hooks/useToast';
import { parceriasService } from '../services/parcerias.service';
import { MONTHS, CURRENT_YEAR } from '../config/constants';
import { Parceria } from '../types';

export default function RelatoriosPage() {
  const navigate = useNavigate();
  const { brokers } = useBrokerSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    parceriasService.getActive().then(data => {
      setParcerias(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  // Set default when brokers load and no selection yet
  useEffect(() => {
    if (!selectedId && brokers.length > 0 && parcerias.length === 0) {
      setSelectedId(brokers[0].id);
    }
  }, [brokers, parcerias]);

  const brokersInParcerias = new Set(
    parcerias.flatMap(p => (p.parceria_membros || []).map(m => m.broker_id))
  );
  const soloBrokers = brokers.filter(b => !brokersInParcerias.has(b.id));

  const isParceriaSelected = parcerias.some(p => p.id === selectedId);

  const handleGenerate = () => {
    if (!selectedId) { showToast('Selecione um corretor ou parceria'); return; }

    let name: string;
    if (isParceriaSelected) {
      name = parcerias.find(p => p.id === selectedId)?.nome || 'parceria';
    } else {
      name = brokers.find(b => b.id === selectedId)?.name || 'corretor';
    }

    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
    const type = isParceriaSelected ? 'parceria' : 'broker';
    navigate(`/relatorios/preview/${slug}?id=${selectedId}&type=${type}&month=${month}&year=${year}`);
  };

  const selectClass = 'px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]';

  return (
    <div>
      <PageHeader title="Relatórios" description="Gere relatórios de performance de corretores e parcerias" />

      <div className="bg-white border border-gray-200 rounded-[12px] p-8 mb-6">
        <div className="text-[15px] font-semibold tracking-tight mb-4">Relatório de Performance</div>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Corretor / Parceria</label>
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
