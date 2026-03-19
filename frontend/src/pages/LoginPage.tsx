import { useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Alert,
  Box,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AuthLayout from '../components/AuthLayout';
import { useLogin } from '../hooks/useAuth';

export default function LoginPage() {
  const { handleLogin, loading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await handleLogin({ email, password });
  }

  return (
    <AuthLayout title="Sign In">
      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        aria-label="Login form"
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {error && (
          <Alert severity="error" role="alert">
            {error}
          </Alert>
        )}

        <TextField
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoComplete="email"
          autoFocus
          inputProps={{ 'aria-required': true }}
        />

        <TextField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          autoComplete="current-password"
          inputProps={{ 'aria-required': true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((s) => !s)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          aria-busy={loading}
          sx={{ mt: 1 }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Link component={RouterLink} to="/register" variant="body2">
            Don't have an account? Register
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
}
