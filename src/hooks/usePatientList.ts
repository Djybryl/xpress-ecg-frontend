import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/apiClient';

export interface PatientItem {
  id: string;
  name: string;
  date_of_birth: string | null;
  gender: 'M' | 'F' | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  hospital_id: string | null;
  created_at: string;
  ecg_count: number;
  last_ecg_date: string | null;
}

export interface PatientListParams {
  search?: string;
  hospital_id?: string;
  limit?: number;
}

interface UsePatientListResult {
  patients: PatientItem[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePatientList(params: PatientListParams = {}): UsePatientListResult {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string | number | undefined> = {
        limit: params.limit ?? 200,
      };
      if (params.search)      queryParams.search      = params.search;
      if (params.hospital_id) queryParams.hospital_id = params.hospital_id;

      const response = await api.get<{ patients?: PatientItem[]; total?: number } | PatientItem[]>(
        '/patients',
        queryParams,
      );

      // Le backend retourne { data: patients[] } via ApiResponse wrapper
      // mais notre api.get() retourne directement data
      const list = Array.isArray(response)
        ? response
        : ((response as { patients?: PatientItem[] }).patients ?? []);
      const tot = Array.isArray(response)
        ? list.length
        : ((response as { total?: number }).total ?? list.length);

      setPatients(list);
      setTotal(tot);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement des patients');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search, params.hospital_id, params.limit]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return { patients, total, loading, error, refetch: fetchPatients };
}
