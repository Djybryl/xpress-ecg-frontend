import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface TarifConfig {
  ecgCostPatient: number; // Coût ECG pour le patient (FCFA)
  cardiologuePercent: number; // % pour cardiologue
  medecinPercent: number; // % pour médecin référent
  platformPercent: number; // % pour plateforme (auto-calculé)
  secondOpinionCost: number; // Émolument fixe pour second avis (FCFA)
}

export interface BonusConfig {
  enabled: boolean;
  volumeEnabled: boolean;
  volumeThreshold: number; // Seuil nb ECG/mois
  volumeBonus: number; // % bonus
  qualityEnabled: boolean;
  qualityThreshold: number; // % qualité minimum
  qualityBonus: number; // % bonus
  urgentEnabled: boolean;
  urgentBonus: number; // FCFA par ECG urgent < 1h
  onCallEnabled: boolean;
  onCallAmount: number; // FCFA par garde
  loyaltyEnabled: boolean; // Pour médecins référents
  loyaltyThreshold: number; // Nb ECG envoyés/mois
  loyaltyBonus: number; // % bonus
}

export interface HospitalTarif {
  hospitalId: string;
  hospitalName: string;
  customCost: number; // Coût personnalisé (FCFA)
  enabled: boolean;
}

export interface UserEmolument {
  userId: string;
  userName: string;
  userRole: 'cardiologue' | 'medecin';
  period: string; // YYYY-MM
  hospitalId: string;
  hospitalName: string;
  
  // Activité
  ecgCount: number;
  ecgNormal: number;
  ecgComplex: number;
  ecgCritical: number;
  secondOpinions: number;
  urgentCount: number; // ECG < 1h
  onCallCount: number; // Nb gardes
  
  // Performance
  avgTime: number; // minutes
  qualityScore: number; // %
  
  // Calculs
  baseAmount: number; // Émolument de base (FCFA)
  bonusVolume: number;
  bonusQuality: number;
  bonusUrgent: number;
  bonusOnCall: number;
  bonusLoyalty: number;
  totalBonus: number;
  totalGross: number; // Total brut (FCFA)
  
  // Statut paiement
  status: 'pending' | 'validated' | 'paid';
  paidAt?: string;
  paymentMethod?: string;
  paymentRef?: string;
  notes?: string;
}

export interface MonthlyReport {
  period: string; // YYYY-MM
  totalRevenue: number; // CA total (FCFA)
  ecgCount: number;
  cardiologueEmoluments: number;
  medecinEmoluments: number;
  totalEmoluments: number;
  totalBonus: number;
  platformRevenue: number;
  validated: boolean;
  validatedAt?: string;
  validatedBy?: string;
}

export interface ConfigHistory {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  changes: string;
  oldConfig: Partial<TarifConfig>;
  newConfig: Partial<TarifConfig>;
}

// Émoluments spéciaux (tarifs individuels personnalisés)
export interface SpecialEmolument {
  id: string;
  userId: string;
  userName: string;
  userRole: 'cardiologue' | 'medecin';
  isActive: boolean;
  
  // Type de tarif spécial
  customRate: {
    type: 'percentage' | 'fixed_per_ecg' | 'hybrid';
    
    // Si type = percentage (ex: 75% au lieu de 60% standard)
    percentageOverride?: number;
    
    // Si type = fixed_per_ecg (ex: 12,000 FCFA par ECG quel que soit le coût patient)
    fixedAmountPerEcg?: number;
    
    // Si type = hybrid (base % + bonus fixe par ECG)
    basePercentage?: number;
    bonusPerEcg?: number;
  };
  
  // Conditions d'application (optionnel)
  conditions?: {
    minEcgPerMonth?: number; // Actif seulement si > X ECG/mois
    specificHospitals?: string[]; // Appliquer uniquement pour certains hôpitaux
    validUntil?: string; // Date d'expiration ISO
  };
  
  // Traçabilité
  reason: string; // "Expert senior", "Partenariat VIP", "Compensation", etc.
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
}

interface EconomyStore {
  // Configuration
  tarifConfig: TarifConfig;
  bonusConfig: BonusConfig;
  hospitalTarifs: HospitalTarif[];
  configHistory: ConfigHistory[];
  
  // Émoluments
  emoluments: UserEmolument[];
  monthlyReports: MonthlyReport[];
  
