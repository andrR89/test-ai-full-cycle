import { Box, Button, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          You are logged in.
        </Typography>
        <Button variant="outlined" onClick={handleLogout} aria-label="Logout">
          Logout
        </Button>
      </Box>
    </Container>
  )
}
