import { create } from 'zustand';

export interface ECGReport {
  id: string;
  ecgId: string;
  patientId: string;
  patientName: string;
  cardiologist: string;
  dateReceived: string;
  dateEcg: string;
  isRead: boolean;
  isUrgent: boolean;
  conclusion: string;
  interpretation: string;
  measurements: {
    heartRate: number;
    prInterval: number;
    qrsDuration: number;
    qtInterval: number;
    pAxis?: number;
    qrsAxis?: number;
    tAxis?: number;
  };
  ecgImageUrl?: string;
  pdfUrl?: string;
}

// Données mockées
const mockReports: ECGReport[] = [
  {
    id: 'RPT-001',
    ecgId: 'ECG-2024-0407',
    patientId: 'PAT-003',
    patientName: 'Jean-Paul Mercier',
    cardiologist: 'Dr. Sophie Bernard',
    dateReceived: '2024-12-24T16:45:00Z',
    dateEcg: '2024-12-24',
    isRead: false,
    isUrgent: false,
    conclusion: 'ECG normal, rythme sinusal régulier',
    interpretation: `Rythme sinusal régulier à 72 bpm.
Axe QRS normal.
Pas de trouble de la repolarisation.
Pas de signe d'hypertrophie ventriculaire.
Intervalles PR, QRS et QT dans les limites normales.

Conclusion : ECG strictement normal. Pas d'anomalie significative.`,
    measurements: {
      heartRate: 72,
      prInterval: 160,
      qrsDuration: 84,
      qtInterval: 380,
      pAxis: 45,
      qrsAxis: 60,
      tAxis: 40
    }
  },
  {
    id: 'RPT-002',
    ecgId: 'ECG-2024-0406',
    patientId: 'PAT-004',
    patientName: 'Élise Moreau',
    cardiologist: 'Dr. François Dubois',
    dateReceived: '2024-12-24T13:30:00Z',
    dateEcg: '2024-12-24',
    isRead: true,
    isUrgent: false,
    conclusion: 'Tachycardie sinusale modérée, à corréler au contexte clinique',
    interpretation: `Rythme sinusal régulier à 105 bpm (tachycardie sinusale).
Axe QRS normal à 50°.
Ondes P normales, bien visibles en DII.
Pas de trouble de la conduction.
Repolarisation normale.

Conclusion : Tachycardie sinusale modérée. À corréler au contexte clinique (anxiété, fièvre, anémie ?). Contrôle à distance recommandé.`,
    measurements: {
      heartRate: 105,
      prInterval: 140,
      qrsDuration: 80,
      qtInterval: 340,
      qrsAxis: 50
    }
  },
  {
    id: 'RPT-003',
    ecgId: 'ECG-2024-0405',
    patientId: 'PAT-005',
    patientName: 'Robert Petit',
    cardiologist: 'Dr. Sophie Bernard',
    dateReceived: '2024-12-23T18:00:00Z',
    dateEcg: '2024-12-23',
    isRead: false,
    isUrgent: true,
    conclusion: '⚠️ URGENT - Fibrillation auriculaire de novo',
    interpretation: `ATTENTION - INTERPRÉTATION URGENTE

Fibrillation auriculaire à réponse ventriculaire rapide (120-150 bpm).
Absence d'ondes P, ligne de base irrégulière.
QRS fins, pas de trouble de la conduction intraventriculaire.
Pas de sus-décalage ST aigu.

CONCLUSION URGENTE :
Fibrillation auriculaire de novo. Patient à revoir en urgence pour :
- Évaluation du risque thromboembolique (CHA2DS2-VASc)
- Introduction anticoagulation si indiquée
- Contrôle de la fréquence cardiaque
- Recherche étiologique (TSH, échocardiographie)

Merci de contacter le patient rapidement.`,
    measurements: {
      heartRate: 135,
      prInterval: 0,
      qrsDuration: 88,
      qtInterval: 320
    }
  },
  {
    id: 'RPT-004',
    ecgId: 'ECG-2024-0401',
    patientId: 'PAT-001',
    patientName: 'Pierre Dupont',
    cardiologist: 'Dr. Sophie Bernard',
    dateReceived: '2024-12-20T14:00:00Z',
    dateEcg: '2024-12-20',
    isRead: true,
    isUrgent: false,
    conclusion: 'Bloc de branche droit complet, stable par rapport au précédent',
    interpretation: `Rythme sinusal régulier à 68 bpm.
Bloc de branche droit complet (QRS à 140ms).
Aspect RSR' en V1-V2, onde S large en V5-V6 et DI.
Pas de modification par rapport à l'ECG précédent du 15/11/2024.
Repolarisation secondaire au BBD.

Conclusion : BBD complet connu et stable. Pas de modification significative.`,
    measurements: {
      heartRate: 68,
      prInterval: 180,
      qrsDuration: 140,
      qtInterval: 420,
      qrsAxis: 110
    }
  },
];

interface ReportStore {
  reports: ECGReport[];
  isLoading: boolean;
  unreadCount: number;
  urgentUnreadCount: number;
  getReports: () => ECGReport[];
  getReport: (id: string) => ECGReport | undefined;
  getReportsByPatient: (patientId: string) => ECGReport[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshCounts: () => void;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: mockReports,
  isLoading: false,
  unreadCount: mockReports.filter(r => !r.isRead).length,
  urgentUnreadCount: mockReports.filter(r => !r.isRead && r.isUrgent).length,

  getReports: () => get().reports,

  getReport: (id: string) => {
    return get().reports.find(r => r.id === id);
  },

  getReportsByPatient: (patientId: string) => {
    return get().reports.filter(r => r.patientId === patientId);
  },

  markAsRead: (id: string) => {
    set(state => {
      const updatedReports = state.reports.map(r =>
        r.id === id ? { ...r, isRead: true } : r
      );
      return {
        reports: updatedReports,
        unreadCount: updatedReports.filter(r => !r.isRead).length,
        urgentUnreadCount: updatedReports.filter(r => !r.isRead && r.isUrgent).length,
      };
    });
  },

  markAllAsRead: () => {
    set(state => ({
      reports: state.reports.map(r => ({ ...r, isRead: true })),
      unreadCount: 0,
      urgentUnreadCount: 0,
    }));
  },

  refreshCounts: () => {
    const { reports } = get();
    set({
      unreadCount: reports.filter(r => !r.isRead).length,
      urgentUnreadCount: reports.filter(r => !r.isRead && r.isUrgent).length,
    });
  },
}));
