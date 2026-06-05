import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchDashboard } from '../api/client';
import type { DashboardStats } from '../types/organizer';
import { extractApiErrorMessage } from '../utils/apiError';

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setStats)
      .catch((err) => setError(extractApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard title="Organizadores ativos" value={stats.activeCount} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Organizadores inativos" value={stats.inactiveCount} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Total de organizadores" value={stats.totalCount} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Total de torneios" value={stats.totalTournaments} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Torneios ativos" value={stats.activeTournaments} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Torneios finalizados"
            value={stats.finishedTournaments}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
