import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, KeyRound, RefreshCw, Camera, X } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { DataSection } from '../components/ui/DataSection';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { FormRow } from '../components/ui/FormRow';
import { Tag } from '../components/ui/Tag';
import { Toast } from '../components/ui/Toast';
import { Avatar } from '../components/ui/Avatar';
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
  const [createAvatarFile, setCreateAvatarFile] = useState<File | null>(null);
  const [createAvatarPreview, setCreateAvatarPreview] = useState<string | null>(null);
  const createAvatarInputRef = useRef<HTMLInputElement>(null);

  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeam, setEditTeam] = useState('');
  const [editRole, setEditRole] = useState('corretor');
  const [editActive, setEditActive] = useState(true);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    profilesService.getAll().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreateAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCreateAvatarFile(file);
    setCreateAvatarPreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!name || !email || password.length < 6) { showToast('Preencha todos os campos'); return; }
    try {
      const res = await profilesService.create({ name, email, password, team, role });
      const newUserId = res.data?.data?.id;
      if (createAvatarFile && newUserId) {
        await profilesService.uploadAvatar(newUserId, createAvatarFile);
      }
      setModalOpen(false); setName(''); setEmail(''); setPassword(''); setTeam(''); setRole('corretor');
      setCreateAvatarFile(null); setCreateAvatarPreview(null);
      showToast('Usuário criado'); load();
    } catch { showToast('Erro ao criar usuário'); }
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditName(u.name);
    setEditTeam(u.team);
    setEditRole(u.role);
    setEditActive(u.active);
    setEditAvatarPreview(u.avatar_url || null);
    setEditAvatarFile(null);
    setEditModalOpen(true);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAvatarFile(file);
    setEditAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = async () => {
    if (!editUser) return;
    setAvatarUploading(true);
    try {
      await profilesService.removeAvatar(editUser.id);
      setEditAvatarPreview(null);
      setEditAvatarFile(null);
      showToast('Foto removida');
      load();
    } catch { showToast('Erro ao remover foto'); }
    setAvatarUploading(false);
  };

  const handleEdit = async () => {
    if (!editUser || !editName) { showToast('Nome é obrigatório'); return; }
    try {
      await profilesService.update(editUser.id, { name: editName, team: editTeam, role: editRole as User['role'], active: editActive });
      if (editAvatarFile) {
        await profilesService.uploadAvatar(editUser.id, editAvatarFile);
      }
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
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700 font-semibold">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar_url} name={u.name} size="sm" />
                      {u.name}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">{u.email}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Tag variant="light">{u.team}</Tag></td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100">
                    {u.role === 'gestor' ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#800020] text-white">Gestor</span>
                    ) : (
                      <Tag variant="dark">Corretor</Tag>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><Tag variant={u.active ? 'success' : 'warning'}>{u.active ? 'Ativo' : 'Inativo'}</Tag></td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors" title="Editar">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => { setResetTarget(u); setResetPassword(generatePassword()); }} className="p-2 text-gray-400 hover:text-amber-500 transition-colors" title="Resetar Senha">
                        <KeyRound size={18} />
                      </button>
                      <button onClick={() => setDeleteTarget(u)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                        <Trash2 size={18} />
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
        <input type="file" ref={createAvatarInputRef} accept="image/*" className="hidden" onChange={handleCreateAvatarSelect} />
        <FormGroup label="Foto de Perfil">
          <div
            onClick={() => createAvatarInputRef.current?.click()}
            className="flex items-center gap-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer transition-all hover:border-gray-400 hover:bg-white"
          >
            {createAvatarPreview ? (
              <img src={createAvatarPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Camera size={16} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-500">
                {createAvatarPreview ? 'Foto selecionada' : 'Clique para selecionar uma foto'}
              </span>
            </div>
            {createAvatarPreview && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setCreateAvatarFile(null); setCreateAvatarPreview(null); }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Remover foto"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </FormGroup>
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
        <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={handleAvatarSelect} />
        <FormGroup label="Foto de Perfil">
          <div
            onClick={() => !avatarUploading && avatarInputRef.current?.click()}
            className={`flex items-center gap-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm transition-all ${avatarUploading ? 'opacity-50' : 'cursor-pointer hover:border-gray-400 hover:bg-white'}`}
          >
            {editAvatarPreview ? (
              <img src={editAvatarPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Camera size={16} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-500">
                {editAvatarPreview ? 'Clique para trocar a foto' : 'Clique para selecionar uma foto'}
              </span>
            </div>
            {editAvatarPreview && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); handleRemoveAvatar(); }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Remover foto"
                disabled={avatarUploading}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </FormGroup>
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
