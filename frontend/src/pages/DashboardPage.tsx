import { useEffect, useState } from 'react'
import { Box, Button, Container, Typography, CircularProgress, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getMeApi, getApiErrorMessage } from '../api/authApi'
import type { User } from '../types/auth'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    getMeApi()
      .then(setUser)
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load user')))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {loading && <CircularProgress aria-label="Loading user data" />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {error}
          </Alert>
        )}

        {user && (
          <Typography variant="body1" sx={{ mb: 3 }}>
            Welcome, <strong>{user.email}</strong>
          </Typography>
        )}

        <Button
          variant="outlined"
          onClick={handleLogout}
          aria-label="Log out"
        >
          Log Out
        </Button>
      </Box>
    </Container>
  )
}
