import { create } from 'zustand';

export type ECGStatus = 'pending' | 'in_progress' | 'completed';
export type ECGUrgency = 'normal' | 'urgent';

export interface ECGMeasurements {
  heartRate?: number;
  prInterval?: number;
  qrsDuration?: number;
  qtInterval?: number;
  qtcInterval?: number;
  axis?: string;
  rhythm?: string;
}

export interface ECGInterpretation {
  findings: string[];
  conclusion: string;
  recommendations?: string;
  isNormal: boolean;
}

export interface CardiologueECG {
  id: string;
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  referringDoctor: string;
  referringDoctorEmail: string;
  hospital: string;
  dateReceived: string;
  dateAssigned: string;
  dateStarted?: string;
  dateCompleted?: string;
  status: ECGStatus;
  urgency: ECGUrgency;
  clinicalContext: string;
  ecgDate: string;
  measurements?: ECGMeasurements;
  interpretation?: ECGInterpretation;
  notes?: string;
}

// Données mockées pour le cardiologue
const mockCardiologueECGs: CardiologueECG[] = [
  // ECG en attente
  {
    id: 'ECG-2024-0430',
    patientName: 'Marie Dupont',
    patientId: 'PAT-030',
    patientAge: 68,
    patientGender: 'F',
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorEmail: 'martin@hopital.fr',
    hospital: 'Hôpital Saint-Louis',
    dateReceived: '2024-12-25T14:00:00',
    dateAssigned: '2024-12-25T14:15:00',
    status: 'pending',
    urgency: 'urgent',
    clinicalContext: 'Douleur thoracique aiguë irradiant vers le bras gauche, dyspnée',
    ecgDate: '2024-12-25',
  },
  {
    id: 'ECG-2024-0429',
    patientName: 'Pierre Lambert',
    patientId: 'PAT-029',
    patientAge: 55,
    patientGender: 'M',
    referringDoctor: 'Dr. Sophie Blanc',
    referringDoctorEmail: 'blanc@clinique.fr',
    hospital: 'Clinique du Sport',
    dateReceived: '2024-12-25T12:30:00',
    dateAssigned: '2024-12-25T12:45:00',
    status: 'pending',
    urgency: 'normal',
    clinicalContext: 'Palpitations occasionnelles, sans facteur déclenchant identifié',
    ecgDate: '2024-12-25',
  },
  {
    id: 'ECG-2024-0428',
    patientName: 'Jeanne Moreau',
    patientId: 'PAT-028',
    patientAge: 72,
    patientGender: 'F',
    referringDoctor: 'Dr. François Petit',
    referringDoctorEmail: 'petit@cardio.fr',
    hospital: 'Centre Cardio Paris',
    dateReceived: '2024-12-25T11:00:00',
    dateAssigned: '2024-12-25T11:10:00',
    status: 'pending',
    urgency: 'urgent',
    clinicalContext: 'Syncope avec perte de connaissance brève, antécédent de BAV',
    ecgDate: '2024-12-25',
  },
  {
    id: 'ECG-2024-0427',
    patientName: 'Robert Durand',
    patientId: 'PAT-027',
    patientAge: 45,
    patientGender: 'M',
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorEmail: 'martin@hopital.fr',
    hospital: 'Hôpital Saint-Louis',
    dateReceived: '2024-12-25T10:00:00',
    dateAssigned: '2024-12-25T10:15:00',
    status: 'pending',
    urgency: 'normal',
    clinicalContext: 'Bilan pré-opératoire chirurgie orthopédique',
    ecgDate: '2024-12-25',
  },
  // ECG en cours d'analyse
  {
    id: 'ECG-2024-0426',
    patientName: 'Claire Fontaine',
    patientId: 'PAT-026',
    patientAge: 62,
    patientGender: 'F',
    referringDoctor: 'Dr. Sophie Blanc',
    referringDoctorEmail: 'blanc@clinique.fr',
    hospital: 'Clinique du Sport',
    dateReceived: '2024-12-25T09:00:00',
    dateAssigned: '2024-12-25T09:10:00',
    dateStarted: '2024-12-25T14:30:00',
    status: 'in_progress',
    urgency: 'normal',
    clinicalContext: 'Suivi HTA, contrôle sous traitement',
    ecgDate: '2024-12-25',
    measurements: {
      heartRate: 68,
      prInterval: 165,
      qrsDuration: 88,
    }
  },
  // ECG terminés
  {
    id: 'ECG-2024-0425',
    patientName: 'Michel Bernard',
    patientId: 'PAT-025',
    patientAge: 58,
    patientGender: 'M',
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorEmail: 'martin@hopital.fr',
    hospital: 'Hôpital Saint-Louis',
    dateReceived: '2024-12-24T16:00:00',
    dateAssigned: '2024-12-24T16:10:00',
    dateStarted: '2024-12-24T17:00:00',
    dateCompleted: '2024-12-24T17:30:00',
    status: 'completed',
    urgency: 'normal',
    clinicalContext: 'Douleur thoracique atypique',
    ecgDate: '2024-12-24',
    measurements: {
      heartRate: 72,
      prInterval: 160,
      qrsDuration: 84,
      qtInterval: 380,
      qtcInterval: 415,
      axis: 'Normal (+60°)',
      rhythm: 'Sinusal'
    },
    interpretation: {
      findings: [
        'Rythme sinusal régulier',
        'Fréquence cardiaque normale (72 bpm)',
        'Axe électrique normal',
        'Pas de trouble de conduction',
        'Repolarisation normale'
      ],
      conclusion: 'ECG strictement normal. Pas de signe électrique en faveur d\'une ischémie myocardique.',
      recommendations: 'Pas de surveillance ECG particulière nécessaire.',
      isNormal: true
    }
  },
  {
    id: 'ECG-2024-0424',
    patientName: 'Sylvie Leroy',
    patientId: 'PAT-024',
    patientAge: 78,
    patientGender: 'F',
    referringDoctor: 'Dr. François Petit',
    referringDoctorEmail: 'petit@cardio.fr',
    hospital: 'Centre Cardio Paris',
    dateReceived: '2024-12-24T14:00:00',
    dateAssigned: '2024-12-24T14:15:00',
    dateStarted: '2024-12-24T15:00:00',
    dateCompleted: '2024-12-24T15:45:00',
    status: 'completed',
    urgency: 'urgent',
    clinicalContext: 'Dyspnée d\'effort croissante, œdèmes des membres inférieurs',
    ecgDate: '2024-12-24',
    measurements: {
      heartRate: 88,
      prInterval: 200,
      qrsDuration: 140,
      qtInterval: 420,
      qtcInterval: 508,
      axis: 'Déviation gauche (-45°)',
      rhythm: 'Sinusal'
    },
    interpretation: {
      findings: [
        'Rythme sinusal',
        'Bloc de branche gauche complet',
        'Axe électrique dévié à gauche',
        'PR à la limite supérieure (200ms)',
        'QTc allongé (508ms)',
        'Signes de surcharge ventriculaire gauche'
      ],
      conclusion: 'ECG anormal : Bloc de branche gauche complet avec QTc allongé. Signes évoquant une cardiopathie sous-jacente.',
      recommendations: 'Échocardiographie recommandée. Surveillance du QTc. Revue des médicaments allongeant le QT.',
      isNormal: false
    }
  },
  {
    id: 'ECG-2024-0423',
    patientName: 'Jacques Mercier',
    patientId: 'PAT-023',
    patientAge: 52,
    patientGender: 'M',
    referringDoctor: 'Dr. Sophie Blanc',
    referringDoctorEmail: 'blanc@clinique.fr',
    hospital: 'Clinique du Sport',
    dateReceived: '2024-12-24T10:00:00',
    dateAssigned: '2024-12-24T10:15:00',
    dateStarted: '2024-12-24T11:00:00',
    dateCompleted: '2024-12-24T11:25:00',
    status: 'completed',
    urgency: 'normal',
    clinicalContext: 'Certificat de non contre-indication au sport',
    ecgDate: '2024-12-24',
    measurements: {
      heartRate: 58,
      prInterval: 180,
      qrsDuration: 90,
      qtInterval: 400,
      qtcInterval: 395,
      axis: 'Normal (+30°)',
      rhythm: 'Sinusal'
    },
    interpretation: {
      findings: [
        'Rythme sinusal régulier',
        'Bradycardie sinusale physiologique (58 bpm)',
        'Tous les intervalles dans les normes',
        'Pas d\'anomalie de repolarisation'
      ],
      conclusion: 'ECG normal compatible avec la pratique sportive. Bradycardie sinusale physiologique.',
      recommendations: 'Aptitude au sport confirmée.',
      isNormal: true
    }
  },
];

