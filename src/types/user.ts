import type { UserRole } from '@/config/roles';

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}
