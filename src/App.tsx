import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { OrganizerFormPage } from './pages/OrganizerFormPage';
import { OrganizersPage } from './pages/OrganizersPage';
import { getAccessToken, isPlatformAdmin } from './store/authStore';

export default function App() {
  const isAuthenticated = Boolean(getAccessToken()) && isPlatformAdmin();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="organizers" element={<OrganizersPage />} />
          <Route path="organizers/new" element={<OrganizerFormPage />} />
          <Route path="organizers/:id/edit" element={<OrganizerFormPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