// Templates de conclusions prédéfinies
export const conclusionTemplates = [
  {
    id: 'normal',
    label: 'ECG Normal',
    text: 'ECG strictement normal. Pas d\'anomalie du rythme ni de la conduction. Repolarisation normale.',
    isNormal: true
  },
  {
    id: 'normal-sinus-brady',
    label: 'Bradycardie sinusale',
    text: 'Bradycardie sinusale sans autre anomalie. ECG par ailleurs normal.',
    isNormal: true
  },
  {
    id: 'normal-sinus-tachy',
    label: 'Tachycardie sinusale',
    text: 'Tachycardie sinusale. À corréler au contexte clinique (fièvre, stress, anémie...). ECG par ailleurs normal.',
    isNormal: true
  },
  {
    id: 'fa',
    label: 'Fibrillation auriculaire',
    text: 'Fibrillation auriculaire à réponse ventriculaire [rapide/contrôlée]. Absence d\'onde P, intervalles RR irréguliers.',
    isNormal: false
  },
  {
    id: 'bbg',
    label: 'Bloc de branche gauche',
    text: 'Bloc de branche gauche complet. QRS > 120ms avec aspect typique. Nécessite exploration cardiologique.',
    isNormal: false
  },
  {
    id: 'bbd',
    label: 'Bloc de branche droit',
    text: 'Bloc de branche droit complet. QRS > 120ms avec aspect rsR\' en V1. Bénin si isolé.',
    isNormal: false
  },
  {
    id: 'ischemia',
    label: 'Signes d\'ischémie',
    text: 'Modifications de la repolarisation évocatrices d\'ischémie myocardique. Corrélation clinico-biologique nécessaire.',
    isNormal: false
  },
  {
    id: 'lvh',
    label: 'HVG',
    text: 'Critères électriques d\'hypertrophie ventriculaire gauche (indice de Sokolow positif). À corréler avec échocardiographie.',
    isNormal: false
  }
];

