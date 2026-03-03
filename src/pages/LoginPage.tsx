import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FormGroup } from '../components/ui/FormGroup';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [role, setRole] = useState('corretor');

  if (user && user.must_change_password) return <Navigate to="/alterar-senha" replace />;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      showToast('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || password.length < 6) {
      showToast('Preencha todos os campos corretamente');
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, name, team, role });
      navigate('/dashboard');
    } catch {
      showToast('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-sm text-white font-main text-[15px] transition-all duration-300 outline-none placeholder:text-gray-600 focus:border-white/30 focus:bg-white/[0.08]';
  const selectClass = `${inputClass} cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-ambient" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.02) 0%, transparent 50%)',
      }} />

      <div className="relative z-10 w-full max-w-[420px] px-12">
        <div className="flex justify-center mb-2">
          <img src="/logo_haut_branca.png" alt="HAUT" className="h-28" />
        </div>
        <div className="font-mono text-[11px] text-gray-500 text-center tracking-[3px] uppercase mb-12">Diário de Bordo</div>

        {!isRegister ? (
          <form onSubmit={handleLogin}>
            <FormGroup label="E-mail" dark>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className={inputClass} />
            </FormGroup>
            <FormGroup label="Senha" dark>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
            </FormGroup>
            <button type="submit" disabled={loading} className="w-full py-4 bg-accent text-white border-none rounded-sm font-main text-sm font-semibold tracking-widest uppercase cursor-pointer transition-all duration-300 mt-2 hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(181,113,112,0.3)] disabled:opacity-50">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <div className="text-center mt-6">
              <button type="button" onClick={() => setIsRegister(true)} className="text-gray-500 text-[13px] bg-transparent border-none cursor-pointer transition-colors hover:text-white">
                Criar nova conta
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <FormGroup label="Nome Completo" dark>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome Sobrenome" className={inputClass} />
            </FormGroup>
            <FormGroup label="E-mail" dark>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className={inputClass} />
            </FormGroup>
            <FormGroup label="Senha" dark>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} />
            </FormGroup>
            <FormGroup label="Equipe" dark>
              <input type="text" value={team} onChange={e => setTeam(e.target.value)} placeholder="Ex: Summit, Horizon..." className={inputClass} />
            </FormGroup>
            <FormGroup label="Perfil" dark>
              <select value={role} onChange={e => setRole(e.target.value)} className={selectClass}>
                <option value="corretor">Corretor</option>
                <option value="gestor">Gestor</option>
              </select>
            </FormGroup>
            <button type="submit" disabled={loading} className="w-full py-4 bg-accent text-white border-none rounded-sm font-main text-sm font-semibold tracking-widest uppercase cursor-pointer transition-all duration-300 mt-2 hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(181,113,112,0.3)] disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
            <div className="text-center mt-6">
              <button type="button" onClick={() => setIsRegister(false)} className="text-gray-500 text-[13px] bg-transparent border-none cursor-pointer transition-colors hover:text-white">
                Já tenho conta
              </button>
            </div>
          </form>
        )}
      </div>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