  // Actions - Configuration
  updateTarifConfig: (config: Partial<TarifConfig>, userId: string, userName: string) => void;
  updateBonusConfig: (config: Partial<BonusConfig>) => void;
  setHospitalTarif: (hospitalId: string, hospitalName: string, cost: number, enabled: boolean) => void;
  removeHospitalTarif: (hospitalId: string) => void;
  
  // Actions - Calculs
  calculateEmolument: (userId: string, userRole: 'cardiologue' | 'medecin', period: string, activityData: Partial<UserEmolument>) => UserEmolument;
  getEmolumentsByPeriod: (period: string) => UserEmolument[];
  getEmolumentsByUser: (userId: string) => UserEmolument[];
  updateEmolumentStatus: (userId: string, period: string, status: UserEmolument['status'], paymentData?: Partial<UserEmolument>) => void;
  
  // Actions - Rapports
  generateMonthlyReport: (period: string) => MonthlyReport;
  getMonthlyReport: (period: string) => MonthlyReport | undefined;
  validateMonth: (period: string, userId: string, userName: string) => void;
  
  // Utilitaires
  getHospitalCost: (hospitalId: string) => number;
  resetToDefaults: () => void;
  
  // Émoluments spéciaux
  specialEmoluments: SpecialEmolument[];
  addSpecialEmolument: (emolument: Omit<SpecialEmolument, 'id' | 'createdAt'>) => void;
  updateSpecialEmolument: (id: string, updates: Partial<SpecialEmolument>) => void;
  deleteSpecialEmolument: (id: string) => void;
  getSpecialEmolumentForUser: (userId: string, hospitalId?: string) => SpecialEmolument | undefined;
}

// Configuration par défaut
const defaultTarifConfig: TarifConfig = {
  ecgCostPatient: 15000, // 15.000 FCFA
  cardiologuePercent: 60,
  medecinPercent: 15,
  platformPercent: 25,
  secondOpinionCost: 10000, // 10.000 FCFA pour second avis
};

const defaultBonusConfig: BonusConfig = {
  enabled: true,
  volumeEnabled: true,
  volumeThreshold: 100,
  volumeBonus: 10, // +10%
  qualityEnabled: true,
  qualityThreshold: 95,
  qualityBonus: 5, // +5%
  urgentEnabled: true,
  urgentBonus: 1500, // 1.500 FCFA par ECG urgent
  onCallEnabled: true,
  onCallAmount: 25000, // 25.000 FCFA par garde
  loyaltyEnabled: true,
  loyaltyThreshold: 50,
  loyaltyBonus: 5, // +5%
};

// Données simulées pour émoluments (Décembre 2024)
const mockEmoluments: UserEmolument[] = [
  {
    userId: 'USR-001',
    userName: 'Dr. Sophie Bernard',
    userRole: 'cardiologue',
    period: '2024-12',
    hospitalId: 'HOP-001',
    hospitalName: 'CHU de Yaoundé',
    ecgCount: 142,
    ecgNormal: 95,
    ecgComplex: 35,
    ecgCritical: 12,
    secondOpinions: 0,
    urgentCount: 18,
    onCallCount: 1,
    avgTime: 4.2,
    qualityScore: 98,
    baseAmount: 1278000, // 142 × 9000 FCFA
    bonusVolume: 127800, // +10%
    bonusQuality: 63900, // +5%
    bonusUrgent: 27000, // 18 × 1500
    bonusOnCall: 25000,
    bonusLoyalty: 0,
    totalBonus: 243700,
    totalGross: 1521700,
    status: 'paid',
    paidAt: '2024-12-31T10:00:00',
    paymentMethod: 'MTN Mobile Money',
    paymentRef: 'PAY-DEC-2024-001',
  },
  {
    userId: 'USR-005',
    userName: 'Dr. François Dubois',
    userRole: 'cardiologue',
    period: '2024-12',
    hospitalId: 'HOP-002',
    hospitalName: 'Hôpital Central',
    ecgCount: 128,
    ecgNormal: 88,
    ecgComplex: 30,
    ecgCritical: 10,
    secondOpinions: 3,
    urgentCount: 15,
    onCallCount: 2,
    avgTime: 5.1,
    qualityScore: 96,
    baseAmount: 1182000, // (128 × 9000) + (3 × 10000)
    bonusVolume: 118200,
    bonusQuality: 59100,
    bonusUrgent: 22500,
    bonusOnCall: 50000,
    bonusLoyalty: 0,
    totalBonus: 249800,
    totalGross: 1431800,
    status: 'validated',
  },
  {
    userId: 'USR-002',
    userName: 'Dr. Jean Martin',
    userRole: 'medecin',
    period: '2024-12',
    hospitalId: 'HOP-002',
    hospitalName: 'Hôpital Central',
    ecgCount: 65,
    ecgNormal: 65,
    ecgComplex: 0,
    ecgCritical: 0,
    secondOpinions: 0,
    urgentCount: 0,
    onCallCount: 0,
    avgTime: 0,
    qualityScore: 100,
    baseAmount: 146250, // 65 × 2250 FCFA (15% de 15000)
    bonusVolume: 0,
    bonusQuality: 0,
    bonusUrgent: 0,
    bonusOnCall: 0,
    bonusLoyalty: 7312.5, // +5% car > 50 ECG
    totalBonus: 7312.5,
    totalGross: 153562.5,
    status: 'pending',
  },
  {
    userId: 'USR-006',
    userName: 'Dr. Sophie Blanc',
    userRole: 'medecin',
    period: '2024-12',
    hospitalId: 'HOP-003',
    hospitalName: 'Clinique des Princes',
    ecgCount: 52,
    ecgNormal: 52,
    ecgComplex: 0,
    ecgCritical: 0,
    secondOpinions: 0,
    urgentCount: 0,
    onCallCount: 0,
    avgTime: 0,
    qualityScore: 100,
    baseAmount: 117000, // 52 × 2250 FCFA
    bonusVolume: 0,
    bonusQuality: 0,
    bonusUrgent: 0,
    bonusOnCall: 0,
    bonusLoyalty: 5850, // +5%
    totalBonus: 5850,
    totalGross: 122850,
    status: 'pending',
  },
];

