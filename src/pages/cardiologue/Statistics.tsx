import { useMemo } from 'react';
import {
  BarChart2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Activity,
  Target,
  Heart,
  Zap,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCardiologueStore } from '@/stores/useCardiologueStore';
import { useEconomyStore } from '@/stores/useEconomyStore';
import { useAuthContext } from '@/providers/AuthProvider';
import { format, parseISO, startOfMonth, isAfter, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

// Barre de progression CSS simple
function ProgressBar({ value, max, colorClass = 'bg-indigo-500' }: { value: number; max: number; colorClass?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={cn("h-2 rounded-full transition-all", colorClass)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Mini graphique en barres (7 barres = 7 jours ou 6 mois)
function MiniBarChart({ data, maxVal, colorClass = 'bg-indigo-400' }: { data: { label: string; value: number }[]; maxVal: number; colorClass?: string }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => {
        const pct = maxVal > 0 ? Math.max(4, Math.round((d.value / maxVal) * 100)) : 4;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn("w-full rounded-t transition-all", colorClass)}
              style={{ height: `${pct}%` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="text-[10px] text-gray-400 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Jauge semi-circulaire CSS
function ScoreGauge({ value, label, colorClass }: { value: number; label: string; colorClass: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("text-3xl font-bold", colorClass)}>{value}%</div>
      <div className="text-xs text-gray-500">{label}</div>
      <ProgressBar value={value} max={100} colorClass={colorClass.replace('text-', 'bg-')} />
    </div>
  );
}

export function CardiologueStatistics() {
  const { getMyCompleted, getMyInProgress, getAvailable, getCounts } = useCardiologueStore();
  const { getEmolumentsByUser } = useEconomyStore();
  const { user } = useAuthContext();

  const userEmail = user?.email ?? '';
  const userId = 'USR-001'; // Correspondance avec les données mockées

  const completedECGs = getMyCompleted(userEmail);
  const counts = getCounts(userEmail);
  const emoluments = getEmolumentsByUser(userId);

  // --- Données mensuelles (6 derniers mois) ---
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    return months.map(m => {
      const key = format(m, 'yyyy-MM');
      const emo = emoluments.find(e => e.period === key);
      return {
        label: format(m, 'MMM', { locale: fr }),
        value: emo?.ecgCount ?? (key === '2024-12' ? completedECGs.length : Math.floor(Math.random() * 80 + 40)),
        amount: emo?.totalGross ?? 0,
      };
    });
  }, [emoluments, completedECGs]);

  // --- Distribution par urgence ---
  const urgentCount  = completedECGs.filter(e => e.urgency === 'urgent').length;
  const normalCount  = completedECGs.filter(e => e.urgency === 'normal').length;
  const abnormalCount = completedECGs.filter(e => e.interpretation && !e.interpretation.isNormal).length;
  const normalECGCount = completedECGs.filter(e => e.interpretation?.isNormal).length;

  // --- Temps moyen (simulé car pas de vraie durée stockée) ---
  const avgMinutes = 4.2;
  const qualityScore = 97;
  const responseRate = 99;

  // --- Émoluments du mois en cours ---
  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const currentEmo = emoluments.find(e => e.period === currentMonthKey)
    ?? emoluments[0]; // fallback sur les données mockées

  const maxMonthly = Math.max(...monthlyData.map(d => d.value), 1);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-indigo-600" />
            Mes statistiques
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi de votre activité — {user?.name ?? 'Cardiologue'}
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          {format(new Date(), 'MMMM yyyy', { locale: fr })}
        </Badge>
      </div>

      {/* KPI en haut */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'ECG terminés', value: counts.myCompleted, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', delta: '+12 ce mois' },
          { label: 'En cours',     value: counts.myInProgress, icon: Activity,    color: 'text-indigo-600', bg: 'bg-indigo-50', delta: 'à traiter' },
          { label: 'Disponibles',  value: counts.available,    icon: Zap,          color: 'text-amber-600',  bg: 'bg-amber-50',  delta: 'dans le pool' },
          { label: 'ECG urgents',  value: counts.urgent,       icon: AlertCircle,  color: 'text-red-600',    bg: 'bg-red-50',    delta: 'prioritaires' },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <p className={cn("text-3xl font-bold mt-1", kpi.color)}>{kpi.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{kpi.delta}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-xl", kpi.bg)}>
                    <Icon className={cn("h-5 w-5", kpi.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité mensuelle */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Activité — 6 derniers mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBarChart data={monthlyData} maxVal={maxMonthly} colorClass="bg-indigo-400" />
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
              {monthlyData.slice(-3).map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-xs text-gray-400">{m.label}</p>
                  <p className="text-lg font-bold text-gray-800">{m.value}</p>
                  <p className="text-xs text-gray-400">ECG</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scores de qualité */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Scores de qualité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ScoreGauge value={qualityScore}   label="Qualité rapports"  colorClass="text-green-600" />
            <ScoreGauge value={responseRate}   label="Taux de réponse"   colorClass="text-indigo-600" />
            <ScoreGauge value={Math.round((normalECGCount / Math.max(completedECGs.length, 1)) * 100)} label="ECG normaux %" colorClass="text-sky-600" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des résultats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Distribution des résultats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'ECG normaux',    value: normalECGCount,  max: completedECGs.length, color: 'bg-green-500',  textColor: 'text-green-700' },
              { label: 'ECG anormaux',   value: abnormalCount,   max: completedECGs.length, color: 'bg-amber-500',  textColor: 'text-amber-700' },
              { label: 'Urgents traités',value: urgentCount,     max: completedECGs.length, color: 'bg-red-500',    textColor: 'text-red-700' },
            ].map(row => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{row.label}</span>
                  <span className={cn("font-semibold", row.textColor)}>{row.value}</span>
                </div>
                <ProgressBar value={row.value} max={row.max || 1} colorClass={row.color} />
              </div>
            ))}
            <div className="pt-3 border-t text-sm text-gray-500 flex justify-between">
              <span>Total analysés</span>
              <span className="font-bold text-gray-800">{completedECGs.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-500" />
              Performance & émoluments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Temps moyen', value: `${avgMinutes} min`, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Objectif mensuel', value: '120 ECG', icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={cn("p-3 rounded-xl", item.bg)}>
                    <Icon className={cn("h-5 w-5 mb-1", item.color)} />
                    <p className={cn("text-lg font-bold", item.color)}>{item.value}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                );
              })}
            </div>

            {currentEmo && (
              <div className="border rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Émoluments — {currentEmo.period}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Base</span>
                  <span className="font-semibold">{currentEmo.baseAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Bonus total</span>
                  <span className="font-semibold">+{currentEmo.totalBonus.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between items-center text-base font-bold border-t pt-2 text-indigo-700">
                  <span>Total brut</span>
                  <span>{currentEmo.totalGross.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    currentEmo.status === 'paid' ? 'border-green-500 text-green-700 bg-green-50' :
                    currentEmo.status === 'validated' ? 'border-indigo-500 text-indigo-700 bg-indigo-50' :
                    'border-amber-500 text-amber-700 bg-amber-50'
                  )}
                >
                  {currentEmo.status === 'paid' ? '✓ Payé' : currentEmo.status === 'validated' ? 'Validé' : 'En attente'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
