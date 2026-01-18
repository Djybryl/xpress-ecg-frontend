import {
  Home,
  Inbox,
  FileText,
  BarChart2,
  Upload,
  List,
  Users,
  ClipboardList,
  Send,
  UserCog,
  Building2,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  type LucideIcon
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeVariant?: 'default' | 'warning' | 'danger' | 'success';
  children?: NavItem[];
}

export interface NavigationConfig {
  main: NavItem[];
  secondary?: NavItem[];
}

// Configuration de navigation pour le Cardiologue
export const cardiologueNavigation: NavigationConfig = {
  main: [
    { 
      label: 'Tableau de bord', 
      path: '/cardiologue', 
      icon: Home 
    },
    { 
      label: 'ECG en attente', 
      path: '/cardiologue/pending', 
      icon: Inbox,
      badge: 12,
      badgeVariant: 'warning'
    },
    { 
      label: 'ECG urgents', 
      path: '/cardiologue/urgent', 
      icon: AlertCircle,
      badge: 3,
      badgeVariant: 'danger'
    },
    { 
      label: 'En cours d\'analyse', 
      path: '/cardiologue/analyzing', 
      icon: Clock 
    },
    { 
      label: 'Terminés', 
      path: '/cardiologue/completed', 
      icon: CheckCircle 
    },
  ],
  secondary: [
    { 
      label: 'Rapports', 
      path: '/cardiologue/reports', 
      icon: FileText 
    },
    { 
      label: 'Statistiques', 
      path: '/cardiologue/statistics', 
      icon: BarChart2 
    },
  ]
};

// Configuration de navigation pour le Médecin Référent
export const medecinNavigation: NavigationConfig = {
  main: [
    { 
      label: 'Tableau de bord', 
      path: '/medecin', 
      icon: Home 
    },
    { 
      label: 'Nouvel ECG', 
      path: '/medecin/new-ecg', 
      icon: Upload 
    },
    { 
      label: 'Mes demandes', 
      path: '/medecin/requests', 
      icon: List
    },
    { 
      label: 'Rapports reçus', 
      path: '/medecin/reports', 
      icon: FileText,
      badge: 2,
      badgeVariant: 'warning'
    },
  ],
  secondary: [
    { 
      label: 'Mes patients', 
      path: '/medecin/patients', 
      icon: Users 
    },
    { 
      label: 'Historique', 
      path: '/medecin/history', 
      icon: Clock 
    },
  ]
};

// Configuration de navigation pour la Secrétaire
export const secretaireNavigation: NavigationConfig = {
  main: [
    { 
      label: 'Tableau de bord', 
      path: '/secretaire', 
      icon: Home 
    },
    { 
      label: 'Réception ECG', 
      path: '/secretaire/inbox', 
      icon: Inbox,
      badge: 8,
      badgeVariant: 'warning'
    },
    { 
      label: 'À assigner', 
      path: '/secretaire/assign', 
      icon: ClipboardList,
      badge: 4,
      badgeVariant: 'default'
    },
    { 
      label: 'Envoi rapports', 
      path: '/secretaire/send-reports', 
      icon: Send,
      badge: 6,
      badgeVariant: 'success'
    },
  ],
  secondary: [
    { 
      label: 'Patients', 
      path: '/secretaire/patients', 
      icon: Users 
    },
    { 
      label: 'Archives', 
      path: '/secretaire/archives', 
      icon: FileText 
    },
  ]
};

// Configuration de navigation pour l'Admin
export const adminNavigation: NavigationConfig = {
  main: [
    { 
      label: 'Tableau de bord', 
      path: '/admin', 
      icon: Home 
    },
    { 
      label: 'Utilisateurs', 
      path: '/admin/users', 
      icon: UserCog 
    },
    { 
      label: 'Établissements', 
      path: '/admin/hospitals', 
      icon: Building2 
    },
    { 
      label: 'Statistiques', 
      path: '/admin/statistics', 
      icon: BarChart2 
    },
  ],
  secondary: [
    { 
      label: 'Paramètres système', 
      path: '/admin/settings', 
      icon: Settings 
    },
    { 
      label: 'Logs d\'activité', 
      path: '/admin/logs', 
      icon: Activity 
    },
  ]
};

// Fonction pour obtenir la navigation selon le rôle
export function getNavigationForRole(role: string): NavigationConfig {
  switch (role) {
    case 'cardiologue':
      return cardiologueNavigation;
    case 'medecin':
      return medecinNavigation;
    case 'secretaire':
      return secretaireNavigation;
    case 'admin':
      return adminNavigation;
    default:
      return medecinNavigation;
  }
}

// Fonction pour obtenir le chemin de base selon le rôle
export function getBasePathForRole(role: string): string {
  switch (role) {
    case 'cardiologue':
      return '/cardiologue';
    case 'medecin':
      return '/medecin';
    case 'secretaire':
      return '/secretaire';
    case 'admin':
      return '/admin';
    default:
      return '/medecin';
  }
}

// Titres des rôles pour l'affichage
export const roleLabels: Record<string, string> = {
  cardiologue: 'Cardiologue',
  medecin: 'Médecin Référent',
  secretaire: 'Secrétaire Médicale',
  admin: 'Administrateur'
};

// Couleurs des rôles pour les badges
export const roleColors: Record<string, string> = {
  cardiologue: 'bg-indigo-100 text-indigo-700',
  medecin: 'bg-emerald-100 text-emerald-700',
  secretaire: 'bg-amber-100 text-amber-700',
  admin: 'bg-slate-100 text-slate-700'
};
