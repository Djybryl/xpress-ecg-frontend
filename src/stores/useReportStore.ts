import { create } from 'zustand';

export type ReportStatus = 'draft' | 'validated' | 'sent';

export interface ECGReport {
  id: string;
  ecgId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  // Auteur du rapport
  cardiologist: string;
  cardiologistEmail: string;
  // Demandeur
  referringDoctor: string;
  referringDoctorEmail: string;
  hospital: string;
  // Dates
  dateReceived: string;
  dateEcg: string;
  dateCompleted: string;
  dateSent?: string;
  // Contenu
  isRead: boolean;
  isUrgent: boolean;
  conclusion: string;
  interpretation: string;
  findings: string[];
  recommendations?: string;
  isNormal: boolean;
  measurements: {
    heartRate?: number;
    prInterval?: number;
    qrsDuration?: number;
    qtInterval?: number;
    qtcInterval?: number;
    rhythm?: string;
    axis?: string;
    pAxis?: number;
    qrsAxis?: number;
    tAxis?: number;
  };
  ecgImageUrl?: string;
  pdfUrl?: string;
  clinicalContext?: string;
  // Versioning
  version: number;
  /** Si un rapport plus récent existe, ce rapport est verrouillé (non téléchargeable par le demandeur) */
  supersededBy?: string;
  status: ReportStatus;
}

