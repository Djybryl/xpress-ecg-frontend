import { create } from 'zustand';

// Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'M' | 'F';
  phone?: string;
  email?: string;
}

export interface ECGRecord {
  id: string;
  referenceNumber: string;
  patient: Patient;
  medicalCenter: string;
  medicalCenterId: string;
  referringDoctor: string;
  referringDoctorId: string;
  acquisitionDate: string;
  receivedDate: string;
  clinicalContext?: string;
  symptoms?: string;
  medications?: string;
  status: 'pending' | 'in_progress' | 'validated' | 'sent';
  priority: 'normal' | 'urgent' | 'critical';
  viewed: boolean;
  viewedAt?: string;
  viewedBy?: string;
  interpretation?: string;
  measurements?: ECGMeasurements;
  validatedAt?: string;
  validatedBy?: string;
  sentAt?: string;
  notes: ECGNote[];
  secondOpinionRequested: boolean;
  secondOpinionStatus?: 'pending' | 'received';
  secondOpinionFrom?: string;
  secondOpinionResponse?: string;
}

export interface ECGMeasurements {
  heartRate: number | null;
  prInterval: number | null;
  qrsDuration: number | null;
  qtInterval: number | null;
  qtcInterval: number | null;
  axisP: number | null;
  axisQRS: number | null;
  axisT: number | null;
}

export interface ECGNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  pendingCount: number;
  active: boolean;
}

export interface ECGFilter {
  search: string;
  status: string[];
  priority: string[];
  hospitalId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  onlyUrgent: boolean;
  onlySecondOpinion: boolean;
}

interface ECGState {
  // ECG Records
  records: ECGRecord[];
  setRecords: (records: ECGRecord[]) => void;
  updateRecord: (id: string, updates: Partial<ECGRecord>) => void;
  
  // Selected ECG
  selectedECG: ECGRecord | null;
  setSelectedECG: (ecg: ECGRecord | null) => void;
  
  // Hospitals
  hospitals: Hospital[];
  setHospitals: (hospitals: Hospital[]) => void;
  
  // Filters
  filters: ECGFilter;
  setFilters: (filters: Partial<ECGFilter>) => void;
  resetFilters: () => void;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  
  // Computed
  filteredRecords: () => ECGRecord[];
  paginatedRecords: () => ECGRecord[];
  totalPages: () => number;
  
  // Stats
  getStats: (timeframe: 'today' | 'week' | 'month') => {
    received: number;
    analyzed: number;
    sent: number;
    avgTime: number;
  };
  
  // Notes
  addNote: (ecgId: string, note: Omit<ECGNote, 'id' | 'createdAt'>) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isRefreshing: boolean;
  setIsRefreshing: (refreshing: boolean) => void;
}

const defaultFilters: ECGFilter = {
  search: '',
  status: [],
  priority: [],
  hospitalId: null,
  dateFrom: null,
  dateTo: null,
  onlyUrgent: false,
  onlySecondOpinion: false,
};

// Mock data
const mockPatients: Patient[] = [
  { id: 'p1', firstName: 'Pierre', lastName: 'Dupont', birthDate: '1957-03-15', gender: 'M' },
  { id: 'p2', firstName: 'Marie', lastName: 'Laurent', birthDate: '1979-08-22', gender: 'F' },
  { id: 'p3', firstName: 'Jean-Paul', lastName: 'Mercier', birthDate: '1952-11-08', gender: 'M' },
  { id: 'p4', firstName: 'Élise', lastName: 'Moreau', birthDate: '1969-06-30', gender: 'F' },
  { id: 'p5', firstName: 'Robert', lastName: 'Petit', birthDate: '1966-01-17', gender: 'M' },
];

