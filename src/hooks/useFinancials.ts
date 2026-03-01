import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/apiClient';

// ─── Types (miroir du backend) ────────────────────────────────────────────────

export interface TarifConfig {
  ecgCostPatient: number;
  cardiologuePercent: number;
  medecinPercent: number;
  platformPercent: number;
  secondOpinionCost: number;
}

export interface BonusConfig {
  enabled: boolean;
  volumeEnabled: boolean;
  volumeThreshold: number;
  volumeBonus: number;
  qualityEnabled: boolean;
  qualityThreshold: number;
  qualityBonus: number;
  urgentEnabled: boolean;
  urgentBonus: number;
  onCallEnabled: boolean;
  onCallAmount: number;
  loyaltyEnabled: boolean;
  loyaltyThreshold: number;
  loyaltyBonus: number;
}

export interface FinancialConfig {
  tarif: TarifConfig;
  bonus: BonusConfig;
}

export interface UserEmolument {
  userId: string;
  userName: string;
  userRole: 'cardiologue' | 'medecin';
  period: string;
  hospitalId: string | null;
  hospitalName: string | null;
  ecgCount: number;
  urgentCount: number;
  baseAmount: number;
  bonusVolume: number;
  bonusUrgent: number;
  totalBonus: number;
  totalGross: number;
  status: 'pending' | 'validated' | 'paid';
  paidAt?: string | null;
  paymentMethod?: string | null;
  paymentRef?: string | null;
  notes?: string | null;
  // Champs optionnels (présents dans le store local, absents du backend)
  ecgNormal?: number;
  ecgComplex?: number;
  ecgCritical?: number;
  secondOpinions?: number;
  onCallCount?: number;
  avgTime?: number;
  qualityScore?: number;
  bonusQuality?: number;
  bonusOnCall?: number;
  bonusLoyalty?: number;
}

export interface MonthlyReport {
  period: string;
  ecgCount: number;
  totalRevenue: number;
  cardiologueEmoluments: number;
  medecinEmoluments: number;
  totalEmoluments: number;
  platformRevenue: number;
  validated: boolean;
}

export interface SpecialEmolument {
  id: string;
  userId: string;
  userName: string;
  userRole: 'cardiologue' | 'medecin';
  isActive: boolean;
  customRateType: 'percentage' | 'fixed_per_ecg' | 'hybrid';
  percentageOverride?: number | null;
  fixedAmountPerEcg?: number | null;
  basePercentage?: number | null;
  bonusPerEcg?: number | null;
  minEcgPerMonth?: number | null;
  validUntil?: string | null;
  reason: string;
  createdBy?: string | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// ─── Defaults (utilisés en mode offline / erreur) ────────────────────────────

export const DEFAULT_TARIF: TarifConfig = {
  ecgCostPatient: 15000,
  cardiologuePercent: 60,
  medecinPercent: 15,
  platformPercent: 25,
  secondOpinionCost: 10000,
};

export const DEFAULT_BONUS: BonusConfig = {
  enabled: true,
  volumeEnabled: true,
  volumeThreshold: 100,
  volumeBonus: 10,
  qualityEnabled: false,
  qualityThreshold: 95,
  qualityBonus: 5,
  urgentEnabled: true,
  urgentBonus: 1500,
  onCallEnabled: false,
  onCallAmount: 25000,
  loyaltyEnabled: false,
  loyaltyThreshold: 50,
  loyaltyBonus: 5,
};

// ─── Hook : Config ────────────────────────────────────────────────────────────

export function useFinancialConfig() {
  const [tarif, setTarif] = useState<TarifConfig>(DEFAULT_TARIF);
  const [bonus, setBonus] = useState<BonusConfig>(DEFAULT_BONUS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await api.get<FinancialConfig>('/financials/config');
      setTarif(config.tarif);
      setBonus(config.bonus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement de la config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const updateTarif = useCallback(async (input: Partial<TarifConfig>): Promise<TarifConfig> => {
    const updated = await api.put<TarifConfig>('/financials/config/tarif', input);
    setTarif(updated);
    return updated;
  }, []);

  const updateBonus = useCallback(async (input: Partial<BonusConfig>): Promise<BonusConfig> => {
    const updated = await api.put<BonusConfig>('/financials/config/bonus', input);
    setBonus(updated);
    return updated;
  }, []);

  return { tarif, bonus, loading, error, refetch: fetchConfig, updateTarif, updateBonus };
}

// ─── Hook : Emoluments ───────────────────────────────────────────────────────

export function useEmoluments(initialPeriod?: string) {
  const currentPeriod = initialPeriod ?? new Date().toISOString().slice(0, 7);
  const [period, setPeriod] = useState(currentPeriod);
  const [emoluments, setEmoluments] = useState<UserEmolument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmoluments = useCallback(async (p: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<UserEmolument[]>(`/financials/emoluments?period=${p}`);
      setEmoluments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement des émoluments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmoluments(period); }, [period, fetchEmoluments]);

  const updateStatus = useCallback(async (
    userId: string,
    status: UserEmolument['status'],
    paymentData?: { paymentMethod?: string; paymentRef?: string; notes?: string },
  ) => {
    await api.patch(`/financials/emoluments/${userId}/${period}`, { status, ...paymentData });
    setEmoluments(prev =>
      prev.map(e =>
        e.userId === userId
          ? {
              ...e,
              status,
              paidAt: status === 'paid' ? new Date().toISOString() : e.paidAt,
              paymentMethod: paymentData?.paymentMethod ?? e.paymentMethod,
              paymentRef: paymentData?.paymentRef ?? e.paymentRef,
              notes: paymentData?.notes ?? e.notes,
            }
          : e,
      ),
    );
  }, [period]);

  return { emoluments, period, setPeriod, loading, error, refetch: () => fetchEmoluments(period), updateStatus };
}

// ─── Hook : Rapport mensuel ───────────────────────────────────────────────────

export function useMonthlyReport(period: string) {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!period) return;
    setLoading(true);
    setError(null);
    api.get<MonthlyReport>(`/financials/reports/${period}`)
      .then(setReport)
      .catch(err => setError(err instanceof Error ? err.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, [period]);

  return { report, loading, error };
}

// ─── Hook : Émoluments spéciaux ───────────────────────────────────────────────

export function useSpecialEmoluments() {
  const [items, setItems] = useState<SpecialEmolument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<SpecialEmolument[]>('/financials/special-emoluments');
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const create = useCallback(async (input: Omit<SpecialEmolument, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await api.post<SpecialEmolument>('/financials/special-emoluments', input);
    setItems(prev => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, input: Partial<SpecialEmolument>) => {
    const updated = await api.patch<SpecialEmolument>(`/financials/special-emoluments/${id}`, input);
    setItems(prev => prev.map(i => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.delete(`/financials/special-emoluments/${id}`);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  return { items, loading, error, refetch: fetchItems, create, update, remove };
}
