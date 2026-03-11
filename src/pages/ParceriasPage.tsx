import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { DataSection } from '../components/ui/DataSection';
import { useToast } from '../hooks/useToast';
import { parceriasService } from '../services/parcerias.service';
import { profilesService } from '../services/profiles.service';
import { Parceria, User } from '../types';
import { Users, Trash2, Edit3, Plus } from 'lucide-react';

export default function ParceriasPage() {
  const { toast, showToast } = useToast();
  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [brokers, setBrokers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [parceriasData, brokersData] = await Promise.all([
        parceriasService.getAll(),
        profilesService.getBrokers(),
      ]);
      setParcerias(parceriasData);
      setBrokers(brokersData);
    } catch {
      showToast('Erro ao carregar dados');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Brokers already in a partnership (excluding the one being edited)
  const usedBrokerIds = new Set(
    parcerias
      .filter(p => p.active && p.id !== editingId)
      .flatMap(p => (p.parceria_membros || []).map(m => m.broker_id))
  );

  const availableBrokers = brokers.filter(b => !usedBrokerIds.has(b.id));

  const resetForm = () => {
    setNome('');
    setSelectedBrokers([]);
    setEditingId(null);
    setModalOpen(false);
  };

  const handleEdit = (parceria: Parceria) => {
    setEditingId(parceria.id);
    setNome(parceria.nome);
    setSelectedBrokers((parceria.parceria_membros || []).map(m => m.broker_id));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) return showToast('Nome é obrigatório');
    if (selectedBrokers.length < 2) return showToast('Selecione pelo menos 2 corretores');

    setSaving(true);
    try {
      if (editingId) {
        await parceriasService.update(editingId, nome, true);
        await parceriasService.updateMembros(editingId, selectedBrokers);
        showToast('Parceria atualizada');
      } else {
        await parceriasService.create(nome, selectedBrokers);
        showToast('Parceria criada');
      }
      resetForm();
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Erro ao salvar');
    }
    setSaving(false);
  };

  const handleToggleActive = async (parceria: Parceria) => {
    try {
      await parceriasService.update(parceria.id, parceria.nome, !parceria.active);
      showToast(parceria.active ? 'Parceria desativada' : 'Parceria reativada');
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Erro ao atualizar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await parceriasService.delete(id);
      showToast('Parceria removida');
      await load();
    } catch {
      showToast('Erro ao remover');
    }
  };

  const toggleBroker = (id: string) => {
    setSelectedBrokers(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <PageHeader
        title="Parcerias"
        description="Gerencie parcerias entre corretores com metas e painéis compartilhados"
        action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Nova Parceria</Button>}
      />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : parcerias.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Nenhuma parceria cadastrada</div>
      ) : (
        <DataSection title="Parcerias Cadastradas">
          <div className="divide-y divide-gray-100">
            {parcerias.map(p => (
              <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.active ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {p.nome}
                      {!p.active && (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full uppercase tracking-wider">Inativa</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {(p.parceria_membros || []).map(m => m.broker?.name).filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(p)}
                    className={`px-3 py-1.5 text-xs rounded-sm border cursor-pointer transition-all ${
                      p.active
                        ? 'border-gray-200 text-gray-500 hover:border-gray-300'
                        : 'border-black bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {p.active ? 'Desativar' : 'Reativar'}
                  </button>
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DataSection>
      )}

      <Modal isOpen={modalOpen} onClose={resetForm} title={editingId ? 'Editar Parceria' : 'Nova Parceria'}>
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Nome da Parceria</label>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Ana + Pedro"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Corretores (mínimo 2)</label>
          <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
            {availableBrokers.map(b => (
              <label
                key={b.id}
                className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all ${
                  selectedBrokers.includes(b.id)
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedBrokers.includes(b.id)}
                  onChange={() => toggleBroker(b.id)}
                  className="accent-black"
                />
                <div>
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-xs text-gray-400">{b.team}</div>
                </div>
              </label>
            ))}
          </div>
          {selectedBrokers.length > 0 && (
            <div className="text-xs text-gray-400 mt-2">
              {selectedBrokers.length} corretor(es) selecionado(s)
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar Parceria'}
          </Button>
        </div>
      </Modal>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
