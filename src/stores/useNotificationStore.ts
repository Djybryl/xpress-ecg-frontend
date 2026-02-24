import { create } from 'zustand';
import type { UserRole } from '@/config/roles';

export interface AppNotification {
  id: string;
  type: 'new_ecg' | 'urgent' | 'report_ready' | 'second_opinion' | 'info';
  title: string;
  message: string;
  ecgId?: string;
  read: boolean;
  createdAt: string;
}

// Notifications mockées par rôle
const mockNotificationsByRole: Record<UserRole, AppNotification[]> = {
  cardiologue: [
    {
      id: 'N-001',
      type: 'urgent',
      title: 'ECG urgent reçu',
      message: 'Patient Jeanne Moreau — Syncope avec BAV. Prise en charge immédiate requise.',
      ecgId: 'ECG-2024-0428',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'N-002',
      type: 'new_ecg',
      title: 'Nouvel ECG assigné',
      message: 'Patient Pierre Lambert — Palpitations. Centre Cardio Paris.',
      ecgId: 'ECG-2024-0429',
      read: false,
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: 'N-003',
      type: 'second_opinion',
      title: 'Demande de second avis',
      message: 'Dr. Martin sollicite votre avis sur ECG-2024-0420.',
      ecgId: 'ECG-2024-0420',
      read: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'N-004',
      type: 'info',
      title: 'Rapport validé',
      message: 'ECG-2024-0425 (Michel Bernard) envoyé au médecin référent.',
      ecgId: 'ECG-2024-0425',
      read: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ],
  medecin: [
    {
      id: 'N-101',
      type: 'report_ready',
      title: 'Rapport disponible',
      message: 'ECG de Robert Petit interprété — ⚠️ Fibrillation auriculaire de novo.',
      ecgId: 'ECG-2024-0405',
      read: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'N-102',
      type: 'report_ready',
      title: 'Rapport disponible',
      message: 'ECG de Jean-Paul Mercier interprété — ECG normal.',
      ecgId: 'ECG-2024-0407',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'N-103',
      type: 'info',
      title: 'ECG reçu',
      message: 'Votre demande ECG-2024-0409 (Pierre Dupont) a bien été reçue.',
      ecgId: 'ECG-2024-0409',
      read: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ],
  secretaire: [
    {
      id: 'N-201',
      type: 'new_ecg',
      title: '3 nouveaux ECG reçus',
      message: 'Hôpital Saint-Louis — 2 urgents, 1 normal. À traiter.',
      read: false,
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
    {
      id: 'N-202',
      type: 'report_ready',
      title: 'Rapport prêt à envoyer',
      message: 'ECG-2024-0425 (Michel Bernard) — Rapport validé par Dr. Bernard.',
      ecgId: 'ECG-2024-0425',
      read: false,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ],
  admin: [
    {
      id: 'N-301',
      type: 'info',
      title: 'Nouvel utilisateur inscrit',
      message: 'Dr. Lucas Perrin (Cardiologue) en attente de validation.',
      read: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'N-302',
      type: 'info',
      title: 'Rapport financier disponible',
      message: 'Les émoluments de décembre 2024 sont prêts à être validés.',
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  initForRole: (role: UserRole) => void;
  fetchNotifications: () => void;
  subscribeToNotifications: () => () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  pushNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  initForRole: (role: UserRole) => {
    const notifications = mockNotificationsByRole[role] ?? [];
    set({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  },

  fetchNotifications: () => {
    // initForRole est appelé ailleurs avec le rôle; ici no-op ou refresh
  },
  subscribeToNotifications: () => () => {},

  markAsRead: (id: string) => {
    set(state => {
      const updated = state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  pushNotification: (n) => {
    const newNotif: AppNotification = {
      ...n,
      id: `N-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    set(state => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  deleteNotification: (id: string) => {
    set(state => {
      const updated = state.notifications.filter(n => n.id !== id);
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length,
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
