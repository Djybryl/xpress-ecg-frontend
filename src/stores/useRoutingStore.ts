import { create } from 'zustand';
import { cardiologists } from '@/stores/useECGQueueStore';

export interface RoutingRule {
  id: string;
  dateFrom: string;       // YYYY-MM-DD
  dateTo: string;         // YYYY-MM-DD
  hospitals: string[];    // liste d'hôpitaux ciblés, vide = tous
  cardiologistEmails: string[];  // cardiologues destinataires
  notes?: string;
  active: boolean;
  createdAt: string;
}

// Cardiologues disponibles pour le routage (réutilise la liste du useECGQueueStore)
export { cardiologists };

// Liste des hôpitaux mockés
export const hospitals = [
  { id: 'HSL', name: 'Hôpital Saint-Louis' },
  { id: 'CCP', name: 'Centre Cardio Paris' },
  { id: 'CDS', name: 'Clinique du Sport' },
  { id: 'HLR', name: 'Hôpital Lariboisière' },
  { id: 'ALL', name: 'Tous les établissements' },
];

const mockRules: RoutingRule[] = [
  {
    id: 'ROUTE-001',
    dateFrom: '2024-12-20',
    dateTo: '2024-12-31',
    hospitals: ['HSL', 'HLR'],
    cardiologistEmails: ['cardiologue@demo.fr'],
    notes: 'Période de congés — tous les ECG de HSL vers Dr. Bernard',
    active: true,
    createdAt: '2024-12-15T10:00:00Z',
  },
  {
    id: 'ROUTE-002',
    dateFrom: '2025-01-02',
    dateTo: '2025-01-15',
    hospitals: [],
    cardiologistEmails: ['cardiologue@demo.fr'],
    notes: 'Rentrée — tous les ECG vers Dr. Bernard en priorité',
    active: false,
    createdAt: '2024-12-20T14:00:00Z',
  },
];

interface RoutingStore {
  rules: RoutingRule[];
  addRule: (rule: Omit<RoutingRule, 'id' | 'createdAt'>) => void;
  updateRule: (id: string, data: Partial<RoutingRule>) => void;
  deleteRule: (id: string) => void;
  toggleActive: (id: string) => void;
  getActiveRules: () => RoutingRule[];
}

export const useRoutingStore = create<RoutingStore>((set, get) => ({
  rules: mockRules,

  addRule: (ruleData) => {
    const newRule: RoutingRule = {
      ...ruleData,
      id: `ROUTE-${String(get().rules.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    set(state => ({ rules: [...state.rules, newRule] }));
  },

  updateRule: (id, data) => {
    set(state => ({
      rules: state.rules.map(r => r.id === id ? { ...r, ...data } : r),
    }));
  },

  deleteRule: (id) => {
    set(state => ({ rules: state.rules.filter(r => r.id !== id) }));
  },

  toggleActive: (id) => {
    set(state => ({
      rules: state.rules.map(r => r.id === id ? { ...r, active: !r.active } : r),
    }));
  },

  getActiveRules: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().rules.filter(r =>
      r.active &&
      r.dateFrom <= today &&
      r.dateTo >= today
    );
  },
}));
