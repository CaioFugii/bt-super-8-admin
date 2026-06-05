import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { LoginPage } from '../pages/LoginPage';
import { clearSession } from '../store/authStore';

const navigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    clearSession();
    navigate.mockReset();
  });

  it('bloqueia organizador no portal admin', async () => {
    vi.spyOn(client, 'login').mockResolvedValue({
      accessToken: 'token',
      organizer: {
        id: '1',
        name: 'Org',
        email: 'org@test.com',
        role: 'ORGANIZER',
        status: 'ACTIVE',
      },
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByRole('textbox', { name: /e-mail/i }), 'org@test.com');
    await userEvent.type(screen.getByLabelText(/^senha/i), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByText('Acesso negado.')).toBeInTheDocument();
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redireciona admin após login', async () => {
    vi.spyOn(client, 'login').mockResolvedValue({
      accessToken: 'token',
      organizer: {
        id: '1',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'PLATFORM_ADMIN',
        status: 'ACTIVE',
      },
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByRole('textbox', { name: /e-mail/i }), 'admin@test.com');
    await userEvent.type(screen.getByLabelText(/^senha/i), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
