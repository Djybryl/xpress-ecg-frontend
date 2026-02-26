/** Types miroir des réponses du backend GET /api/v1/dashboard/stats */

export interface DoctorStats {
  total_ecg_sent: number;
  pending_count: number;
  completed_count: number;
  unread_reports: number;
}

export interface CardiologueStats {
  assigned_count: number;
  analyzing_count: number;
  completed_today: number;
  pending_second_opinions: number;
}

export interface SecretaryStats {
  pending_validation: number;
  assigned_today: number;
  total_today: number;
}

export interface AdminStats {
  total_users: number;
  total_hospitals: number;
  total_ecg_today: number;
  total_ecg_month: number;
  pending_ecg: number;
  completed_ecg: number;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  user_id: string;
  ecg_record_id: string | null;
  details: string;
  created_at: string;
}

export type DashboardStats =
  | DoctorStats
  | CardiologueStats
  | SecretaryStats
  | AdminStats;
