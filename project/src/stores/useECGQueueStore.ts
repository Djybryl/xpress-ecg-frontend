import { create } from 'zustand';

export type ECGQueueStatus = 'received' | 'validated' | 'assigned' | 'analyzing' | 'completed' | 'ready_to_send' | 'sent';

export interface ECGQueueItem {
  id: string;
  patientName: string;
  patientId: string;
  patientGender: 'M' | 'F';
  patientAge: number;
  referringDoctor: string;
  referringDoctorEmail: string;
  hospital: string;
  dateReceived: string;
  dateValidated?: string;
  dateAssigned?: string;
  dateCompleted?: string;
  dateSent?: string;
  status: ECGQueueStatus;
  urgency: 'normal' | 'urgent';
  assignedTo?: string;
  ecgDate: string;
  clinicalContext?: string;
  notes?: string;
}

// Données mockées
const mockQueue: ECGQueueItem[] = [
  // ECG reçus (à valider)
  {
    id: 'ECG-2024-0420',
    patientName: 'Claire Fontaine',
    patientId: 'PAT-020',
    patientGender: 'F',
    patientAge: 52,
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorEmail: 'martin@hopital.fr',
    hospital: 'Hôpital Saint-Louis',
    dateReceived: '2024-12-25T15:30:00',
    status: 'received',
    urgency: 'urgent',
    ecgDate: '2024-12-25',
    clinicalContext: 'Douleur thoracique aiguë'
  },
  {
    id: 'ECG-2024-0419',
    patientName: 'Michel Durand',
    patientId: 'PAT-019',
    patientGender: 'M',
    patientAge: 67,
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorEmail: 'martin@hopital.fr',
    hospital: 'Hôpital Saint-Louis',
    dateReceived: '2024-12-25T14:00:00',
    status: 'received',
    urgency: 'normal',
    ecgDate: '2024-12-25',
    clinicalContext: 'Bilan annuel'
  },
  {
    id: 'ECG-2024-0418',
    patientName: 'Anne Leroy',
    patientId: 'PAT-018',
    patientGender: 'F',
    patientAge: 45,
    referringDoctor: 'Dr. Sophie Blanc',
    referringDoctorEmail: 'blanc@clinique.fr',
    hospital: 'Clinique du Sport',
    dateReceived: '2024-12-25T11:30:00',
    status: 'received',
    urgency: 'normal',
    ecgDate: '2024-12-25',
    clinicalContext: 'Palpitations occasionnelles'
  },
  // ECG validés (à assigner)
  {
    id: 'ECG-2024-0417',
    patientName: 'Paul Renard',
    patientId: 'PAT-017',
    patientGender: 'M',
    patientAge: 58,
    referringDoctor: 'Dr. François Petit',
    referringDoctorEmail: 'petit@cardio.fr',
    hospital: 'Centre Cardio Paris',
    dateReceived: '2024-12-25T09:00:00',
    dateValidated: '2024-12-25T09:15:00',
    status: 'validated',
    urgency: 'urgent',
    ecgDate: '2024-12-25',
    clinicalContext: 'Syncope récente'
  },
  {
    id: 'ECG-2024-0416',
    patientName: 'Isabelle Martin',
    patientId: 'PAT-016',
    patientGender: 'F',
    patientAge: 72,
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorEmail: 'martin@hopital.fr',
    hospital: 'Hôpital Saint-Louis',
    dateReceived: '2024-12-25T08:30:00',
    dateValidated: '2024-12-25T08:45:00',
    status: 'validated',
    urgency: 'normal',
    ecgDate: '2024-12-25',
    clinicalContext: 'Contrôle post-opératoire'
  },
  // ECG assignés (en cours d'analyse)
  {
    id: 'ECG-2024-0415',
    patientName: 'Thomas Girard',
    patientId: 'PAT-015',
    patientGender: 'M',
    patientAge: 63,
    referringDoctor: 'Dr. Sophie Blanc',
    referringDoctorEmail: 'blanc@clinique.fr',
    hospital: 'Clinique du Sport',
    dateReceived: '2024-12-24T16:00:00',
    dateValidated: '2024-12-24T16:10:00',
    dateAssigned: '2024-12-24T16:15:00',
    status: 'analyzing',
    urgency: 'normal',
    assignedTo: 'Dr. Sophie Bernard',
    ecgDate: '2024-12-24',
    clinicalContext: 'Suivi HTA'
  },
  // ECG terminés (prêts à envoyer)
  {
    id: 'ECG-2024-0414',
    patientName: 'Marie Dubois',
    patientId: 'PAT-014',
    patientGender: 'F',
    patientAge: 55,
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorEmail: 'martin@hopital.fr',
    hospital: 'Hôpital Saint-Louis',
    dateReceived: '2024-12-24T14:00:00',
    dateValidated: '2024-12-24T14:10:00',
    dateAssigned: '2024-12-24T14:20:00',
    dateCompleted: '2024-12-24T16:00:00',
    status: 'ready_to_send',
    urgency: 'normal',
    assignedTo: 'Dr. Sophie Bernard',
    ecgDate: '2024-12-24',
    clinicalContext: 'Bilan pré-opératoire'
  },
  {
    id: 'ECG-2024-0413',
    patientName: 'Jacques Moreau',
    patientId: 'PAT-013',
    patientGender: 'M',
    patientAge: 78,
    referringDoctor: 'Dr. François Petit',
    referringDoctorEmail: 'petit@cardio.fr',
    hospital: 'Centre Cardio Paris',
    dateReceived: '2024-12-24T11:00:00',
    dateValidated: '2024-12-24T11:10:00',
    dateAssigned: '2024-12-24T11:15:00',
    dateCompleted: '2024-12-24T14:30:00',
    status: 'ready_to_send',
    urgency: 'urgent',
    assignedTo: 'Dr. François Dubois',
    ecgDate: '2024-12-24',
    clinicalContext: 'Dyspnée d\'effort'
  },
  {
    id: 'ECG-2024-0412',
    patientName: 'Sylvie Lambert',
    patientId: 'PAT-012',
    patientGender: 'F',
    patientAge: 48,
    referringDoctor: 'Dr. Sophie Blanc',
    referringDoctorEmail: 'blanc@clinique.fr',
    hospital: 'Clinique du Sport',
    dateReceived: '2024-12-24T09:00:00',
    dateValidated: '2024-12-24T09:10:00',
    dateAssigned: '2024-12-24T09:20:00',
    dateCompleted: '2024-12-24T11:00:00',
    status: 'ready_to_send',
    urgency: 'normal',
    assignedTo: 'Dr. Sophie Bernard',
    ecgDate: '2024-12-24',
    clinicalContext: 'Certificat sport'
  },
  // ECG envoyés (archivés)
  {
    id: 'ECG-2024-0411',
    patientName: 'Pierre Lefebvre',
    patientId: 'PAT-011',
    patientGender: 'M',
    patientAge: 65,
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorEmail: 'martin@hopital.fr',
    hospital: 'Hôpital Saint-Louis',
    dateReceived: '2024-12-23T14:00:00',
    dateValidated: '2024-12-23T14:10:00',
    dateAssigned: '2024-12-23T14:15:00',
    dateCompleted: '2024-12-23T16:00:00',
    dateSent: '2024-12-23T16:30:00',
    status: 'sent',
    urgency: 'normal',
    assignedTo: 'Dr. Sophie Bernard',
    ecgDate: '2024-12-23',
    clinicalContext: 'Suivi cardiologique'
  },
];

