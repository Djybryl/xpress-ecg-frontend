/**
 * Client HTTP centralisé pour le backend Xpress-ECG REST API.
 *
 * Fonctionnalités :
 * - Base URL depuis VITE_API_URL
 * - Injection automatique du JWT access token sur chaque requête
 * - Refresh automatique du token sur réponse 401
 * - Typage fort des réponses (ApiResponse<T>)
 * - Gestion centralisée des erreurs
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const TOKEN_KEY = 'xecg-access-token';
const REFRESH_KEY = 'xecg-refresh-token';

// ─── Gestion des tokens ───────────────────────────────────────────────────────

export const tokenStorage = {
  getAccess: (): string | null =>
    sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY),

  getRefresh: (): string | null =>
    sessionStorage.getItem(REFRESH_KEY) ?? localStorage.getItem(REFRESH_KEY),

  save: (accessToken: string, refreshToken: string, persistent: boolean) => {
    const store = persistent ? localStorage : sessionStorage;
    const other = persistent ? sessionStorage : localStorage;
    store.setItem(TOKEN_KEY, accessToken);
    store.setItem(REFRESH_KEY, refreshToken);
    other.removeItem(TOKEN_KEY);
    other.removeItem(REFRESH_KEY);
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Refresh (appelé une seule fois si token expiré) ─────────────────────────

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) throw new ApiError(401, 'NO_REFRESH_TOKEN', 'Session expirée');

    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const json: ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }> = await res.json();

    if (!res.ok || !json.success || !json.data?.tokens?.accessToken) {
      tokenStorage.clear();
      throw new ApiError(401, 'REFRESH_FAILED', 'Session expirée — veuillez vous reconnecter');
    }

    const persistent = !!localStorage.getItem(TOKEN_KEY);
    tokenStorage.save(json.data.tokens.accessToken, json.data.tokens.refreshToken, persistent);
    return json.data.tokens.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ─── Requête principale ───────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
    isRetry?: boolean;
    formData?: FormData;
  } = {},
): Promise<T> {
  const { body, params, isRetry = false, formData } = options;

  // Construction de l'URL avec query params
  const url = new URL(`${BASE_URL}/api/v1${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  // Headers
  const headers: Record<string, string> = {};
  const token = tokenStorage.getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // Toujours mettre Content-Type pour POST/PUT/PATCH (même sans body)
  // car le middleware backend le valide sur ces méthodes
  if (!formData && ['POST', 'PUT', 'PATCH'].includes(method)) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: formData ?? (body ? JSON.stringify(body) : undefined),
      // Désactiver le cache navigateur pour les appels API
      // (évite les 304 "Not Modified" sur les listes dynamiques)
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'SERVER_UNREACHABLE', 'Serveur non disponible — vérifiez que le backend est démarré');
  }

  // Refresh automatique sur 401 (une seule tentative)
  if (res.status === 401 && !isRetry) {
    try {
      await refreshAccessToken();
      return request<T>(method, path, { ...options, isRetry: true });
    } catch {
      tokenStorage.clear();
      // Notifier l'AuthProvider pour qu'il nettoie la session et redirige proprement
      // (pas de window.location.href qui créerait une boucle infinie)
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw new ApiError(401, 'SESSION_EXPIRED', 'Session expirée — veuillez vous reconnecter');
    }
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, 'PARSE_ERROR', `Réponse invalide du serveur (${res.status})`);
  }

  if (!res.ok || !json.success) {
    throw new ApiError(
      res.status,
      json.error?.code ?? 'UNKNOWN_ERROR',
      json.error?.message ?? `Erreur ${res.status}`,
    );
  }

  return json.data as T;
}

// ─── API publique ─────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>('GET', path, { params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, { body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, { body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>('PUT', path, { body }),

  delete: <T>(path: string) =>
    request<T>('DELETE', path),

  upload: <T>(path: string, formData: FormData) =>
    request<T>('POST', path, { formData }),
};
