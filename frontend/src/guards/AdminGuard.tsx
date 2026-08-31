import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/LoadingScreen';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { session, user, isAdmin, isLoading } = useAuth();

  if (isLoading || (session && !user)) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/shop" replace />;
  }

  return <>{children}</>;
}
