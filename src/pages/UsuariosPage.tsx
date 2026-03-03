import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { DataSection } from '../components/ui/DataSection';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { FormRow } from '../components/ui/FormRow';
import { Tag } from '../components/ui/Tag';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { profilesService } from '../services/profiles.service';
import { User } from '../types';

export default function UsuariosPage() {
  const { toast, showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [team, setTeam] = useState('');
  const [role, setRole] = useState('corretor');

  const load = useCallback(() => {
    setLoading(true);
    profilesService.getAll().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!name || !email || password.length < 6) { showToast('Preencha todos os campos'); return; }
    try {
      await profilesService.create({ name, email, password, team, role });
      setModalOpen(false); setName(''); setEmail(''); setPassword(''); setTeam(''); setRole('corretor');
      showToast('Usuário criado'); load();
    } catch { showToast('Erro ao criar usuário'); }
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white';

  return (
    <div>
      <PageHeader title="Gestão de Usuários" description="Cadastro e gerenciamento de corretores e gestores" action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Novo Usuário</Button>} />

      <DataSection title="Usuários Cadastrados">
        {loading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : (
          <table className="w-full border-collapse">
            <thead><tr>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Nome</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">E-mail</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Equipe</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Perfil</th>
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Status</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700 font-semibold">{u.name}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{u.email}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Tag variant="light">{u.team}</Tag></td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Tag variant="dark">{u.role === 'gestor' ? 'Gestor' : 'Corretor'}</Tag></td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Tag variant={u.active ? 'success' : 'warning'}>{u.active ? 'Ativo' : 'Inativo'}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Usuário">
        <FormGroup label="Nome Completo"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome Sobrenome" className={inputClass} /></FormGroup>
        <FormGroup label="E-mail"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" className={inputClass} /></FormGroup>
        <FormGroup label="Senha Inicial"><input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} /></FormGroup>
        <FormRow>
          <FormGroup label="Equipe"><input type="text" value={team} onChange={e => setTeam(e.target.value)} placeholder="Ex: Summit" className={inputClass} /></FormGroup>
          <FormGroup label="Perfil"><select value={role} onChange={e => setRole(e.target.value)} className={inputClass}><option value="corretor">Corretor</option><option value="gestor">Gestor</option></select></FormGroup>
        </FormRow>
        <div className="flex gap-3 justify-end mt-6"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={handleCreate}>Criar Usuário</Button></div>
      </Modal>
      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
