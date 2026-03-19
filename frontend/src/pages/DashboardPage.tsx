import { Box, Button, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <Typography component="h1" variant="h4" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You are successfully logged in.
        </Typography>
        <Button
          variant="outlined"
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </Button>
      </Box>
    </Container>
  )
}
