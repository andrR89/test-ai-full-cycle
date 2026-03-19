import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as authApi from '../api/auth';

jest.mock('../api/auth');
const mockLogin = authApi.loginApi as jest.MockedFunction<typeof authApi.loginApi>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockSetToken = jest.fn();
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ setToken: mockSetToken, getToken: jest.fn(), clearToken: jest.fn(), isAuthenticated: jest.fn() }),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders email and password fields', () => {
  renderPage();
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
});

test('renders sign in button', () => {
  renderPage();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('renders link to register page', () => {
  renderPage();
  expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
});

test('shows error on invalid credentials', async () => {
  mockLogin.mockRejectedValueOnce(Object.assign(new Error('Invalid credentials'), { status: 401 }));
  renderPage();
  await userEvent.type(screen.getByLabelText(/email address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'wrongpass');
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials'));
});

test('stores token and redirects on success', async () => {
  mockLogin.mockResolvedValueOnce({ token: 'tok123', user: { id: '1', email: 'a@b.com', createdAt: '' } });
  renderPage();
  await userEvent.type(screen.getByLabelText(/email address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() => {
    expect(mockSetToken).toHaveBeenCalledWith('tok123');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

test('disables button while loading', async () => {
  let resolve: (v: any) => void;
  mockLogin.mockReturnValueOnce(new Promise((r) => { resolve = r; }));
  renderPage();
  await userEvent.type(screen.getByLabelText(/email address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'pass');
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() => expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled());
});
