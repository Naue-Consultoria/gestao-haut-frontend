import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
import { positivacoesService } from '../services/positivacoes.service';
import { CURRENT_YEAR } from '../config/constants';
import { fmt } from '../utils/formatters';
import { Positivacao } from '../types';

export default function PositivacaoPage() {
  const { isGestor, parcerias, soloBrokers, selectedId, setSelectedId, getEffectiveBrokerId, getListBrokerId } = useBrokerParceriaSelector();
  const { toast, showToast } = useToast();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<Positivacao[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [oportunidade, setOportunidade] = useState('');
  const [parceria, setParceria] = useState('NÃO');
  const [vgv, setVgv] = useState('');
  const [comissao, setComissao] = useState('');

  const load = useCallback(() => {
    const brokerId = getListBrokerId();
    if (!brokerId) return;
    setLoading(true);
    positivacoesService.list(brokerId, month, year)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedId, month, year]);

  useEffect(() => { load(); }, [load]);

  const totalVGV = data.reduce((s, p) => s + Number(p.vgv), 0);
  const totalComissao = data.reduce((s, p) => s + Number(p.comissao), 0);

  const resetForm = () => {
    setModalOpen(false); setEditingId(null); setOportunidade(''); setParceria('NÃO'); setVgv(''); setComissao('');
  };

  const handleSave = async () => {
    if (!oportunidade) { showToast('Preencha a oportunidade'); return; }
    try {
      if (editingId) {
        await positivacoesService.update(editingId, { oportunidade, parceria, vgv: Number(vgv) || 0, comissao: Number(comissao) || 0 });
        showToast('Venda atualizada');
      } else {
        const payload: any = { month, year, oportunidade, parceria, vgv: Number(vgv) || 0, comissao: Number(comissao) || 0 };
        if (isGestor) payload.broker_id = getEffectiveBrokerId();
        await positivacoesService.create(payload);
        showToast('Venda registrada');
      }
      resetForm(); load();
    } catch { showToast('Erro ao salvar'); }
  };

  const handleEdit = (row: Positivacao) => {
    setEditingId(row.id);
    setOportunidade(row.oportunidade);
    setParceria(row.parceria);
    setVgv(String(row.vgv));
    setComissao(String(row.comissao));
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await positivacoesService.delete(id);
      showToast('Registro excluído');
      load();
    } catch { showToast('Erro ao excluir'); }
  };

  const selectClass = 'px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]';
  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';

  return (
    <div>
      <PageHeader
        title="Quadro de Positivação"
        description="Vendas efetivadas no mês"
        action={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setModalOpen(true); }}>Registrar Venda</Button>}
      />

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
        <StatCard label="VGV Total" value={fmt(totalVGV)} />
        <StatCard label="Comissão Total" value={fmt(totalComissao)} />
        <StatCard label="Vendas" value={String(data.length)} />
      </StatsGrid>

      <DataSection title="Vendas Registradas" badge={`${data.length} registros`}>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Oportunidade</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Parceria</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">VGV Líquido</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Comissão</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.oportunidade}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{row.parceria}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{fmt(row.vgv)}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{fmt(row.comissao)}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100">
                    <div className="flex gap-1"><Button variant="icon" size="sm" onClick={() => handleEdit(row)}><Pencil size={18} /></Button><Button variant="icon" size="sm" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></Button></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      <Modal isOpen={modalOpen} onClose={resetForm} title={editingId ? 'Editar Venda' : 'Registrar Venda'}>
        <FormGroup label="Oportunidade / Empreendimento">
          <input type="text" value={oportunidade} onChange={e => setOportunidade(e.target.value)} placeholder="Nome do empreendimento" className={inputClass} />
        </FormGroup>
        <FormRow>
          <FormGroup label="Parceria?">
            <select value={parceria} onChange={e => setParceria(e.target.value)} className={inputClass}>
              <option>NÃO</option><option>SIM</option>
            </select>
          </FormGroup>
          <FormGroup label="VGV Líquido (R$)">
            <CurrencyInput value={vgv} onChange={setVgv} className={inputClass} />
          </FormGroup>
        </FormRow>
        <FormGroup label="Comissão Corretor (R$)">
          <CurrencyInput value={comissao} onChange={setComissao} className={inputClass} />
        </FormGroup>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          <Button onClick={handleSave}>{editingId ? 'Atualizar' : 'Salvar'}</Button>
        </div>
      </Modal>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
