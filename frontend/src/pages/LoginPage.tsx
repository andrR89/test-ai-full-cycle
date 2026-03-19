import { useState, FormEvent } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Link as MuiLink,
} from '@mui/material'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { submit, loading, error } = useLogin()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit({ email, password })
  }

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography
            component="h1"
            variant="h5"
            align="center"
            gutterBottom
            fontWeight={700}
          >
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" role="alert" sx={{ mb: 2 }}>
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
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              fullWidth
              required
              autoComplete="email"
              autoFocus
              inputProps={{ 'aria-label': 'Email Address' }}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              fullWidth
              required
              autoComplete="current-password"
              inputProps={{ 'aria-label': 'Password' }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
              aria-label="Sign in"
            >
              {loading ? <CircularProgress size={24} aria-label="Loading" /> : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" align="center">
            Don&apos;t have an account?{' '}
            <MuiLink component={Link} to="/register" underline="hover">
              Register
            </MuiLink>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
