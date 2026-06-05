import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken, isPlatformAdmin } from '../store/authStore';

export function ProtectedRoute() {
  if (!getAccessToken() || !isPlatformAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
