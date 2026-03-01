import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/apiClient';
import type { DashboardStats, ActivityLogItem } from '@/types/dashboard';

interface UseDashboardStatsResult<T> {
  stats: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Récupère les statistiques du dashboard depuis le backend.
 * Le backend retourne automatiquement les stats adaptées au rôle
 * de l'utilisateur connecté (via le JWT).
 *
 * Usage :
 *   const { stats, loading } = useDashboardStats<AdminStats>();
 */
export function useDashboardStats<T = DashboardStats>(): UseDashboardStatsResult<T> {
  const [stats, setStats] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<T>('/dashboard/stats');
      setStats(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Récupère les logs d'activité récents (admin uniquement).
 */
export function useActivityLogs(limit = 5) {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<ActivityLogItem[]>('/dashboard/activity-logs', { limit });
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
}
