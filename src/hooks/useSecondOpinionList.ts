import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/apiClient';

export interface SecondOpinionItem {
  id: string;
  ecg_record_id: string;
  requesting_doctor_id: string;
  consultant_id: string;
  notes: string | null;
  response: string | null;
  status: 'pending' | 'accepted' | 'refused' | 'completed';
  created_at: string;
  updated_at: string;
}

interface UseSecondOpinionListResult {
  opinions: SecondOpinionItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateStatus: (id: string, status: 'accepted' | 'refused') => Promise<void>;
  respond: (id: string, response: string) => Promise<void>;
}

export function useSecondOpinionList(): UseSecondOpinionListResult {
  const [opinions, setOpinions] = useState<SecondOpinionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpinions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SecondOpinionItem[]>('/second-opinions');
      const list = Array.isArray(response) ? response : [];
      setOpinions(list);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement des demandes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpinions();
  }, [fetchOpinions]);

  const updateStatus = useCallback(async (id: string, status: 'accepted' | 'refused') => {
    await api.patch(`/second-opinions/${id}/status`, { status });
    setOpinions(prev => prev.map(o => o.id === id ? { ...o, status: status === 'accepted' ? 'accepted' : 'refused' } : o));
  }, []);

  const respond = useCallback(async (id: string, response: string) => {
    await api.patch(`/second-opinions/${id}/respond`, { response });
    setOpinions(prev => prev.map(o => o.id === id ? { ...o, response, status: 'completed' } : o));
  }, []);

  return { opinions, loading, error, refetch: fetchOpinions, updateStatus, respond };
}
