import { create } from 'zustand';

export type UserRole = 'cardiologue' | 'medecin' | 'secretaire' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  hospital?: string;
  hospitalId?: string;
  specialty?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  ecgCount?: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  userCount: number;
  ecgCount: number;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalHospitals: number;
  activeHospitals: number;
  totalECG: number;
  ecgThisMonth: number;
  ecgThisWeek: number;
  ecgToday: number;
  avgResponseTime: string;
  normalECGPercent: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

// Mock Users
const mockUsers: SystemUser[] = [
  {
    id: 'USR-001',
    email: 'cardiologue@demo.fr',
    name: 'Dr. Sophie Bernard',
    role: 'cardiologue',
    status: 'active',
    hospital: 'Centre Cardio Paris',
    hospitalId: 'HOP-001',
    specialty: 'Cardiologie générale',
    phone: '01 23 45 67 89',
    createdAt: '2024-01-15T10:00:00',
    lastLogin: '2024-12-25T08:30:00',
    ecgCount: 847
  },
  {
    id: 'USR-002',
    email: 'medecin@demo.fr',
    name: 'Dr. Jean Martin',
    role: 'medecin',
    status: 'active',
    hospital: 'Hôpital Saint-Louis',
    hospitalId: 'HOP-002',
    specialty: 'Médecine générale',
    phone: '01 98 76 54 32',
    createdAt: '2024-02-20T14:00:00',
    lastLogin: '2024-12-25T09:15:00',
    ecgCount: 156
  },
  {
    id: 'USR-003',
    email: 'secretaire@demo.fr',
    name: 'Marie Dubois',
    role: 'secretaire',
    status: 'active',
    hospital: 'Centre Cardio Paris',
    hospitalId: 'HOP-001',
    phone: '01 11 22 33 44',
    createdAt: '2024-03-10T09:00:00',
    lastLogin: '2024-12-25T08:00:00',
    ecgCount: 0
  },
  {
    id: 'USR-004',
    email: 'admin@demo.fr',
    name: 'Pierre Admin',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00',
    lastLogin: '2024-12-25T10:00:00',
  },
  {
    id: 'USR-005',
    email: 'dubois.f@hopital.fr',
    name: 'Dr. François Dubois',
    role: 'cardiologue',
    status: 'active',
    hospital: 'Hôpital Saint-Louis',
    hospitalId: 'HOP-002',
    specialty: 'Électrophysiologie',
    phone: '01 55 66 77 88',
    createdAt: '2024-04-05T11:00:00',
    lastLogin: '2024-12-24T16:30:00',
    ecgCount: 623
  },
  {
    id: 'USR-006',
    email: 'blanc.s@clinique.fr',
    name: 'Dr. Sophie Blanc',
    role: 'medecin',
    status: 'active',
    hospital: 'Clinique du Sport',
    hospitalId: 'HOP-003',
    specialty: 'Médecine du sport',
    phone: '01 44 55 66 77',
    createdAt: '2024-05-15T10:00:00',
    lastLogin: '2024-12-25T07:45:00',
    ecgCount: 89
  },
  {
    id: 'USR-007',
    email: 'leroy.c@cardio.fr',
    name: 'Dr. Claire Leroy',
    role: 'cardiologue',
    status: 'inactive',
    hospital: 'Centre Cardio Paris',
    hospitalId: 'HOP-001',
    specialty: 'Cardiologie interventionnelle',
    phone: '01 88 99 00 11',
    createdAt: '2024-06-01T14:00:00',
    lastLogin: '2024-11-30T12:00:00',
    ecgCount: 412
  },
  {
    id: 'USR-008',
    email: 'petit.f@hopital.fr',
    name: 'Dr. François Petit',
    role: 'medecin',
    status: 'pending',
    hospital: 'Centre Cardio Paris',
    hospitalId: 'HOP-001',
    specialty: 'Cardiologie',
    phone: '01 22 33 44 55',
    createdAt: '2024-12-20T09:00:00',
  },
];

