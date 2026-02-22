import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserSession } from '@/types/user';
import type { UserRole } from '@/config/roles';
import { useNotificationStore } from '@/stores/useNotificationStore';

const STORAGE_KEY = 'xpress-ecg-user';
const SESSION_KEY = 'xpress-ecg-session';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ACCOUNTS: Record<string, UserSession> = {
  'cardiologue@demo.fr': { email: 'cardiologue@demo.fr', name: 'Dr. Sophie Bernard', role: 'cardiologue' },
  'medecin@demo.fr': { email: 'medecin@demo.fr', name: 'Dr. Jean Martin', role: 'medecin' },
  'secretaire@demo.fr': { email: 'secretaire@demo.fr', name: 'Marie Dupont', role: 'secretaire' },
  'admin@demo.fr': { email: 'admin@demo.fr', name: 'Admin Système', role: 'admin' },
};

function resolveUserFromEmail(email: string): UserSession {
  const demoUser = DEMO_ACCOUNTS[email];
  if (demoUser) return demoUser;

  const roleMappings: { keyword: string; name: string; role: UserRole }[] = [
    { keyword: 'cardiologue', name: 'Cardiologue', role: 'cardiologue' },
    { keyword: 'medecin', name: 'Médecin', role: 'medecin' },
    { keyword: 'secretaire', name: 'Secrétaire', role: 'secretaire' },
    { keyword: 'admin', name: 'Administrateur', role: 'admin' },
  ];

  for (const mapping of roleMappings) {
    if (email.includes(mapping.keyword)) {
      return { email, name: mapping.name, role: mapping.role };
    }
  }

  return { email, name: 'Utilisateur', role: 'medecin' };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const initNotifications = useNotificationStore(s => s.initForRole);

  useEffect(() => {
    // Cherche d'abord dans localStorage (rememberMe), puis sessionStorage
    const saved =
      localStorage.getItem(STORAGE_KEY) ??
      sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed: UserSession = JSON.parse(saved);
        setUser(parsed);
        initNotifications(parsed.role);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, [initNotifications]);

  const login = useCallback(async (email: string, _password: string, rememberMe = false) => {
    const session = resolveUserFromEmail(email);
    setUser(session);
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.removeItem(STORAGE_KEY);
    }
    initNotifications(session.role);
  }, [initNotifications]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  // En mode démo, simule l'envoi d'un email de réinitialisation
  const requestPasswordReset = useCallback(async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.info(`[Demo] Email de réinitialisation envoyé à ${email}`);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, requestPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
