import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { clearSession, setSession } from '../store/authStore';

function PrivatePage() {
  return <div>Área privada</div>;
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    clearSession();
  });

  it('redireciona para login sem sessão', () => {
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<PrivatePage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('permite acesso para platform admin', () => {
    setSession('token', {
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'PLATFORM_ADMIN',
      status: 'ACTIVE',
    });

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<PrivatePage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Área privada')).toBeInTheDocument();
  });
});
