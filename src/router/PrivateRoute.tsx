import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Force password change redirect (except if already on the change password page)
  if (user.must_change_password && location.pathname !== '/alterar-senha') {
    return <Navigate to="/alterar-senha" replace />;
  }

  return <>{children}</>;
}
