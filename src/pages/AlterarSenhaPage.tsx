import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FormGroup } from '../components/ui/FormGroup';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import api from '../config/api';

export default function AlterarSenhaPage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', { newPassword });
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch {
      showToast('Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-sm text-white font-main text-[15px] transition-all duration-300 outline-none placeholder:text-gray-600 focus:border-white/30 focus:bg-white/[0.08]';

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-ambient" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.02) 0%, transparent 50%)',
      }} />

      <div className="relative z-10 w-full max-w-[420px] px-12">
        <div className="flex justify-center mb-2">
          <img src="/logo_haut_branca.png" alt="HAUT" className="h-28" />
        </div>
        <div className="text-[13px] text-gray-500 text-center tracking-[6px] uppercase mb-12" style={{ fontFamily: "'Mendl Sans Dawn', sans-serif", fontWeight: 300 }}>Alterar Senha</div>

        {user && (
          <div className="text-center mb-8">
            <p className="text-gray-400 text-sm">Olá, <span className="text-white font-medium">{user.name}</span></p>
            <p className="text-gray-500 text-[13px] mt-1">Defina uma nova senha para continuar</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup label="Nova Senha" dark>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className={inputClass}
            />
          </FormGroup>
          <FormGroup label="Confirmar Senha" dark>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              className={inputClass}
            />
          </FormGroup>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-white border-none rounded-sm font-main text-sm font-semibold tracking-widest uppercase cursor-pointer transition-all duration-300 mt-2 hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(181,113,112,0.3)] disabled:opacity-50"
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={logout}
              className="text-gray-500 text-[13px] bg-transparent border-none cursor-pointer transition-colors hover:text-white"
            >
              Sair da conta
            </button>
          </div>
        </form>
      </div>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
