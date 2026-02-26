import type { UserRole } from '@/config/roles';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  hospitalId?: string | null;
}

/** Réponse brute du backend pour le login (rôles en anglais) */
export interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: 'doctor' | 'expert' | 'secretary' | 'admin';
  status: string;
  hospitalId: string | null;
}

export interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: BackendUser;
  tokens: BackendTokens;
}

/** Correspondance rôle backend (anglais) → rôle frontend (français) */
export const BACKEND_ROLE_TO_FRONTEND: Record<BackendUser['role'], UserRole> = {
  doctor:    'medecin',
  expert:    'cardiologue',
  secretary: 'secretaire',
  admin:     'admin',
};
