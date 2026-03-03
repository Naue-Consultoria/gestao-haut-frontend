import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function GestorRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'gestor') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
