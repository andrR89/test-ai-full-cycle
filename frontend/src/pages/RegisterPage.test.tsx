import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import * as authApi from '../api/auth';

jest.mock('../api/auth');
const mockRegister = authApi.registerApi as jest.MockedFunction<typeof authApi.registerApi>;

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
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  );

beforeEach(() => jest.clearAllMocks());

test('renders all fields', () => {
  renderPage();
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
});

test('shows error when passwords do not match on submit', async () => {
  renderPage();
  await userEvent.type(screen.getByLabelText(/email address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'password1');
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'password2');
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match'));
  expect(mockRegister).not.toHaveBeenCalled();
});

test('shows error when password too short', async () => {
  renderPage();
  await userEvent.type(screen.getByLabelText(/email address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'short');
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'short');
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('at least 8 characters'));
});

test('shows inline helper when confirm password differs', async () => {
  renderPage();
  await userEvent.type(screen.getByLabelText(/^password$/i), 'password1');
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'other');
  expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
});

test('registers successfully and redirects', async () => {
  mockRegister.mockResolvedValueOnce({ token: 'tok456', user: { id: '2', email: 'a@b.com', createdAt: '' } });
  renderPage();
  await userEvent.type(screen.getByLabelText(/email address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));
  await waitFor(() => {
    expect(mockSetToken).toHaveBeenCalledWith('tok456');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

test('shows API error on duplicate email', async () => {
  mockRegister.mockRejectedValueOnce(Object.assign(new Error('Email already taken'), { status: 409 }));
  renderPage();
  await userEvent.type(screen.getByLabelText(/email address/i), 'dup@b.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Email already taken'));
});

test('renders link to login page', () => {
  renderPage();
  expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
});
