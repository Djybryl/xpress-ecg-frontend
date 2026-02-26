import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { UserSession, LoginResponse } from '@/types/user';
import { BACKEND_ROLE_TO_FRONTEND } from '@/types/user';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { api, tokenStorage, ApiError } from '@/lib/apiClient';

const SESSION_KEY = 'xecg-user-session';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Convertit la réponse backend en UserSession frontend */
function toUserSession(data: LoginResponse): UserSession {
  return {
    id:         data.user.id,
    email:      data.user.email,
    name:       data.user.fullName,
    role:       BACKEND_ROLE_TO_FRONTEND[data.user.role] ?? 'medecin',
    hospitalId: data.user.hospitalId,
  };
}

/** Lit la session depuis le storage de façon synchrone (pas de réseau) */
function readStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

/** Nettoie toutes les données de session (tokens + session utilisateur) */
function clearAllSessionData() {
  tokenStorage.clear();
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialisation synchrone depuis le storage → pas de flicker au démarrage
  const [user, setUser] = useState<UserSession | null>(readStoredSession);
  const [loading, setLoading] = useState(false);
  const initNotifications = useNotificationStore(s => s.initForRole);

  // ── Écoute l'expiration de session signalée par apiClient ───────────────
  // Quand le 401 + refresh échouent, apiClient dispatch 'auth:session-expired'
  // au lieu de faire window.location.href (qui crée une boucle infinie).
  useEffect(() => {
    const handleExpired = () => {
      clearAllSessionData();
      setUser(null);
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  // ── Validation silencieuse en arrière-plan ──────────────────────────────
  // On ne bloque pas l'affichage : la session locale est affichée immédiatement.
  // Si une session est stockée mais qu'il n'y a aucun token (ex : sessionStorage
  // vidé entre deux onglets/sessions), on nettoie immédiatement pour éviter
  // les 401 en boucle sur les appels API protégés.
  useEffect(() => {
    const storedUser = readStoredSession();
    if (!storedUser) return;

    const token = tokenStorage.getAccess();
    if (!token) {
      // Session stockée mais aucun token → incohérence, on nettoie
      clearAllSessionData();
      setUser(null);
      return;
    }

    initNotifications(storedUser.role);

    api.get<{ user: LoginResponse['user'] }>('/auth/me')
      .then(me => {
        setUser(prev => prev ? {
          ...prev,
          name:       me.user.fullName,
          role:       BACKEND_ROLE_TO_FRONTEND[me.user.role] ?? prev.role,
          hospitalId: me.user.hospitalId,
        } : null);
      })
      .catch(() => {
        // Le token est invalide ou le backend est hors ligne.
        // On ne fait rien ici : si c'est un vrai 401, apiClient
        // dispatche 'auth:session-expired' qui sera capturé ci-dessus.
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const data = await api.post<LoginResponse>('/auth/login', { email, password });

    // Sauvegarder les tokens JWT
    tokenStorage.save(data.tokens.accessToken, data.tokens.refreshToken, rememberMe);

    // Construire et sauvegarder la session
    const session = toUserSession(data);
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem(SESSION_KEY, JSON.stringify(session));

    setUser(session);
    initNotifications(session.role);
  }, [initNotifications]);

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Même si l'appel échoue, on nettoie localement
    } finally {
      tokenStorage.clear();
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      setUser(null);
    }
  }, []);

  // ── Réinitialisation mot de passe ────────────────────────────────────────
  const requestPasswordReset = useCallback(async (email: string) => {
    await api.post('/auth/forgot-password', { email });
  }, []);

  // Mémoïser la valeur du contexte pour éviter les re-renders en cascade
  // sur tous les consommateurs quand AuthProvider re-rend
  const contextValue = useMemo(
    () => ({ user, loading, login, logout, requestPasswordReset }),
    [user, loading, login, logout, requestPasswordReset],
  );

  return (
    <AuthContext.Provider value={contextValue}>
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

/** Helper pour accéder à l'erreur de login de manière typée */
export function getLoginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'INVALID_CREDENTIALS':      return 'Email ou mot de passe incorrect';
      case 'USER_INACTIVE':            return 'Compte désactivé — contactez votre administrateur';
      case 'USER_PROFILE_NOT_FOUND':   return 'Profil utilisateur introuvable';
      case 'AUTH_RATE_LIMIT_EXCEEDED': return 'Trop de tentatives — réessayez dans 15 minutes';
      case 'RATE_LIMIT_EXCEEDED':      return 'Trop de requêtes — réessayez dans quelques instants';
      case 'SERVER_UNREACHABLE':       return 'Serveur non disponible — vérifiez que le backend est démarré';
      default:                         return err.message;
    }
  }
  return 'Erreur de connexion — vérifiez votre réseau';
}
