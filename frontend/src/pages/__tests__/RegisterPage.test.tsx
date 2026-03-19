import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RegisterPage from '../RegisterPage';
import * as authApi from '../../api/authApi';

vi.mock('../../api/authApi');

const mockedRegister = vi.mocked(authApi.register);

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders all fields', () => {
    renderRegisterPage();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    renderRegisterPage();
    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different123');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match');
  });

  it('shows validation error when password is too short', async () => {
    renderRegisterPage();
    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'short');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'short');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('at least 8 characters');
  });

  it('stores token and navigates to dashboard on success', async () => {
    mockedRegister.mockResolvedValue({ token: 'new-token', user: { id: '2', email: 'user@example.com', createdAt: '' } });
    renderRegisterPage();
    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  it('shows API error on registration failure (email taken)', async () => {
    mockedRegister.mockRejectedValue(new Error('Email already in use'));
    renderRegisterPage();
    await userEvent.type(screen.getByLabelText(/email address/i), 'existing@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email already in use');
  });

  it('shows loading state while submitting', async () => {
    mockedRegister.mockImplementation(() => new Promise(() => {}));
    renderRegisterPage();
    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('button', { name: /creating account/i })).toBeDisabled();
  });

  it('has a link to the login page', () => {
    renderRegisterPage();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });
});