const mockHospitals: Hospital[] = [
  { id: 'h1', name: 'Hôpital Saint-Louis', address: '1 Avenue Claude Vellefaux, 75010 Paris', phone: '01 42 49 49 49', email: 'contact@saintlouis.fr', pendingCount: 12, active: true },
  { id: 'h2', name: 'Clinique du Sport', address: '36 Boulevard Saint-Marcel, 75005 Paris', phone: '01 45 87 22 33', email: 'contact@cliniquesport.fr', pendingCount: 5, active: true },
  { id: 'h3', name: 'Centre Cardio Paris', address: '56 Rue de Babylone, 75007 Paris', phone: '01 44 39 50 00', email: 'cardio@centreparis.fr', pendingCount: 8, active: true },
  { id: 'h4', name: 'Hôpital Américain', address: '63 Boulevard Victor Hugo, 92200 Neuilly', phone: '01 46 41 25 25', email: 'info@ahparis.org', pendingCount: 3, active: true },
  { id: 'h5', name: 'Institut Cœur Paris', address: '8 Rue de la Croix Jarry, 75013 Paris', phone: '01 45 80 11 11', email: 'contact@icparis.fr', pendingCount: 6, active: true },
];

// Helper to generate dates relative to now
const getRelativeDate = (hoursAgo: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

const mockRecords: ECGRecord[] = [
  {
    id: 'ecg-1',
    referenceNumber: 'ECG-2025-0412',
    patient: mockPatients[0],
    medicalCenter: 'Hôpital Saint-Louis',
    medicalCenterId: 'h1',
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorId: 'd1',
    acquisitionDate: getRelativeDate(1), // 1 heure avant
    receivedDate: getRelativeDate(1),
    symptoms: 'Douleur thoracique, dyspnée',
    clinicalContext: 'ATCD: HTA, diabète type 2',
    medications: 'Metformine 1000mg, Ramipril 5mg',
    status: 'pending',
    priority: 'urgent',
    viewed: false,
    notes: [],
    secondOpinionRequested: false,
  },
  {
    id: 'ecg-2',
    referenceNumber: 'ECG-2025-0411',
    patient: mockPatients[1],
    medicalCenter: 'Clinique du Sport',
    medicalCenterId: 'h2',
    referringDoctor: 'Dr. Sophie Bernard',
    referringDoctorId: 'd2',
    acquisitionDate: getRelativeDate(2), // 2 heures avant
    receivedDate: getRelativeDate(2),
    symptoms: 'Palpitations à l\'effort',
    clinicalContext: 'Bilan avant reprise sportive',
    status: 'in_progress',
    priority: 'normal',
    viewed: true,
    viewedAt: getRelativeDate(1.5),
    notes: [],
    secondOpinionRequested: false,
  },
  {
    id: 'ecg-3',
    referenceNumber: 'ECG-2025-0410',
    patient: mockPatients[2],
    medicalCenter: 'Centre Cardio Paris',
    medicalCenterId: 'h3',
    referringDoctor: 'Dr. François Dubois',
    referringDoctorId: 'd3',
    acquisitionDate: getRelativeDate(4), // 4 heures avant
    receivedDate: getRelativeDate(4),
    clinicalContext: 'Contrôle post-angioplastie',
    status: 'validated',
    priority: 'normal',
    viewed: true,
    viewedAt: getRelativeDate(3.5),
    interpretation: 'Rythme sinusal régulier. Pas d\'anomalie de repolarisation. ECG dans les limites de la normale.',
    measurements: { heartRate: 72, prInterval: 160, qrsDuration: 88, qtInterval: 380, qtcInterval: 416, axisP: 45, axisQRS: 30, axisT: 40 },
    validatedAt: getRelativeDate(3),
    notes: [],
    secondOpinionRequested: false,
  },
  {
    id: 'ecg-4',
    referenceNumber: 'ECG-2025-0409',
    patient: mockPatients[3],
    medicalCenter: 'Hôpital Saint-Louis',
    medicalCenterId: 'h1',
    referringDoctor: 'Dr. Jean Martin',
    referringDoctorId: 'd1',
    acquisitionDate: getRelativeDate(5), // 5 heures avant
    receivedDate: getRelativeDate(5),
    symptoms: 'Syncope, malaise lipothymique',
    clinicalContext: 'ATCD: BAV 1, insuffisance cardiaque',
    medications: 'Bisoprolol 2.5mg, Furosémide 40mg',
    status: 'pending',
    priority: 'critical',
    viewed: false,
    notes: [],
    secondOpinionRequested: true,
    secondOpinionStatus: 'pending',
  },
  {
    id: 'ecg-5',
    referenceNumber: 'ECG-2025-0408',
    patient: mockPatients[4],
    medicalCenter: 'Institut Cœur Paris',
    medicalCenterId: 'h5',
    referringDoctor: 'Dr. Claire Leroy',
    referringDoctorId: 'd4',
    acquisitionDate: getRelativeDate(6), // 6 heures avant
    receivedDate: getRelativeDate(6),
    clinicalContext: 'Bilan pré-opératoire chirurgie orthopédique',
    status: 'sent',
    priority: 'normal',
    viewed: true,
    viewedAt: getRelativeDate(5.5),
    interpretation: 'Rythme sinusal régulier à 68/min. Axe normal. Pas de trouble de la repolarisation. ECG normal.',
    measurements: { heartRate: 68, prInterval: 155, qrsDuration: 92, qtInterval: 390, qtcInterval: 414, axisP: 50, axisQRS: 25, axisT: 35 },
    validatedAt: getRelativeDate(5),
    sentAt: getRelativeDate(4.5),
    notes: [{ id: 'n1', content: 'Patient apte pour chirurgie', createdAt: getRelativeDate(5), createdBy: 'u1', createdByName: 'Dr. Sophie Bernard' }],
    secondOpinionRequested: false,
  },
  {
    id: 'ecg-6',
    referenceNumber: 'ECG-2025-0407',
    patient: mockPatients[0],
    medicalCenter: 'Centre Cardio Paris',
    medicalCenterId: 'h3',
    referringDoctor: 'Dr. François Dubois',
    referringDoctorId: 'd3',
    acquisitionDate: getRelativeDate(8), // 8 heures avant
    receivedDate: getRelativeDate(8),
    symptoms: 'Contrôle de routine',
    clinicalContext: 'Suivi HTA',
    status: 'sent',
    priority: 'normal',
    viewed: true,
    viewedAt: getRelativeDate(7),
    interpretation: 'Rythme sinusal régulier à 76/min. HVG électrique modérée. Pas de trouble de la repolarisation aigu.',
    measurements: { heartRate: 76, prInterval: 168, qrsDuration: 94, qtInterval: 384, qtcInterval: 430, axisP: 40, axisQRS: -15, axisT: 25 },
    validatedAt: getRelativeDate(6.5),
    sentAt: getRelativeDate(6),
    notes: [],
    secondOpinionRequested: false,
  },
  {
    id: 'ecg-7',
    referenceNumber: 'ECG-2025-0406',
    patient: mockPatients[1],
    medicalCenter: 'Hôpital Américain',
    medicalCenterId: 'h4',
    referringDoctor: 'Dr. Claire Leroy',
    referringDoctorId: 'd4',
    acquisitionDate: getRelativeDate(10), // 10 heures avant
    receivedDate: getRelativeDate(10),
    symptoms: 'Essoufflement à l\'effort',
    clinicalContext: 'Bilan cardiologique complet',
    status: 'validated',
    priority: 'normal',
    viewed: true,
    viewedAt: getRelativeDate(9),
    interpretation: 'Rythme sinusal. Pas d\'anomalie significative.',
    measurements: { heartRate: 82, prInterval: 152, qrsDuration: 86, qtInterval: 368, qtcInterval: 428, axisP: 55, axisQRS: 45, axisT: 50 },
    validatedAt: getRelativeDate(8.5),
    notes: [],
    secondOpinionRequested: false,
  },
  {
    id: 'ecg-8',
    referenceNumber: 'ECG-2025-0405',
    patient: mockPatients[2],
    medicalCenter: 'Institut Cœur Paris',
    medicalCenterId: 'h5',
    referringDoctor: 'Dr. Sophie Bernard',
    referringDoctorId: 'd2',
    acquisitionDate: getRelativeDate(12), // 12 heures avant
    receivedDate: getRelativeDate(12),
    symptoms: 'Douleur précordiale atypique',
    clinicalContext: 'Anxiété, stress professionnel',
    status: 'sent',
    priority: 'normal',
    viewed: true,
    viewedAt: getRelativeDate(11),
    interpretation: 'ECG strictement normal. Pas de signe d\'ischémie.',
    measurements: { heartRate: 88, prInterval: 148, qrsDuration: 82, qtInterval: 356, qtcInterval: 418, axisP: 48, axisQRS: 35, axisT: 42 },
    validatedAt: getRelativeDate(10.5),
    sentAt: getRelativeDate(10),
    notes: [{ id: 'n2', content: 'Rassurer le patient, proposer prise en charge du stress', createdAt: getRelativeDate(10.5), createdBy: 'u1', createdByName: 'Dr. Sophie Bernard' }],
    secondOpinionRequested: false,
  },
];

export const useECGStore = create<ECGState>((set, get) => ({
  // ECG Records
  records: mockRecords,
  setRecords: (records) => set({ records }),
  updateRecord: (id, updates) => {
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      selectedECG: state.selectedECG?.id === id ? { ...state.selectedECG, ...updates } : state.selectedECG,
    }));
  },
  
  // Selected ECG
  selectedECG: null,
  setSelectedECG: (ecg) => set({ selectedECG: ecg }),
  
  // Hospitals
  hospitals: mockHospitals,
  setHospitals: (hospitals) => set({ hospitals }),
  
  // Filters
  filters: defaultFilters,
  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters }, currentPage: 1 }));
  },
  resetFilters: () => set({ filters: defaultFilters, currentPage: 1 }),
  
  // Pagination
  currentPage: 1,
  itemsPerPage: 10,
  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (count) => set({ itemsPerPage: count, currentPage: 1 }),
  
  // Computed
  filteredRecords: () => {
    const { records, filters } = get();
    
    return records.filter((record) => {
      // Search
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          record.referenceNumber.toLowerCase().includes(search) ||
          record.patient.firstName.toLowerCase().includes(search) ||
          record.patient.lastName.toLowerCase().includes(search) ||
          record.medicalCenter.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      
      // Status
      if (filters.status.length > 0 && !filters.status.includes(record.status)) {
        return false;
      }
      
      // Priority
      if (filters.priority.length > 0 && !filters.priority.includes(record.priority)) {
        return false;
      }
      
      // Hospital
      if (filters.hospitalId && record.medicalCenterId !== filters.hospitalId) {
        return false;
      }
      
      // Only urgent
      if (filters.onlyUrgent && record.priority === 'normal') {
        return false;
      }
      
      // Only second opinion
      if (filters.onlySecondOpinion && !record.secondOpinionRequested) {
        return false;
      }
      
      // Date range
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        const recordDate = new Date(record.acquisitionDate);
        if (recordDate < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        const recordDate = new Date(record.acquisitionDate);
        if (recordDate > to) return false;
      }
      
      return true;
    });
  },
  
  paginatedRecords: () => {
    const { currentPage, itemsPerPage } = get();
    const filtered = get().filteredRecords();
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  },
  
  totalPages: () => {
    const { itemsPerPage } = get();
    const filtered = get().filteredRecords();
    return Math.ceil(filtered.length / itemsPerPage);
  },
  
  // Stats
  getStats: (timeframe) => {
    const { records } = get();
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    
    const filteredRecords = records.filter((r) => new Date(r.receivedDate) >= startDate);
    
    return {
      received: filteredRecords.length,
      analyzed: filteredRecords.filter((r) => r.status !== 'pending').length,
      sent: filteredRecords.filter((r) => r.status === 'sent').length,
      avgTime: 15, // Mock average time in minutes
    };
  },
  
  // Notes
  addNote: (ecgId, note) => {
    set((state) => ({
      records: state.records.map((r) =>
        r.id === ecgId
          ? {
              ...r,
              notes: [
                ...r.notes,
                { ...note, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
              ],
            }
          : r
      ),
    }));
  },
  
  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  isRefreshing: false,
  setIsRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
}));
