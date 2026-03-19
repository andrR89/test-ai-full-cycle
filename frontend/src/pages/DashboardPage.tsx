import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { getMe } from '../api/authApi';
import type { AuthUser } from '../types/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
      }}
    >
      {loading && <CircularProgress aria-label="Loading user data" />}
      {error && <Alert severity="error">{error}</Alert>}
      {user && (
        <>
          <Typography variant="h4" component="h1">
            Welcome, {user.email}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You are logged in.
          </Typography>
        </>
      )}
      <Button variant="outlined" onClick={handleLogout} aria-label="Logout">
        Logout
      </Button>
    </Box>
  );
}
