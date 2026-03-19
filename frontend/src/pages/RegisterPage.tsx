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
import { useRegister } from '../hooks/useAuth';

export default function RegisterPage() {
  const { handleRegister, loading, error } = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    await handleRegister({ email, password });
  }

  const displayError = validationError ?? error;

  return (
    <AuthLayout title="Create Account">
      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        aria-label="Register form"
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {displayError && (
          <Alert severity="error" role="alert">
            {displayError}
          </Alert>
        )}

        <TextField
          id="reg-email"
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
          id="reg-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          helperText="Minimum 8 characters"
          inputProps={{ 'aria-required': true, minLength: 8 }}
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

        <TextField
          id="reg-confirm-password"
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          inputProps={{ 'aria-required': true }}
          error={confirmPassword.length > 0 && password !== confirmPassword}
          helperText={
            confirmPassword.length > 0 && password !== confirmPassword
              ? 'Passwords do not match'
              : ''
          }
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          aria-busy={loading}
          sx={{ mt: 1 }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Link component={RouterLink} to="/login" variant="body2">
            Already have an account? Sign In
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
}
