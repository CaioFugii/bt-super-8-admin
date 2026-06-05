import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  activateOrganizer,
  deactivateOrganizer,
  fetchOrganizers,
  resetOrganizerPassword,
} from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Organizer } from '../types/organizer';
import { extractApiErrorMessage } from '../utils/apiError';

type PendingAction =
  | { type: 'deactivate'; organizer: Organizer }
  | { type: 'reset'; organizer: Organizer };

export function OrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState<string | null>(null);

  const loadOrganizers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrganizers();
      setOrganizers(data);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizers();
  }, [loadOrganizers]);

  async function handleConfirm() {
    if (!pending) return;
    setActionLoading(true);
    try {
      if (pending.type === 'deactivate') {
        await deactivateOrganizer(pending.organizer.id);
      } else {
        const result = await resetOrganizerPassword(pending.organizer.id);
        setPasswordDialog(result.temporaryPassword);
      }
      setPending(null);
      await loadOrganizers();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleActivate(organizer: Organizer) {
    setActionLoading(true);
    try {
      await activateOrganizer(organizer.id);
      await loadOrganizers();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString('pt-BR');
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5">Organizadores</Typography>
        <Button
          component={RouterLink}
          to="/organizers/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Novo Organizador
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizers.map((organizer) => (
                <TableRow key={organizer.id}>
                  <TableCell>{organizer.name}</TableCell>
                  <TableCell>{organizer.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={organizer.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      color={organizer.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(organizer.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Button
                      component={RouterLink}
                      to={`/organizers/${organizer.id}/edit`}
                      size="small"
                    >
                      Editar
                    </Button>
                    {organizer.status === 'ACTIVE' ? (
                      <Button
                        size="small"
                        color="warning"
                        onClick={() =>
                          setPending({ type: 'deactivate', organizer })
                        }
                        disabled={actionLoading}
                      >
                        Desativar
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleActivate(organizer)}
                        disabled={actionLoading}
                      >
                        Ativar
                      </Button>
                    )}
                    <Button
                      size="small"
                      onClick={() => setPending({ type: 'reset', organizer })}
                      disabled={actionLoading}
                    >
                      Redefinir senha
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <ConfirmDialog
        open={pending?.type === 'deactivate'}
        title="Desativar organizador?"
        message={
          'Este usuário não conseguirá mais acessar a plataforma.'
        }
        confirmLabel="Desativar"
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending?.type === 'reset'}
        title="Redefinir senha?"
        message={
          'Uma nova senha provisória será gerada.\nA senha atual deixará de funcionar.'
        }
        confirmLabel="Redefinir"
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <Dialog
        open={Boolean(passwordDialog)}
        onClose={() => setPasswordDialog(null)}
      >
        <DialogTitle>Nova senha provisória</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 18 }}>
            {passwordDialog}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta senha será exibida apenas uma vez.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
