import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Notification {
  id: string;
  type: 'ecg_urgent' | 'ecg_normal' | 'second_opinion' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  ecgId?: string;
  fromUser?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  autoSaveInterval: number; // seconds
  defaultSpeed: 25 | 50;
  defaultAmplitude: 5 | 10 | 20;
  showGrid: boolean;
  language: 'fr' | 'en' | 'es';
  itemsPerPage: number;
  favoriteTemplates: string[];
}

export interface ECGDraft {
  ecgId: string;
  interpretation: string;
  measurements: Record<string, number | null>;
  lastSaved: Date;
}

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  
  // User Preferences
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Auto-save drafts
  drafts: ECGDraft[];
  saveDraft: (draft: Omit<ECGDraft, 'lastSaved'>) => void;
  getDraft: (ecgId: string) => ECGDraft | undefined;
  clearDraft: (ecgId: string) => void;
  
  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  showKeyboardShortcuts: boolean;
  setShowKeyboardShortcuts: (show: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  
  // Session
  lastActivity: Date;
  updateActivity: () => void;
  sessionLocked: boolean;
  lockSession: () => void;
  unlockSession: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  soundEnabled: true,
  autoSaveInterval: 30,
  defaultSpeed: 25,
  defaultAmplitude: 10,
  showGrid: true,
  language: 'fr',
  itemsPerPage: 10,
  favoriteTemplates: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      
      // Notifications
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        }));
        
        // Play sound if enabled
        const { preferences } = get();
        if (preferences.soundEnabled && notification.type === 'ecg_urgent') {
          // Would play sound here
          console.log('🔔 Urgent ECG notification');
        }
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      
      // User Preferences
      preferences: defaultPreferences,
      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        }));
      },
      
      // Auto-save drafts
      drafts: [],
      saveDraft: (draft) => {
        set((state) => {
          const existingIndex = state.drafts.findIndex((d) => d.ecgId === draft.ecgId);
          const newDraft = { ...draft, lastSaved: new Date() };
          
          if (existingIndex >= 0) {
            const newDrafts = [...state.drafts];
            newDrafts[existingIndex] = newDraft;
            return { drafts: newDrafts };
          }
          
          return { drafts: [...state.drafts, newDraft] };
        });
      },
      getDraft: (ecgId) => {
        return get().drafts.find((d) => d.ecgId === ecgId);
      },
      clearDraft: (ecgId) => {
        set((state) => ({
          drafts: state.drafts.filter((d) => d.ecgId !== ecgId),
        }));
      },
      
      // UI State
      sidebarCollapsed: false,
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      showKeyboardShortcuts: false,
      setShowKeyboardShortcuts: (show) => {
        set({ showKeyboardShortcuts: show });
      },
      showOnboarding: false,
      setShowOnboarding: (show) => {
        set({ showOnboarding: show });
      },
      hasCompletedOnboarding: false,
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true, showOnboarding: false });
      },
      
      // Session
      lastActivity: new Date(),
      updateActivity: () => {
        set({ lastActivity: new Date() });
      },
      sessionLocked: false,
      lockSession: () => {
        set({ sessionLocked: true });
      },
      unlockSession: () => {
        set({ sessionLocked: false, lastActivity: new Date() });
      },
    }),
    {
      name: 'xpress-ecg-storage',
      partialize: (state) => ({
        theme: state.theme,
        preferences: state.preferences,
        drafts: state.drafts,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('xpress-ecg-storage');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }
}
