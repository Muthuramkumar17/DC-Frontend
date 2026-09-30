import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { useLogin } from '../hooks/useAuth.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const loginMutation = useLogin();
  const loading = loginMutation.isPending;

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);

    try {
      await loginMutation.mutateAsync({ email, password });
      const redirectTo = location.state?.from;
      const nextPath =
        typeof redirectTo === "string" &&
        redirectTo.startsWith("/") &&
        redirectTo !== "/login"
          ? redirectTo
          : "/dashboard";
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F3F7F6', p: 2 }}>
      <Paper component="form" onSubmit={handleLogin} elevation={3} sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#08302D' }}>Bathroom Care</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Sign in to the operations console</Typography>
          </Box>
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            required
            disabled={loading}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
            required
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}