// Mock Hospitals
const mockHospitals: Hospital[] = [
  {
    id: 'HOP-001',
    name: 'Centre Cardio Paris',
    address: '15 Avenue de la Santé',
    city: 'Paris',
    phone: '01 40 50 60 70',
    email: 'contact@cardio-paris.fr',
    status: 'active',
    userCount: 12,
    ecgCount: 3450,
    createdAt: '2023-06-01T00:00:00'
  },
  {
    id: 'HOP-002',
    name: 'Hôpital Saint-Louis',
    address: '1 Avenue Claude Vellefaux',
    city: 'Paris',
    phone: '01 42 49 49 49',
    email: 'contact@saint-louis.fr',
    status: 'active',
    userCount: 8,
    ecgCount: 2180,
    createdAt: '2023-08-15T00:00:00'
  },
  {
    id: 'HOP-003',
    name: 'Clinique du Sport',
    address: '36 Boulevard Saint-Marcel',
    city: 'Paris',
    phone: '01 45 87 27 00',
    email: 'contact@clinique-sport.fr',
    status: 'active',
    userCount: 5,
    ecgCount: 890,
    createdAt: '2024-01-10T00:00:00'
  },
  {
    id: 'HOP-004',
    name: 'Centre Médical Montmartre',
    address: '78 Rue Lepic',
    city: 'Paris',
    phone: '01 46 06 85 85',
    email: 'contact@cm-montmartre.fr',
    status: 'inactive',
    userCount: 2,
    ecgCount: 156,
    createdAt: '2024-03-20T00:00:00'
  },
];

// Mock Activity Logs
const mockLogs: ActivityLog[] = [
  {
    id: 'LOG-001',
    userId: 'USR-001',
    userName: 'Dr. Sophie Bernard',
    action: 'ECG analysé',
    details: 'ECG-2024-0430 - Patient Marie Dupont',
    timestamp: '2024-12-25T15:30:00',
    type: 'success'
  },
  {
    id: 'LOG-002',
    userId: 'USR-002',
    userName: 'Dr. Jean Martin',
    action: 'Nouvelle demande ECG',
    details: 'ECG-2024-0431 envoyé pour interprétation',
    timestamp: '2024-12-25T15:15:00',
    type: 'info'
  },
  {
    id: 'LOG-003',
    userId: 'USR-003',
    userName: 'Marie Dubois',
    action: 'ECG assigné',
    details: 'ECG-2024-0429 assigné à Dr. François Dubois',
    timestamp: '2024-12-25T14:45:00',
    type: 'info'
  },
  {
    id: 'LOG-004',
    userId: 'USR-008',
    userName: 'Dr. François Petit',
    action: 'Inscription en attente',
    details: 'Nouvel utilisateur en attente de validation',
    timestamp: '2024-12-20T09:00:00',
    type: 'warning'
  },
  {
    id: 'LOG-005',
    userId: 'USR-004',
    userName: 'Pierre Admin',
    action: 'Utilisateur désactivé',
    details: 'Dr. Claire Leroy - Congé longue durée',
    timestamp: '2024-11-30T12:00:00',
    type: 'warning'
  },
  {
    id: 'LOG-006',
    userId: 'USR-005',
    userName: 'Dr. François Dubois',
    action: 'Rapport urgent envoyé',
    details: 'ECG-2024-0425 - Anomalie détectée',
    timestamp: '2024-12-24T16:00:00',
    type: 'error'
  },
];

// Mock Stats
const mockStats: SystemStats = {
  totalUsers: 8,
  activeUsers: 6,
  totalHospitals: 4,
  activeHospitals: 3,
  totalECG: 6676,
  ecgThisMonth: 523,
  ecgThisWeek: 127,
  ecgToday: 24,
  avgResponseTime: '1h 45min',
  normalECGPercent: 72
};