// Templates de findings prédéfinis
export const findingsTemplates = [
  'Rythme sinusal régulier',
  'Rythme sinusal irrégulier (arythmie sinusale respiratoire)',
  'Fibrillation auriculaire',
  'Flutter auriculaire',
  'Tachycardie sinusale',
  'Bradycardie sinusale',
  'Extrasystoles auriculaires isolées',
  'Extrasystoles ventriculaires isolées',
  'Bloc auriculo-ventriculaire du 1er degré',
  'Bloc auriculo-ventriculaire du 2ème degré',
  'Bloc de branche gauche complet',
  'Bloc de branche droit complet',
  'Hémibloc antérieur gauche',
  'Axe électrique normal',
  'Axe électrique dévié à gauche',
  'Axe électrique dévié à droite',
  'Ondes Q pathologiques',
  'Sus-décalage du segment ST',
  'Sous-décalage du segment ST',
  'Ondes T négatives',
  'Ondes T aplaties',
  'QT allongé',
  'Critères d\'HVG (Sokolow positif)',
  'Repolarisation normale',
  'Pas de trouble de conduction',
];

interface CardiologueStore {
  ecgs: CardiologueECG[];
  currentECG: CardiologueECG | null;
  isLoading: boolean;
  
  // Getters
  getByStatus: (status: ECGStatus) => CardiologueECG[];
  getPending: () => CardiologueECG[];
  getUrgent: () => CardiologueECG[];
  getInProgress: () => CardiologueECG[];
  getCompleted: () => CardiologueECG[];
  getCounts: () => { pending: number; urgent: number; inProgress: number; completed: number; today: number };
  getById: (id: string) => CardiologueECG | undefined;
  