const mockReports: ECGReport[] = [
  {
    id: 'RPT-001',
    ecgId: 'ECG-2024-0425',
    patientId: 'PAT-025',
    patientName: 'Michel Bernard',
    patientAge: 58,
    patientGender: 'M',
    cardiologist: 'Dr. Sophie Bernard',
    cardiologistEmail: 'cardiologue@demo.fr',
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorEmail: 'medecin@demo.fr',
    hospital: 'Hôpital Saint-Louis',
    dateReceived: '2024-12-24T16:00:00Z',
    dateEcg: '2024-12-24',
    dateCompleted: '2024-12-24T17:30:00Z',
    dateSent: '2024-12-24T17:45:00Z',
    isRead: false,
    isUrgent: false,
    conclusion: 'ECG normal, rythme sinusal régulier',
    interpretation: 'Rythme sinusal régulier à 72 bpm. Axe QRS normal. Pas de trouble de la repolarisation. Intervalles PR, QRS et QT dans les limites normales.\n\nConclusion : ECG strictement normal.',
    findings: ['Rythme sinusal régulier', 'Fréquence cardiaque normale (72 bpm)', 'Axe électrique normal', 'Pas de trouble de conduction', 'Repolarisation normale'],
    isNormal: true,
    measurements: { heartRate: 72, prInterval: 160, qrsDuration: 84, qtInterval: 380, qtcInterval: 415, rhythm: 'Sinusal', axis: 'Normal (+60°)', pAxis: 45, qrsAxis: 60, tAxis: 40 },
    clinicalContext: 'Douleur thoracique atypique',
    version: 1,
    status: 'sent',
  },
  {
    id: 'RPT-002',
    ecgId: 'ECG-2024-0424',
    patientId: 'PAT-024',
    patientName: 'Sylvie Leroy',
    patientAge: 78,
    patientGender: 'F',
    cardiologist: 'Dr. Sophie Bernard',
    cardiologistEmail: 'cardiologue@demo.fr',
    referringDoctor: 'Dr. François Petit',
    referringDoctorEmail: 'petit@cardio.fr',
    hospital: 'Centre Cardio Paris',
    dateReceived: '2024-12-24T14:00:00Z',
    dateEcg: '2024-12-24',
    dateCompleted: '2024-12-24T15:45:00Z',
    dateSent: '2024-12-24T16:00:00Z',
    isRead: false,
    isUrgent: true,
    conclusion: '⚠️ BBG complet avec QTc allongé — cardiopathie sous-jacente suspectée',
    interpretation: 'Rythme sinusal. Bloc de branche gauche complet. Axe dévié à gauche. PR à la limite supérieure (200ms). QTc allongé (508ms). Signes de surcharge VG.',
    findings: ['Rythme sinusal', 'Bloc de branche gauche complet', 'Axe dévié à gauche', 'QTc allongé (508ms)', 'Signes de surcharge VG'],
    recommendations: 'Échocardiographie recommandée. Surveillance du QTc. Revue des médicaments allongeant le QT.',
    isNormal: false,
    measurements: { heartRate: 88, prInterval: 200, qrsDuration: 140, qtInterval: 420, qtcInterval: 508, rhythm: 'Sinusal', axis: 'Déviation gauche (-45°)' },
    clinicalContext: "Dyspnée d'effort croissante, œdèmes des membres inférieurs",
    version: 1,
    status: 'sent',
  },
  {
    id: 'RPT-003',
    ecgId: 'ECG-2024-0423',
    patientId: 'PAT-023',
    patientName: 'Jacques Mercier',
    patientAge: 52,
    patientGender: 'M',
    cardiologist: 'Dr. Sophie Bernard',
    cardiologistEmail: 'cardiologue@demo.fr',
    referringDoctor: 'Dr. Sophie Blanc',
    referringDoctorEmail: 'blanc@clinique.fr',
    hospital: 'Clinique du Sport',
    dateReceived: '2024-12-24T10:00:00Z',
    dateEcg: '2024-12-24',
    dateCompleted: '2024-12-24T11:25:00Z',
    dateSent: '2024-12-24T11:30:00Z',
    isRead: true,
    isUrgent: false,
    conclusion: 'ECG normal — apte au sport',
    interpretation: 'Rythme sinusal régulier. Bradycardie sinusale physiologique (58 bpm). Pas d\'anomalie significative.',
    findings: ['Rythme sinusal régulier', 'Bradycardie sinusale physiologique (58 bpm)', 'Repolarisation normale'],
    isNormal: true,
    measurements: { heartRate: 58, prInterval: 180, qrsDuration: 90, qtInterval: 400, qtcInterval: 395, rhythm: 'Sinusal', axis: 'Normal (+30°)' },
    clinicalContext: 'Certificat de non contre-indication au sport',
    version: 1,
    status: 'sent',
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

  /**
   * Rapports visibles par le demandeur :
   * - seul le rapport le plus récent de chaque ECG est téléchargeable
   * - les anciennes versions sont masquées (supersededBy != undefined)
   */
  getReportsForRequester: (requesterEmail: string) => ECGReport[];

  /** Rapports visibles par le cardiologue auteur */
  getReportsForCardiologist: (cardioEmail: string) => ECGReport[];

  /** Tous les rapports (secrétaire) */
  getAllReports: () => ECGReport[];

  /** Créer un nouveau rapport (version 1) */
  createReport: (report: Omit<ECGReport, 'id' | 'version' | 'status'>) => ECGReport;

  /** Créer un rapport révisé : verrouille l'ancien chez le demandeur */
  createRevision: (originalReportId: string, updatedFields: Partial<ECGReport>) => ECGReport;

  /** Valider et envoyer un rapport */
  sendReport: (id: string) => void;

  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshCounts: () => void;
}

let nextReportId = mockReports.length + 1;

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: mockReports,
  isLoading: false,
  unreadCount: mockReports.filter(r => !r.isRead).length,
  urgentUnreadCount: mockReports.filter(r => !r.isRead && r.isUrgent).length,

  getReports: () => get().reports,

  getReport: (id) => get().reports.find(r => r.id === id),

  getReportsByPatient: (patientId) => get().reports.filter(r => r.patientId === patientId),

  getReportsForRequester: (requesterEmail) => {
    return get().reports.filter(r =>
      r.referringDoctorEmail === requesterEmail &&
      r.status === 'sent' &&
      !r.supersededBy
    );
  },

  getReportsForCardiologist: (cardioEmail) => {
    return get().reports.filter(r => r.cardiologistEmail === cardioEmail);
  },

  getAllReports: () => get().reports,

  createReport: (data) => {
    const id = `RPT-${String(nextReportId++).padStart(3, '0')}`;
    const newReport: ECGReport = { ...data, id, version: 1, status: 'draft' };
    set(state => ({ reports: [...state.reports, newReport] }));
    return newReport;
  },

  createRevision: (originalReportId, updatedFields) => {
    const original = get().reports.find(r => r.id === originalReportId);
    if (!original) throw new Error('Rapport original introuvable');

    const id = `RPT-${String(nextReportId++).padStart(3, '0')}`;
    const revision: ECGReport = {
      ...original,
      ...updatedFields,
      id,
      version: original.version + 1,
      supersededBy: undefined,
      status: 'draft',
      dateCompleted: new Date().toISOString(),
      dateSent: undefined,
      isRead: false,
    };

    set(state => ({
      reports: state.reports.map(r =>
        r.id === originalReportId ? { ...r, supersededBy: id } : r
      ).concat(revision),
    }));

    return revision;
  },

  sendReport: (id) => {
    set(state => ({
      reports: state.reports.map(r =>
        r.id === id ? { ...r, status: 'sent' as ReportStatus, dateSent: new Date().toISOString() } : r
      ),
    }));
    get().refreshCounts();
  },

  markAsRead: (id) => {
    set(state => {
      const updated = state.reports.map(r => r.id === id ? { ...r, isRead: true } : r);
      return {
        reports: updated,
        unreadCount: updated.filter(r => !r.isRead).length,
        urgentUnreadCount: updated.filter(r => !r.isRead && r.isUrgent).length,
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
      unreadCount: reports.filter(r => !r.isRead && r.status === 'sent').length,
      urgentUnreadCount: reports.filter(r => !r.isRead && r.isUrgent && r.status === 'sent').length,
    });
  },
}));
