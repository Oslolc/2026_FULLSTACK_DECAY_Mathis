import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="spinner" style={{ minHeight: '60vh' }} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
