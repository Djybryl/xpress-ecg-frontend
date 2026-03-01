import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/apiClient';

export interface HospitalItem {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface CreateHospitalInput {
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
}

export interface UpdateHospitalInput {
  name?: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: 'active' | 'inactive' | 'pending';
}

interface UseHospitalListResult {
  hospitals: HospitalItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createHospital: (input: CreateHospitalInput) => Promise<HospitalItem>;
  updateHospital: (id: string, input: UpdateHospitalInput) => Promise<void>;
  deleteHospital: (id: string) => Promise<void>;
}

export function useHospitalList(): UseHospitalListResult {
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<HospitalItem[]>('/hospitals');
      setHospitals(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement des établissements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const createHospital = useCallback(async (input: CreateHospitalInput): Promise<HospitalItem> => {
    const hospital = await api.post<HospitalItem>('/hospitals', input);
    setHospitals(prev => [...prev, hospital]);
    return hospital;
  }, []);

  const updateHospital = useCallback(async (id: string, input: UpdateHospitalInput): Promise<void> => {
    const updated = await api.patch<HospitalItem>(`/hospitals/${id}`, input);
    setHospitals(prev => prev.map(h => h.id === id ? updated : h));
  }, []);

  const deleteHospital = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/hospitals/${id}`);
    setHospitals(prev => prev.filter(h => h.id !== id));
  }, []);

  return { hospitals, loading, error, refetch: fetchHospitals, createHospital, updateHospital, deleteHospital };
}
