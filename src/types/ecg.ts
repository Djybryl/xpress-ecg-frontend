import type { Tables } from '@/lib/database.types';

export interface Hospital {
  id: string;
  name: string;
  pendingCount: number;
}

export type ECGRecord = Tables['ecg_records']['Row'] & {
  files?: Tables['ecg_files']['Row'][];
  referring_doctor?: Partial<Tables['users']['Row']>;
  second_opinions?: Tables['second_opinions']['Row'][];
  tags?: Array<{ id: string; name: string; color: string }>;
  notes?: string | null;
};

export interface DashboardStats {
  today: {
    received: number;
    analyzed: number;
    sent: number;
  };
  week: {
    received: number;
    analyzed: number;
    sent: number;
  };
  month: {
    received: number;
    analyzed: number;
    sent: number;
  };
}

export interface ECGAnalysisResult {
  heartRate?: number;
  prInterval?: number;
  qrsInterval?: number;
  qtInterval?: number;
  diagnosis?: string;
  annotations?: Array<{
    time: number;
    label: string;
    type: 'normal' | 'warning' | 'critical';
  }>;
}