export const useEconomyStore = create<EconomyStore>()(
  persist(
    (set, get) => ({
      // État initial
      tarifConfig: defaultTarifConfig,
      bonusConfig: defaultBonusConfig,
      hospitalTarifs: [],
      configHistory: [],
      emoluments: mockEmoluments,
      monthlyReports: [],
      specialEmoluments: [],

      // Mise à jour configuration tarifaire
      updateTarifConfig: (config, userId, userName) => {
        const oldConfig = get().tarifConfig;
        const newConfig = { ...oldConfig, ...config };
        
        // Auto-calcul du pourcentage plateforme
        if (config.cardiologuePercent !== undefined || config.medecinPercent !== undefined) {
          newConfig.platformPercent = 100 - newConfig.cardiologuePercent - newConfig.medecinPercent;
        }

        // Historique
        const history: ConfigHistory = {
          id: `HIST-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId,
          userName,
          changes: Object.keys(config).map(key => {
            const k = key as keyof TarifConfig;
            return `${k}: ${oldConfig[k]} → ${newConfig[k]}`;
          }).join(', '),
          oldConfig,
          newConfig,
        };

        set(state => ({
          tarifConfig: newConfig,
          configHistory: [history, ...state.configHistory],
        }));
      },

      updateBonusConfig: (config) => {
        set(state => ({
          bonusConfig: { ...state.bonusConfig, ...config },
        }));
      },

      setHospitalTarif: (hospitalId, hospitalName, cost, enabled) => {
        set(state => {
          const existing = state.hospitalTarifs.find(h => h.hospitalId === hospitalId);
          if (existing) {
            return {
              hospitalTarifs: state.hospitalTarifs.map(h =>
                h.hospitalId === hospitalId
                  ? { ...h, customCost: cost, enabled }
                  : h
              ),
            };
          } else {
            return {
              hospitalTarifs: [...state.hospitalTarifs, { hospitalId, hospitalName, customCost: cost, enabled }],
            };
          }
        });
      },

      removeHospitalTarif: (hospitalId) => {
        set(state => ({
          hospitalTarifs: state.hospitalTarifs.filter(h => h.hospitalId !== hospitalId),
        }));
      },

      // Calcul des émoluments
      calculateEmolument: (userId, userRole, period, activityData) => {
        const config = get().tarifConfig;
        const bonus = get().bonusConfig;
        const hospitalCost = get().getHospitalCost(activityData.hospitalId || '');

        const ecgCount = activityData.ecgCount || 0;
        const secondOpinions = activityData.secondOpinions || 0;
        const urgentCount = activityData.urgentCount || 0;
        const onCallCount = activityData.onCallCount || 0;
        const qualityScore = activityData.qualityScore || 0;

        let baseAmount = 0;

        // ✨ VÉRIFIER ÉMOLUMENT SPÉCIAL
        const specialEmolument = get().getSpecialEmolumentForUser(userId, activityData.hospitalId);
        
        if (specialEmolument) {
          // Vérifier condition minEcgPerMonth
          const meetsMinimum = !specialEmolument.conditions?.minEcgPerMonth || 
                                ecgCount >= specialEmolument.conditions.minEcgPerMonth;
          
          if (meetsMinimum) {
            // Appliquer tarif spécial
            const { customRate } = specialEmolument;
            
            if (customRate.type === 'percentage') {
              const perEcgAmount = (hospitalCost * (customRate.percentageOverride || 0)) / 100;
              baseAmount = (ecgCount * perEcgAmount) + (secondOpinions * config.secondOpinionCost);
            } else if (customRate.type === 'fixed_per_ecg') {
              baseAmount = (ecgCount * (customRate.fixedAmountPerEcg || 0)) + (secondOpinions * config.secondOpinionCost);
            } else if (customRate.type === 'hybrid') {
              const percentAmount = (hospitalCost * (customRate.basePercentage || 0)) / 100;
              const fixedBonus = customRate.bonusPerEcg || 0;
              baseAmount = (ecgCount * (percentAmount + fixedBonus)) + (secondOpinions * config.secondOpinionCost);
            }
          } else {
            // Ne remplit pas le minimum → calcul standard
            if (userRole === 'cardiologue') {
              const perEcgAmount = (hospitalCost * config.cardiologuePercent) / 100;
              baseAmount = (ecgCount * perEcgAmount) + (secondOpinions * config.secondOpinionCost);
            } else {
              const perEcgAmount = (hospitalCost * config.medecinPercent) / 100;
              baseAmount = ecgCount * perEcgAmount;
            }
          }
        } else {
          // Calcul standard (pas d'émolument spécial)
          if (userRole === 'cardiologue') {
            // Cardiologue : % du coût ECG × nb ECG + second avis
            const perEcgAmount = (hospitalCost * config.cardiologuePercent) / 100;
            baseAmount = (ecgCount * perEcgAmount) + (secondOpinions * config.secondOpinionCost);
          } else {
            // Médecin référent : % du coût ECG × nb ECG
            const perEcgAmount = (hospitalCost * config.medecinPercent) / 100;
            baseAmount = ecgCount * perEcgAmount;
          }
        }

        // Calcul bonus
        let bonusVolume = 0;
        let bonusQuality = 0;
        let bonusUrgent = 0;
        let bonusOnCall = 0;
        let bonusLoyalty = 0;

        if (bonus.enabled) {
          if (userRole === 'cardiologue') {
            if (bonus.volumeEnabled && ecgCount >= bonus.volumeThreshold) {
              bonusVolume = (baseAmount * bonus.volumeBonus) / 100;
            }
            if (bonus.qualityEnabled && qualityScore >= bonus.qualityThreshold) {
              bonusQuality = (baseAmount * bonus.qualityBonus) / 100;
            }
            if (bonus.urgentEnabled) {
              bonusUrgent = urgentCount * bonus.urgentBonus;
            }
            if (bonus.onCallEnabled) {
              bonusOnCall = onCallCount * bonus.onCallAmount;
            }
          } else {
            // Médecin référent
            if (bonus.loyaltyEnabled && ecgCount >= bonus.loyaltyThreshold) {
              bonusLoyalty = (baseAmount * bonus.loyaltyBonus) / 100;
            }
          }
        }

        const totalBonus = bonusVolume + bonusQuality + bonusUrgent + bonusOnCall + bonusLoyalty;
        const totalGross = baseAmount + totalBonus;

        return {
          userId,
          userName: activityData.userName || '',
          userRole,
          period,
          hospitalId: activityData.hospitalId || '',
          hospitalName: activityData.hospitalName || '',
          ecgCount,
          ecgNormal: activityData.ecgNormal || 0,
          ecgComplex: activityData.ecgComplex || 0,
          ecgCritical: activityData.ecgCritical || 0,
          secondOpinions,
          urgentCount,
          onCallCount,
          avgTime: activityData.avgTime || 0,
          qualityScore,
          baseAmount,
          bonusVolume,
          bonusQuality,
          bonusUrgent,
          bonusOnCall,
          bonusLoyalty,
          totalBonus,
          totalGross,
          status: 'pending' as const,
        };
      },

      getEmolumentsByPeriod: (period) => {
        return get().emoluments.filter(e => e.period === period);
      },

      getEmolumentsByUser: (userId) => {
        return get().emoluments.filter(e => e.userId === userId);
      },

      updateEmolumentStatus: (userId, period, status, paymentData) => {
        set(state => ({
          emoluments: state.emoluments.map(e =>
            e.userId === userId && e.period === period
              ? { ...e, status, ...paymentData }
              : e
          ),
        }));
      },

      // Génération rapport mensuel
      generateMonthlyReport: (period) => {
        const emoluments = get().getEmolumentsByPeriod(period);
        const config = get().tarifConfig;

        const totalRevenue = emoluments.reduce((sum, e) => {
          const cost = get().getHospitalCost(e.hospitalId);
          return sum + (e.ecgCount * cost);
        }, 0);

        const cardiologueEmoluments = emoluments
          .filter(e => e.userRole === 'cardiologue')
          .reduce((sum, e) => sum + e.totalGross, 0);

        const medecinEmoluments = emoluments
          .filter(e => e.userRole === 'medecin')
          .reduce((sum, e) => sum + e.totalGross, 0);

        const totalEmoluments = cardiologueEmoluments + medecinEmoluments;
        const totalBonus = emoluments.reduce((sum, e) => sum + e.totalBonus, 0);
        const platformRevenue = totalRevenue - totalEmoluments;
        const ecgCount = emoluments.reduce((sum, e) => sum + e.ecgCount, 0);

        const report: MonthlyReport = {
          period,
          totalRevenue,
          ecgCount,
          cardiologueEmoluments,
          medecinEmoluments,
          totalEmoluments,
          totalBonus,
          platformRevenue,
          validated: false,
        };

        set(state => ({
          monthlyReports: [...state.monthlyReports.filter(r => r.period !== period), report],
        }));

        return report;
      },

      getMonthlyReport: (period) => {
        return get().monthlyReports.find(r => r.period === period);
      },

      validateMonth: (period, userId, userName) => {
        set(state => ({
          monthlyReports: state.monthlyReports.map(r =>
            r.period === period
              ? { ...r, validated: true, validatedAt: new Date().toISOString(), validatedBy: userName }
              : r
          ),
          emoluments: state.emoluments.map(e =>
            e.period === period && e.status === 'pending'
              ? { ...e, status: 'validated' as const }
              : e
          ),
        }));
      },

      // Utilitaires
      getHospitalCost: (hospitalId) => {
        const customTarif = get().hospitalTarifs.find(h => h.hospitalId === hospitalId && h.enabled);
        return customTarif ? customTarif.customCost : get().tarifConfig.ecgCostPatient;
      },

      // Gestion des émoluments spéciaux
      addSpecialEmolument: (emolument) => {
        const newEmolument: SpecialEmolument = {
          ...emolument,
          id: `SPEC-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          specialEmoluments: [...state.specialEmoluments, newEmolument],
        }));
      },

      updateSpecialEmolument: (id, updates) => {
        set(state => ({
          specialEmoluments: state.specialEmoluments.map(se =>
            se.id === id
              ? { ...se, ...updates, updatedAt: new Date().toISOString() }
              : se
          ),
        }));
      },

      deleteSpecialEmolument: (id) => {
        set(state => ({
          specialEmoluments: state.specialEmoluments.filter(se => se.id !== id),
        }));
      },

      getSpecialEmolumentForUser: (userId, hospitalId) => {
        const specials = get().specialEmoluments.filter(se => 
          se.userId === userId && 
          se.isActive &&
          // Vérifier date d'expiration
          (!se.conditions?.validUntil || new Date(se.conditions.validUntil) > new Date()) &&
          // Vérifier hôpital spécifique
          (!se.conditions?.specificHospitals || !hospitalId || se.conditions.specificHospitals.includes(hospitalId))
        );
        
        // Retourner le premier trouvé (priorité au plus récent)
        return specials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      },

      resetToDefaults: () => {
        set({
          tarifConfig: defaultTarifConfig,
          bonusConfig: defaultBonusConfig,
          hospitalTarifs: [],
        });
      },
    }),
    {
      name: 'xpress-ecg-economy-storage',
    }
  )
);
