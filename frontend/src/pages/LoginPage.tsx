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
import { useLogin } from '../hooks/useAuth'

export default function LoginPage() {
  const { login, loading, error } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })

  const validate = (): boolean => {
    const errors = { email: '', password: '' }
    if (!email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email'
    if (!password) errors.password = 'Password is required'
    setFieldErrors(errors)
    return !errors.email && !errors.password
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await login({ email, password })
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
            Sign In
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
            aria-label="Login form"
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
              autoComplete="current-password"
              inputProps={{ 'aria-label': 'Password' }}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 2, mb: 1 }}
              aria-label={loading ? 'Signing in…' : 'Sign in'}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register" underline="hover">
              Register
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
