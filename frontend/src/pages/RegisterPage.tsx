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
import { useRegister } from '../hooks/useAuth'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const { submit, loading, error } = useRegister()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }

    submit({ email, password })
  }

  const displayError = validationError ?? error

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
            Create Account
          </Typography>

          {displayError && (
            <Alert severity="error" role="alert" sx={{ mb: 2 }}>
              {displayError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Register form"
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
              autoComplete="new-password"
              inputProps={{ 'aria-label': 'Password' }}
            />
            <TextField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              fullWidth
              required
              autoComplete="new-password"
              inputProps={{ 'aria-label': 'Confirm Password' }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
              aria-label="Create account"
            >
              {loading ? <CircularProgress size={24} aria-label="Loading" /> : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" underline="hover">
              Sign In
            </MuiLink>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
