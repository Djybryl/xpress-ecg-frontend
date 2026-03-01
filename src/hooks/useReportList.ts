import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/apiClient';

export interface ReportItem {
  id: string;
  ecg_record_id: string;
  cardiologist_id: string;
  conclusion: string;
  is_normal: boolean;
  is_read: boolean;
  is_urgent: boolean;
  status: 'draft' | 'validated' | 'sent';
  pdf_url: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  /** Champs joints */
  patient_name: string | null;
  cardiologist_name: string | null;
}

export interface ReportListParams {
  is_read?: boolean;
  status?: string;
  ecg_record_id?: string;
  limit?: number;
}

interface UseReportListResult {
  reports: ReportItem[];
  total: number;
  unreadCount: number;
  urgentUnreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export function useReportList(params: ReportListParams = {}): UseReportListResult {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        limit: params.limit ?? 200,
      };
      if (params.is_read !== undefined) queryParams.is_read  = params.is_read;
      if (params.status)               queryParams.status    = params.status;
      if (params.ecg_record_id)        queryParams.ecg_record_id = params.ecg_record_id;

      const response = await api.get<ReportItem[] | { reports?: ReportItem[]; total?: number }>(
        '/reports',
        queryParams,
      );

      const list = Array.isArray(response)
        ? response
        : ((response as { reports?: ReportItem[] }).reports ?? []);
      const tot = Array.isArray(response)
        ? list.length
        : ((response as { total?: number }).total ?? list.length);

      setReports(list);
      setTotal(tot);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement des rapports');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.is_read, params.status, params.ecg_record_id, params.limit]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const markRead = useCallback(async (id: string) => {
    await api.patch(`/reports/${id}/mark-read`);
    setReports(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = reports.filter(r => !r.is_read);
    await Promise.all(unread.map(r => api.patch(`/reports/${r.id}/mark-read`)));
    setReports(prev => prev.map(r => ({ ...r, is_read: true })));
  }, [reports]);

  const unreadCount = reports.filter(r => !r.is_read).length;
  const urgentUnreadCount = reports.filter(r => !r.is_read && r.is_urgent).length;

  return {
    reports,
    total,
    unreadCount,
    urgentUnreadCount,
    loading,
    error,
    refetch: fetchReports,
    markRead,
    markAllRead,
  };
}
