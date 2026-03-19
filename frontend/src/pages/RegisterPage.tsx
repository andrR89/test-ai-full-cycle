import { useState, type FormEvent } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useRegister } from '../hooks/useAuth'

export default function RegisterPage() {
  const { register, loading, error } = useRegister()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', confirmPassword: '' })

  const validate = (): boolean => {
    const errors = { email: '', password: '', confirmPassword: '' }
    if (!email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email'
    if (!password) errors.password = 'Password is required'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'
    setFieldErrors(errors)
    return !errors.email && !errors.password && !errors.confirmPassword
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await register({ email, password })
  }

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight={700}>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Registration form"
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              fullWidth
              margin="normal"
              autoComplete="email"
              inputProps={{ 'aria-label': 'Email address' }}
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              fullWidth
              margin="normal"
              autoComplete="new-password"
              inputProps={{ 'aria-label': 'Password' }}
              disabled={loading}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              fullWidth
              margin="normal"
              autoComplete="new-password"
              inputProps={{ 'aria-label': 'Confirm password' }}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 2, mb: 1 }}
              aria-label={loading ? 'Creating account…' : 'Create account'}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign In
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