  // Actions
  setCurrentECG: (ecg: CardiologueECG | null) => void;
  startAnalysis: (id: string) => void;
  saveMeasurements: (id: string, measurements: ECGMeasurements) => void;
  saveInterpretation: (id: string, interpretation: ECGInterpretation) => void;
  completeAnalysis: (id: string, interpretation: ECGInterpretation) => void;
  addNote: (id: string, note: string) => void;
}

export const useCardiologueStore = create<CardiologueStore>((set, get) => ({
  ecgs: mockCardiologueECGs,
  currentECG: null,
  isLoading: false,

  getByStatus: (status) => {
    return get().ecgs.filter(ecg => ecg.status === status);
  },

  getPending: () => {
    return get().ecgs
      .filter(ecg => ecg.status === 'pending')
      .sort((a, b) => {
        // Urgents en premier
        if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
        if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
        // Puis par date d'assignation
        return new Date(a.dateAssigned).getTime() - new Date(b.dateAssigned).getTime();
      });
  },

  getUrgent: () => {
    return get().ecgs.filter(ecg => ecg.urgency === 'urgent' && ecg.status !== 'completed');
  },

  getInProgress: () => {
    return get().ecgs.filter(ecg => ecg.status === 'in_progress');
  },

  getCompleted: () => {
    return get().ecgs
      .filter(ecg => ecg.status === 'completed')
      .sort((a, b) => new Date(b.dateCompleted!).getTime() - new Date(a.dateCompleted!).getTime());
  },

  getCounts: () => {
    const ecgs = get().ecgs;
    const today = new Date().toDateString();
    return {
      pending: ecgs.filter(e => e.status === 'pending').length,
      urgent: ecgs.filter(e => e.urgency === 'urgent' && e.status !== 'completed').length,
      inProgress: ecgs.filter(e => e.status === 'in_progress').length,
      completed: ecgs.filter(e => e.status === 'completed').length,
      today: ecgs.filter(e => e.status === 'completed' && new Date(e.dateCompleted!).toDateString() === today).length,
    };
  },

  getById: (id) => {
    return get().ecgs.find(ecg => ecg.id === id);
  },

  setCurrentECG: (ecg) => {
    set({ currentECG: ecg });
  },

  startAnalysis: (id) => {
    set(state => ({
      ecgs: state.ecgs.map(ecg =>
        ecg.id === id
          ? { ...ecg, status: 'in_progress' as ECGStatus, dateStarted: new Date().toISOString() }
          : ecg
      )
    }));
  },

  saveMeasurements: (id, measurements) => {
    set(state => ({
      ecgs: state.ecgs.map(ecg =>
        ecg.id === id
          ? { ...ecg, measurements: { ...ecg.measurements, ...measurements } }
          : ecg
      )
    }));
  },

  saveInterpretation: (id, interpretation) => {
    set(state => ({
      ecgs: state.ecgs.map(ecg =>
        ecg.id === id
          ? { ...ecg, interpretation }
          : ecg
      )
    }));
  },

  completeAnalysis: (id, interpretation) => {
    set(state => ({
      ecgs: state.ecgs.map(ecg =>
        ecg.id === id
          ? { 
              ...ecg, 
              status: 'completed' as ECGStatus, 
              dateCompleted: new Date().toISOString(),
              interpretation 
            }
          : ecg
      ),
      currentECG: null
    }));
  },

  addNote: (id, note) => {
    set(state => ({
      ecgs: state.ecgs.map(ecg =>
        ecg.id === id
          ? { ...ecg, notes: ecg.notes ? `${ecg.notes}\n${note}` : note }
          : ecg
      )
    }));
  },
}));
