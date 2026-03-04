import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, User, Activity, Search, Layers, BookOpen, DollarSign,
  BarChart3, Target, MessageSquare, ClipboardList, Users, FileText, LogOut, ChevronsLeft, ChevronsRight, Camera
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { profilesService } from '../../services/profiles.service';

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
  { path: '/planos-acao', label: 'Plano de Ação', icon: ClipboardList },
  { path: '/usuarios', label: 'Usuários', icon: Users },
  { path: '/relatorios', label: 'Relatórios', icon: FileText },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      await profilesService.uploadAvatar(user.id, file);
      await refreshUser();
    } catch {
      console.error('Erro ao fazer upload do avatar');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const NavItem = ({ path, label, icon: Icon }: { path: string; label: string; icon: React.ElementType }) => {
    const active = location.pathname === path;
    return (
      <div
        onClick={() => handleNav(path)}
        title={collapsed ? label : undefined}
        className={`flex items-center gap-3 py-3 rounded-sm cursor-pointer transition-all duration-300 text-sm mb-0.5 ${
          collapsed ? 'justify-center px-2' : 'px-4'
        } ${
          active ? 'text-white bg-white/[0.08] font-medium border-l-2 border-accent' : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border-l-2 border-transparent'
        }`}
      >
        <Icon size={18} className={`flex-shrink-0 ${active ? 'opacity-100 text-accent' : 'opacity-60'}`} />
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => {
    if (collapsed) return <div className="border-t border-white/[0.06] mx-3 mt-3 mb-2" />;
    return <div className="text-[9px] font-semibold tracking-[3px] uppercase text-gray-600 px-3 pt-4 pb-2">{label}</div>;
  };

  return (
    <nav className={`bg-black text-white flex flex-col fixed top-0 left-0 h-screen z-[100] transition-all duration-300 ${
      collapsed ? 'w-[72px]' : 'w-[260px] max-lg:w-[220px]'
    } ${
      isOpen ? 'translate-x-0' : 'max-md:-translate-x-full'
    } max-md:w-[260px]`}>

      {/* Toggle button */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex absolute -right-3 top-7 w-6 h-6 bg-black border border-white/10 rounded-full items-center justify-center text-gray-500 hover:text-white hover:border-accent cursor-pointer transition-all duration-300 z-10"
      >
        {collapsed ? <ChevronsRight size={12} /> : <ChevronsLeft size={12} />}
      </button>

      {/* Header */}
      <div className={`border-b border-white/[0.06] flex flex-col items-center ${collapsed ? 'px-3 pt-5 pb-4' : 'px-6 pt-6 pb-5'}`}>
        <img src="/logo_haut_branca_login.png" alt="HAUT" className={`transition-all duration-300 ${collapsed ? 'h-7' : 'h-12'}`} />
        {!collapsed && (
          <div className="text-[9px] text-gray-500 tracking-[3px] uppercase mt-2" style={{ fontFamily: "'Mendl Sans Dawn', sans-serif", fontWeight: 300 }}>Diário de Bordo</div>
        )}
      </div>

      {/* Navigation */}
      <div className={`flex-1 py-4 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        <SectionLabel label="Principal" />
        {mainNav.map(item => <NavItem key={item.path} {...item} />)}

        <SectionLabel label="Diário de Bordo" />
        {diarioNav.map(item => <NavItem key={item.path} {...item} />)}

        {user?.role === 'gestor' && (
          <>
            <SectionLabel label="Gestão" />
            {gestorNav.map(item => <NavItem key={item.path} {...item} />)}
          </>
        )}
      </div>

      {/* User section */}
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      <div className={`py-4 border-t border-white/[0.06] ${collapsed ? 'px-3' : 'px-5'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Alterar foto"
            >
              <Avatar src={user?.avatar_url} name={user?.name || '?'} size="md" />
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={14} className="text-white" />
              </div>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="w-9 h-9 flex items-center justify-center bg-transparent border border-white/10 rounded-sm text-gray-500 cursor-pointer transition-all duration-300 hover:border-white/30 hover:text-white"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div
                className="relative group cursor-pointer flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="Alterar foto"
              >
                <Avatar src={user?.avatar_url} name={user?.name || '?'} size="md" />
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} className="text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{user?.name}</div>
                <div className="text-[11px] text-gray-500 truncate">
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
          </>
        )}
      </div>
    </nav>
  );
}
