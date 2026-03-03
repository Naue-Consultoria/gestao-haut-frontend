import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, User, Activity, Search, Layers, BookOpen, DollarSign,
  BarChart3, Target, MessageSquare, Users, LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

const mainNav = [
  { path: '/dashboard', label: 'Painel Geral', icon: LayoutGrid },
  { path: '/individual', label: 'Corretor Individual', icon: User },
];

const diarioNav = [
  { path: '/positivacao', label: 'Positivação', icon: Activity },
  { path: '/captacao', label: 'Captação', icon: Search },
  { path: '/negocios', label: 'Negócios Levantados', icon: Layers },
  { path: '/treinamentos', label: 'Treinamentos', icon: BookOpen },
  { path: '/investimentos', label: 'Investimentos', icon: DollarSign },
];

const gestorNav = [
  { path: '/ranking', label: 'Ranking', icon: BarChart3 },
  { path: '/metas', label: 'Definir Metas', icon: Target },
  { path: '/comentarios', label: 'Comentários', icon: MessageSquare },
  { path: '/usuarios', label: 'Usuários', icon: Users },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const NavItem = ({ path, label, icon: Icon }: { path: string; label: string; icon: React.ElementType }) => {
    const active = location.pathname === path;
    return (
      <div
        onClick={() => handleNav(path)}
        className={`flex items-center gap-3 px-4 py-3 rounded-sm cursor-pointer transition-all duration-300 text-sm mb-0.5 ${
          active ? 'text-white bg-white/[0.08] font-medium' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        <Icon size={18} className={`flex-shrink-0 ${active ? 'opacity-100' : 'opacity-60'}`} />
        {label}
      </div>
    );
  };

  return (
    <nav className={`w-[260px] bg-black text-white flex flex-col fixed top-0 left-0 h-screen z-[100] transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'max-md:-translate-x-full'
    } max-lg:w-[220px] max-md:w-[260px]`}>
      <div className="px-6 pt-8 pb-6 border-b border-white/[0.06]">
        <div className="text-[22px] font-bold tracking-[8px]">HAUT</div>
        <div className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mt-1">Diário de Bordo 2026</div>
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-[9px] font-semibold tracking-[3px] uppercase text-gray-600 px-3 pt-4 pb-2">Principal</div>
        {mainNav.map(item => <NavItem key={item.path} {...item} />)}

        <div className="text-[9px] font-semibold tracking-[3px] uppercase text-gray-600 px-3 pt-4 pb-2">Diário de Bordo</div>
        {diarioNav.map(item => <NavItem key={item.path} {...item} />)}

        {user?.role === 'gestor' && (
          <>
            <div className="text-[9px] font-semibold tracking-[3px] uppercase text-gray-600 px-3 pt-4 pb-2">Gestão</div>
            {gestorNav.map(item => <NavItem key={item.path} {...item} />)}
          </>
        )}
      </div>

      <div className="px-5 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-white">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div>
            <div className="text-[13px] font-medium">{user?.name}</div>
            <div className="text-[11px] text-gray-500">
              {user?.role === 'gestor' ? 'Gestor' : `Corretor — ${user?.team}`}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="block w-full mt-3 py-2 bg-transparent border border-white/10 rounded-sm text-gray-500 font-main text-xs cursor-pointer transition-all duration-300 hover:border-white/30 hover:text-white"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