interface AdminStore {
  users: SystemUser[];
  hospitals: Hospital[];
  logs: ActivityLog[];
  stats: SystemStats;
  isLoading: boolean;
  
  // User actions
  getUsers: () => SystemUser[];
  getUsersByRole: (role: UserRole) => SystemUser[];
  getUsersByStatus: (status: UserStatus) => SystemUser[];
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  activateUser: (id: string) => void;
  deactivateUser: (id: string) => void;
  
  // Hospital actions
  getHospitals: () => Hospital[];
  addHospital: (hospital: Omit<Hospital, 'id' | 'createdAt' | 'userCount' | 'ecgCount'>) => void;
  updateHospital: (id: string, updates: Partial<Hospital>) => void;
  deleteHospital: (id: string) => void;
  
  // Stats
  getStats: () => SystemStats;
  
  // Logs
  getLogs: () => ActivityLog[];
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  users: mockUsers,
  hospitals: mockHospitals,
  logs: mockLogs,
  stats: mockStats,
  isLoading: false,

  getUsers: () => get().users,
  
  getUsersByRole: (role) => get().users.filter(u => u.role === role),
  
  getUsersByStatus: (status) => get().users.filter(u => u.status === status),

  addUser: (user) => {
    const newUser: SystemUser = {
      ...user,
      id: `USR-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set(state => ({
      users: [...state.users, newUser],
      stats: { ...state.stats, totalUsers: state.stats.totalUsers + 1 }
    }));
  },

  updateUser: (id, updates) => {
    set(state => ({
      users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  },

  deleteUser: (id) => {
    set(state => ({
      users: state.users.filter(u => u.id !== id),
      stats: { ...state.stats, totalUsers: state.stats.totalUsers - 1 }
    }));
  },

  activateUser: (id) => {
    set(state => ({
      users: state.users.map(u => 
        u.id === id ? { ...u, status: 'active' as UserStatus } : u
      ),
      stats: { ...state.stats, activeUsers: state.stats.activeUsers + 1 }
    }));
  },

  deactivateUser: (id) => {
    set(state => ({
      users: state.users.map(u => 
        u.id === id ? { ...u, status: 'inactive' as UserStatus } : u
      ),
      stats: { ...state.stats, activeUsers: state.stats.activeUsers - 1 }
    }));
  },

  getHospitals: () => get().hospitals,

  addHospital: (hospital) => {
    const newHospital: Hospital = {
      ...hospital,
      id: `HOP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userCount: 0,
      ecgCount: 0,
    };
    set(state => ({
      hospitals: [...state.hospitals, newHospital],
      stats: { ...state.stats, totalHospitals: state.stats.totalHospitals + 1 }
    }));
  },

  updateHospital: (id, updates) => {
    set(state => ({
      hospitals: state.hospitals.map(h => h.id === id ? { ...h, ...updates } : h)
    }));
  },

  deleteHospital: (id) => {
    set(state => ({
      hospitals: state.hospitals.filter(h => h.id !== id),
      stats: { ...state.stats, totalHospitals: state.stats.totalHospitals - 1 }
    }));
  },

  getStats: () => get().stats,

  getLogs: () => get().logs,

  addLog: (log) => {
    const newLog: ActivityLog = {
      ...log,
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    set(state => ({
      logs: [newLog, ...state.logs]
    }));
  },
}));

// Role labels
export const roleLabels: Record<UserRole, string> = {
  cardiologue: 'Cardiologue',
  medecin: 'Médecin Référent',
  secretaire: 'Secrétaire',
  admin: 'Administrateur'
};

// Status labels
export const statusLabels: Record<UserStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente'
};

// Role colors
export const roleColors: Record<UserRole, string> = {
  cardiologue: 'bg-indigo-100 text-indigo-700',
  medecin: 'bg-emerald-100 text-emerald-700',
  secretaire: 'bg-amber-100 text-amber-700',
  admin: 'bg-slate-100 text-slate-700'
};

// Status colors
export const statusColors: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-700'
};
