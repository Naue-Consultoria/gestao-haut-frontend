import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FormGroup } from '../components/ui/FormGroup';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

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

  const inputClass = 'w-full px-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-sm text-white font-main text-[15px] transition-all duration-300 outline-none placeholder:text-gray-600 focus:border-white/30 focus:bg-white/[0.08]';

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-ambient" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.02) 0%, transparent 50%)',
      }} />

      <div className="relative z-10 w-full max-w-[420px] px-12">
        {/* Logo - starts centered, moves up */}
        <div
          className="flex justify-center transition-all duration-700 ease-out"
          style={{
            marginBottom: phase >= 1 ? '8px' : '0px',
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(120px)',
            opacity: phase >= 0 ? 1 : 0,
          }}
        >
          <img
            src="/logo_haut_branca_login.png"
            alt="HAUT"
            className="h-28 animate-loginLogo"
          />
        </div>

        {/* Subtitle */}
        <div
          className="text-[13px] text-gray-500 text-center tracking-[6px] uppercase mb-12 transition-all duration-500 ease-out"
          style={{
            fontFamily: "'Mendl Sans Dawn', sans-serif",
            fontWeight: 300,
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          Diário de Bordo
        </div>

        {/* Form */}
        <div
          className="transition-all duration-500 ease-out"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
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
          </form>
        </div>
      </div>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
