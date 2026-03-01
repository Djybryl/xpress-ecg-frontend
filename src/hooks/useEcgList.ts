import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/apiClient';

/** Enregistrement ECG tel que retourné par le backend */
export interface EcgRecordItem {
  id: string;
  /** Référence humaine lisible — format ECG-YYYY-NNNNNN (ex: ECG-2025-000042) */
  reference: string;
  patient_name: string;
  patient_id: string | null;
  medical_center: string;
  gender: 'M' | 'F' | null;
  hospital_id: string | null;
  referring_doctor_id: string | null;
  assigned_to: string | null;
  status: 'pending' | 'validated' | 'assigned' | 'analyzing' | 'completed';
  urgency: 'normal' | 'urgent';
  clinical_context: string | null;
  date: string;
  analyzed_at: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface EcgListParams {
  /** Filtrer par médecin référent (vue médecin) */
  referring_doctor_id?: string;
  /** Filtrer par cardiologue assigné (vue cardiologue) */
  assigned_to?: string;
  /** Filtrer par statut */
  status?: string;
  /** Filtrer par urgence */
  urgency?: string;
  /** Filtrer par hôpital */
  hospital_id?: string;
  /** Nombre max d'enregistrements à récupérer (défaut 200) */
  limit?: number;
  /**
   * UUID du cardiologue connecté : retourne les pending (file commune)
   * + les assigned attribués à cet utilisateur.
   * Si fourni, le filtre `status` est ignoré côté backend.
   */
  viewer_id?: string;
}

interface UseEcgListResult {
  records: EcgRecordItem[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Retourne la référence humaine lisible d'un ECG.
 * Utilise `reference` si disponible (données réelles), sinon replie sur `id`.
 * Permet de gérer les stores mock (sans `reference`) sans crash.
 */
export function ecgRef(ecg: { id: string; reference?: string }): string {
  return ecg.reference ?? ecg.id;
}

/**
 * Récupère la liste des ECG depuis le backend avec filtres.
 * La pagination côté client est gérée dans les composants (les enregistrements
 * filtrés sont tous chargés d'un coup).
 */
export function useEcgList(params: EcgListParams = {}): UseEcgListResult {
  const [records, setRecords] = useState<EcgRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        limit: params.limit ?? 200,
      };
      if (params.referring_doctor_id) queryParams.referring_doctor_id = params.referring_doctor_id;
      if (params.assigned_to)         queryParams.assigned_to = params.assigned_to;
      if (params.status)              queryParams.status = params.status;
      if (params.urgency)             queryParams.urgency = params.urgency;
      if (params.hospital_id)         queryParams.hospital_id = params.hospital_id;
      if (params.viewer_id)           queryParams.viewer_id = params.viewer_id;

      const response = await api.get<{ records: EcgRecordItem[]; total: number }>(
        '/ecg-records',
        queryParams,
      );
      setRecords(response.records ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement des ECG');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.referring_doctor_id,
    params.assigned_to,
    params.status,
    params.urgency,
    params.hospital_id,
    params.limit,
    params.viewer_id,
  ]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { records, total, loading, error, refetch: fetchRecords };
}
