import { Box, Card, CardContent, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, children }: Props) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }} elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                mb: 1,
                color: 'white',
                display: 'flex',
              }}
            >
              <LockOutlinedIcon />
            </Box>
            <Typography component="h1" variant="h5" fontWeight={600}>
              {title}
            </Typography>
          </Box>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