// Liste des cardiologues disponibles
export const cardiologists = [
  { id: '1', name: 'Dr. Sophie Bernard', specialty: 'Cardiologie générale', available: true, currentLoad: 3 },
  { id: '2', name: 'Dr. François Dubois', specialty: 'Électrophysiologie', available: true, currentLoad: 2 },
  { id: '3', name: 'Dr. Claire Leroy', specialty: 'Cardiologie interventionnelle', available: false, currentLoad: 5 },
];

interface ECGQueueStore {
  queue: ECGQueueItem[];
  isLoading: boolean;
  
  // Getters
  getByStatus: (status: ECGQueueStatus | ECGQueueStatus[]) => ECGQueueItem[];
  getById: (id: string) => ECGQueueItem | undefined;
  getCounts: () => Record<string, number>;
  
  // Actions
  validateECG: (id: string) => void;
  assignECG: (id: string, cardiologistName: string) => void;
  markAsSent: (id: string) => void;
  bulkMarkAsSent: (ids: string[]) => void;
  addNote: (id: string, note: string) => void;
}

export const useECGQueueStore = create<ECGQueueStore>((set, get) => ({
  queue: mockQueue,
  isLoading: false,

  getByStatus: (status) => {
    const { queue } = get();
    const statuses = Array.isArray(status) ? status : [status];
    return queue.filter(item => statuses.includes(item.status));
  },

  getById: (id) => {
    return get().queue.find(item => item.id === id);
  },

  getCounts: () => {
    const { queue } = get();
    return {
      received: queue.filter(i => i.status === 'received').length,
      validated: queue.filter(i => i.status === 'validated').length,
      assigned: queue.filter(i => i.status === 'assigned').length,
      analyzing: queue.filter(i => i.status === 'analyzing').length,
      ready_to_send: queue.filter(i => i.status === 'ready_to_send').length,
      sent: queue.filter(i => i.status === 'sent').length,
      urgent: queue.filter(i => i.urgency === 'urgent' && !['sent', 'ready_to_send'].includes(i.status)).length,
    };
  },

  validateECG: (id) => {
    set(state => ({
      queue: state.queue.map(item =>
        item.id === id
          ? { ...item, status: 'validated' as ECGQueueStatus, dateValidated: new Date().toISOString() }
          : item
      )
    }));
  },

  assignECG: (id, cardiologistName) => {
    set(state => ({
      queue: state.queue.map(item =>
        item.id === id
          ? { 
              ...item, 
              status: 'assigned' as ECGQueueStatus, 
              assignedTo: cardiologistName,
              dateAssigned: new Date().toISOString() 
            }
          : item
      )
    }));
  },

  markAsSent: (id) => {
    set(state => ({
      queue: state.queue.map(item =>
        item.id === id
          ? { ...item, status: 'sent' as ECGQueueStatus, dateSent: new Date().toISOString() }
          : item
      )
    }));
  },

  bulkMarkAsSent: (ids) => {
    set(state => ({
      queue: state.queue.map(item =>
        ids.includes(item.id)
          ? { ...item, status: 'sent' as ECGQueueStatus, dateSent: new Date().toISOString() }
          : item
      )
    }));
  },

  addNote: (id, note) => {
    set(state => ({
      queue: state.queue.map(item =>
        item.id === id
          ? { ...item, notes: item.notes ? `${item.notes}\n${note}` : note }
          : item
      )
    }));
  },
}));
