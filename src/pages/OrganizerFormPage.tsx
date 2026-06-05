import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { createOrganizer, fetchOrganizers, updateOrganizer } from '../api/client';
import { extractApiErrorMessage } from '../utils/apiError';

export function OrganizerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [successPassword, setSuccessPassword] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchOrganizers()
      .then((organizers) => {
        const organizer = organizers.find((item) => item.id === id);
        if (!organizer) {
          setError('Organizador não encontrado.');
          return;
        }
        setName(organizer.name);
        setEmail(organizer.email);
      })
      .catch((err) => setError(extractApiErrorMessage(err)))
      .finally(() => setInitialLoading(false));
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEdit && id) {
        await updateOrganizer(id, { name, email });
        navigate('/organizers');
        return;
      }

      const result = await createOrganizer({
        name,
        email,
        temporaryPassword: temporaryPassword || undefined,
      });
      if (result.temporaryPassword) {
        setSuccessPassword(result.temporaryPassword);
      } else {
        navigate('/organizers');
      }
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box maxWidth={480}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Editar Organizador' : 'Novo Organizador'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Nome"
          fullWidth
          required
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="E-mail"
          type="email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!isEdit && (
          <TextField
            label="Senha provisória (opcional)"
            type="password"
            fullWidth
            margin="normal"
            value={temporaryPassword}
            onChange={(e) => setTemporaryPassword(e.target.value)}
            helperText="Deixe em branco para gerar automaticamente."
          />
        )}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button component={RouterLink} to="/organizers">
            Cancelar
          </Button>
        </Box>
      </Box>

      <Dialog open={Boolean(successPassword)} onClose={() => navigate('/organizers')}>
        <DialogTitle>Organizador criado com sucesso</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Senha provisória:</Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 18 }}>
            {successPassword}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta senha será exibida apenas uma vez.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/organizers')}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
