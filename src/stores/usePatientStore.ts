import { create } from 'zustand';

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  ecgCount: number;
  lastEcgDate?: string;
}

// Données mockées
const mockPatients: Patient[] = [
  {
    id: 'PAT-001',
    name: 'Pierre Dupont',
    dateOfBirth: '1965-03-15',
    gender: 'M',
    phone: '+33 6 12 34 56 78',
    email: 'pierre.dupont@email.fr',
    createdAt: '2024-01-15T10:00:00Z',
    ecgCount: 3,
    lastEcgDate: '2024-12-20'
  },
  {
    id: 'PAT-002',
    name: 'Marie Laurent',
    dateOfBirth: '1978-07-22',
    gender: 'F',
    phone: '+33 6 98 76 54 32',
    createdAt: '2024-02-10T14:30:00Z',
    ecgCount: 2,
    lastEcgDate: '2024-12-18'
  },
  {
    id: 'PAT-003',
    name: 'Jean-Paul Mercier',
    dateOfBirth: '1952-11-08',
    gender: 'M',
    phone: '+33 6 11 22 33 44',
    email: 'jp.mercier@email.fr',
    createdAt: '2024-03-05T09:15:00Z',
    ecgCount: 5,
    lastEcgDate: '2024-12-22'
  },
  {
    id: 'PAT-004',
    name: 'Élise Moreau',
    dateOfBirth: '1990-05-30',
    gender: 'F',
    createdAt: '2024-04-20T11:00:00Z',
    ecgCount: 1,
    lastEcgDate: '2024-12-15'
  },
  {
    id: 'PAT-005',
    name: 'Robert Petit',
    dateOfBirth: '1948-09-12',
    gender: 'M',
    phone: '+33 6 55 66 77 88',
    notes: 'Patient cardiaque, suivi régulier',
    createdAt: '2024-05-10T08:45:00Z',
    ecgCount: 8,
    lastEcgDate: '2024-12-24'
  },
];

interface PatientStore {
  patients: Patient[];
  isLoading: boolean;
  searchPatients: (query: string) => Patient[];
  getPatient: (id: string) => Patient | undefined;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'ecgCount'>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: mockPatients,
  isLoading: false,

  searchPatients: (query: string) => {
    const { patients } = get();
    if (!query.trim()) return patients;
    
    const lowerQuery = query.toLowerCase();
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(lowerQuery) ||
      patient.id.toLowerCase().includes(lowerQuery) ||
      patient.dateOfBirth.includes(query)
    );
  },

  getPatient: (id: string) => {
    const { patients } = get();
    return patients.find(p => p.id === id);
  },

  addPatient: (patientData) => {
    const newPatient: Patient = {
      ...patientData,
      id: `PAT-${String(get().patients.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      ecgCount: 0,
    };
    
    set(state => ({
      patients: [...state.patients, newPatient]
    }));
    
    return newPatient;
  },

  updatePatient: (id: string, data: Partial<Patient>) => {
    set(state => ({
      patients: state.patients.map(p =>
        p.id === id ? { ...p, ...data } : p
      )
    }));
  },
}));
