import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, KeyRound, RefreshCw } from 'lucide-react';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [team, setTeam] = useState('');
  const [role, setRole] = useState('corretor');

  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeam, setEditTeam] = useState('');
  const [editRole, setEditRole] = useState('corretor');
  const [editActive, setEditActive] = useState(true);

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

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditName(u.name);
    setEditTeam(u.team);
    setEditRole(u.role);
    setEditActive(u.active);
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editUser || !editName) { showToast('Nome é obrigatório'); return; }
    try {
      await profilesService.update(editUser.id, { name: editName, team: editTeam, role: editRole as User['role'], active: editActive });
      setEditModalOpen(false);
      showToast('Usuário atualizado'); load();
    } catch { showToast('Erro ao atualizar'); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await profilesService.delete(deleteTarget.id);
      showToast('Usuário excluído'); load();
    } catch { showToast('Erro ao excluir'); }
    setDeleteTarget(null);
  };

  const generatePassword = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    return pwd;
  }, []);

  const handleResetPassword = async () => {
    if (!resetTarget || resetPassword.length < 6) { showToast('Senha deve ter no mínimo 6 caracteres'); return; }
    try {
      await profilesService.resetPassword(resetTarget.id, resetPassword);
      showToast('Senha resetada com sucesso');
      setResetTarget(null); setResetPassword('');
    } catch { showToast('Erro ao resetar senha'); }
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
              <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-right px-6 py-3.5 bg-gray-50 border-b border-gray-200">Ações</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700 font-semibold">{u.name}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{u.email}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Tag variant="light">{u.team}</Tag></td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Tag variant="dark">{u.role === 'gestor' ? 'Gestor' : 'Corretor'}</Tag></td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Tag variant={u.active ? 'success' : 'warning'}>{u.active ? 'Ativo' : 'Inativo'}</Tag></td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { setResetTarget(u); setResetPassword(generatePassword()); }} className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors" title="Resetar Senha">
                        <KeyRound size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(u)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      {/* Modal Criar */}
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

      {/* Modal Editar */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Usuário">
        <FormGroup label="Nome Completo"><input type="text" value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} /></FormGroup>
        <FormRow>
          <FormGroup label="Equipe"><input type="text" value={editTeam} onChange={e => setEditTeam(e.target.value)} className={inputClass} /></FormGroup>
          <FormGroup label="Perfil"><select value={editRole} onChange={e => setEditRole(e.target.value)} className={inputClass}><option value="corretor">Corretor</option><option value="gestor">Gestor</option></select></FormGroup>
        </FormRow>
        <FormGroup label="Status">
          <select value={editActive ? 'true' : 'false'} onChange={e => setEditActive(e.target.value === 'true')} className={inputClass}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </FormGroup>
        <div className="flex gap-3 justify-end mt-6"><Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button><Button onClick={handleEdit}>Salvar</Button></div>
      </Modal>

      {/* Modal Excluir */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Excluir usuário">
        <p className="text-sm text-gray-600 mb-6">
          Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Todos os dados associados a este usuário serão removidos permanentemente.
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

      {/* Modal Resetar Senha */}
      <Modal isOpen={!!resetTarget} onClose={() => setResetTarget(null)} title="Resetar Senha">
        <p className="text-sm text-gray-600 mb-4">
          Defina uma nova senha temporária para <strong>{resetTarget?.name}</strong>. O usuário será obrigado a trocar a senha no próximo login.
        </p>
        <FormGroup label="Nova Senha">
          <div className="flex gap-2">
            <input type="text" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} />
            <button onClick={() => setResetPassword(generatePassword())} className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-sm text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors shrink-0" title="Gerar senha" type="button">
              <RefreshCw size={16} />
            </button>
          </div>
        </FormGroup>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={() => setResetTarget(null)}>Cancelar</Button>
          <Button onClick={handleResetPassword}>Resetar</Button>
        </div>
      </Modal>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
