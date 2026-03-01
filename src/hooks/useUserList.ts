import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/apiClient';

/** Rôle backend → rôle frontend */
const BACKEND_TO_FRONTEND_ROLE: Record<string, string> = {
  doctor:    'medecin',
  expert:    'cardiologue',
  secretary: 'secretaire',
  admin:     'admin',
};
/** Rôle frontend → rôle backend */
const FRONTEND_TO_BACKEND_ROLE: Record<string, string> = {
  medecin:    'doctor',
  cardiologue: 'expert',
  secretaire: 'secretary',
  admin:      'admin',
};

export interface SystemUserItem {
  id: string;
  email: string;
  name: string;
  role: 'medecin' | 'cardiologue' | 'secretaire' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  hospital_id: string | null;
  specialty: string | null;
  phone: string | null;
  last_login: string | null;
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: SystemUserItem['role'];
  hospital_id?: string;
  specialty?: string;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: SystemUserItem['role'];
  status?: SystemUserItem['status'];
  hospital_id?: string | null;
  specialty?: string | null;
  phone?: string | null;
}

interface UseUserListResult {
  users: SystemUserItem[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createUser: (input: CreateUserInput) => Promise<SystemUserItem>;
  updateUser: (id: string, input: UpdateUserInput) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
}

function mapUser(raw: Record<string, unknown>): SystemUserItem {
  return {
    id:         raw.id as string,
    email:      raw.email as string,
    name:       (raw.full_name ?? raw.name ?? '') as string,
    role:       (BACKEND_TO_FRONTEND_ROLE[raw.role as string] ?? raw.role) as SystemUserItem['role'],
    status:     (raw.status as SystemUserItem['status']) ?? 'active',
    hospital_id: (raw.hospital_id ?? null) as string | null,
    specialty:  (raw.specialty ?? null) as string | null,
    phone:      (raw.phone ?? null) as string | null,
    last_login: (raw.last_login ?? null) as string | null,
    created_at: raw.created_at as string,
  };
}

export function useUserList(params: { role?: string; status?: string; limit?: number } = {}): UseUserListResult {
  const [users, setUsers] = useState<SystemUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string | number | undefined> = {
        limit: params.limit ?? 200,
      };
      if (params.role && params.role !== 'all') {
        queryParams.role = FRONTEND_TO_BACKEND_ROLE[params.role] ?? params.role;
      }
      if (params.status && params.status !== 'all') queryParams.status = params.status;

      const response = await api.get<Record<string, unknown>[]>('/users', queryParams);
      const list = Array.isArray(response) ? response : [];
      setUsers(list.map(mapUser));
      setTotal(list.length);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.role, params.status, params.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(async (input: CreateUserInput): Promise<SystemUserItem> => {
    const raw = await api.post<Record<string, unknown>>('/users', {
      ...input,
      full_name: input.name,
      role: FRONTEND_TO_BACKEND_ROLE[input.role] ?? input.role,
    });
    const user = mapUser(raw);
    setUsers(prev => [user, ...prev]);
    setTotal(prev => prev + 1);
    return user;
  }, []);

  const updateUser = useCallback(async (id: string, input: UpdateUserInput): Promise<void> => {
    const raw = await api.patch<Record<string, unknown>>(`/users/${id}`, {
      ...input,
      ...(input.name ? { full_name: input.name } : {}),
      ...(input.role ? { role: FRONTEND_TO_BACKEND_ROLE[input.role] } : {}),
    });
    const updated = mapUser(raw);
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
    setUsers(prev => prev.filter(u => u.id !== id));
    setTotal(prev => prev - 1);
  }, []);

  const activateUser = useCallback(async (id: string): Promise<void> => {
    await api.post(`/users/${id}/activate`);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u));
  }, []);

  const deactivateUser = useCallback(async (id: string): Promise<void> => {
    await api.post(`/users/${id}/deactivate`);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'inactive' } : u));
  }, []);

  return { users, total, loading, error, refetch: fetchUsers, createUser, updateUser, deleteUser, activateUser, deactivateUser };
}
