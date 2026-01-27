import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp,
  Download,
  DollarSign,
  Building2,
  Users,
  Trophy,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEconomyStore } from '@/stores/useEconomyStore';
import { useAdminStore } from '@/stores/useAdminStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function FinancialReports() {
  const { emoluments, tarifConfig, getMonthlyReport } = useEconomyStore();
  const { hospitals } = useAdminStore();
  const { toast } = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState('2024-12');
  const [selectedRole, setSelectedRole] = useState<'all' | 'cardiologue' | 'medecin'>('all');
  const [selectedHospital, setSelectedHospital] = useState<string>('all');

  // Format FCFA
  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
  };

  // Calculs pour la période
  const periodData = useMemo(() => {
    let filtered = emoluments.filter(e => e.period === selectedPeriod);
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(e => e.userRole === selectedRole);
    }
    
    if (selectedHospital !== 'all') {
      filtered = filtered.filter(e => e.hospitalId === selectedHospital);
    }

    const totalRevenue = filtered.reduce((sum, e) => sum + (e.ecgCount * tarifConfig.ecgCostPatient), 0);
    const cardiologueEmoluments = filtered.filter(e => e.userRole === 'cardiologue').reduce((sum, e) => sum + e.totalGross, 0);
    const medecinEmoluments = filtered.filter(e => e.userRole === 'medecin').reduce((sum, e) => sum + e.totalGross, 0);
    const totalEmoluments = cardiologueEmoluments + medecinEmoluments;
    const totalBonus = filtered.reduce((sum, e) => sum + e.totalBonus, 0);
    const platformRevenue = totalRevenue - totalEmoluments;
    const ecgCount = filtered.reduce((sum, e) => sum + e.ecgCount, 0);

    return {
      totalRevenue,
      cardiologueEmoluments,
      medecinEmoluments,
      totalEmoluments,
      totalBonus,
      platformRevenue,
      ecgCount,
      filtered,
    };
  }, [emoluments, selectedPeriod, selectedRole, selectedHospital, tarifConfig]);

  // Top performers
  const topPerformers = useMemo(() => {
    return periodData.filtered
      .sort((a, b) => b.totalGross - a.totalGross)
      .slice(0, 5);
  }, [periodData.filtered]);

  // Par établissement
  const byHospital = useMemo(() => {
    const map = new Map<string, { name: string; ecgCount: number; revenue: number }>();
    
    periodData.filtered.forEach(e => {
      const existing = map.get(e.hospitalId) || { name: e.hospitalName, ecgCount: 0, revenue: 0 };
      existing.ecgCount += e.ecgCount;
      existing.revenue += e.ecgCount * tarifConfig.ecgCostPatient;
      map.set(e.hospitalId, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [periodData.filtered, tarifConfig]);

  // Données simulées pour graphique évolution 6 mois
  const evolutionData = [
    { month: 'Juil', revenue: 4200000, emoluments: 3150000, platform: 1050000 },
    { month: 'Août', revenue: 4500000, emoluments: 3375000, platform: 1125000 },
    { month: 'Sept', revenue: 4800000, emoluments: 3600000, platform: 1200000 },
    { month: 'Oct', revenue: 5100000, emoluments: 3825000, platform: 1275000 },
    { month: 'Nov', revenue: 4800000, emoluments: 3600000, platform: 1200000 },
    { month: 'Déc', revenue: periodData.totalRevenue, emoluments: periodData.totalEmoluments, platform: periodData.platformRevenue },
  ];

  const maxRevenue = Math.max(...evolutionData.map(d => d.revenue));

  // Export
  const handleExport = (format: 'excel' | 'pdf') => {
    toast({
      title: `📥 Export ${format.toUpperCase()}`,
      description: `Génération du rapport en cours...`,
    });
    // Simulation export
    setTimeout(() => {
      toast({
        title: "✅ Rapport généré",
        description: `Le fichier ${format.toUpperCase()} a été téléchargé.`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            Rapports Financiers
          </h1>
          <p className="text-gray-500 mt-1">Vue synthétique du chiffre d'affaires et des marges</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg border">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-12">Décembre 2024</SelectItem>
            <SelectItem value="2024-11">Novembre 2024</SelectItem>
            <SelectItem value="2024-10">Octobre 2024</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
          <SelectTrigger className="w-[180px]">
            <Users className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="cardiologue">Cardiologues</SelectItem>
            <SelectItem value="medecin">Médecins</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedHospital} onValueChange={setSelectedHospital}>
          <SelectTrigger className="w-[180px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Établissement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous établ.</SelectItem>
            {hospitals.map(h => (
              <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Revenus & Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Revenus & Distribution ({selectedPeriod})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chiffre d'affaires */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium mb-1">CHIFFRE D'AFFAIRES</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatFCFA(periodData.totalRevenue)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {periodData.ecgCount} ECG × {formatFCFA(tarifConfig.ecgCostPatient)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <Badge className="bg-green-600 text-white">
                  +12% vs Nov
                </Badge>
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">DISTRIBUTION (sans bonus)</p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded"></span>
                    👨‍⚕️ Cardiologues ({tarifConfig.cardiologuePercent}%)
                  </span>
                  <span className="text-sm font-bold">{formatFCFA(periodData.totalRevenue * tarifConfig.cardiologuePercent / 100)}</span>
                </div>
                <Progress 
                  value={tarifConfig.cardiologuePercent} 
                  className="h-3 [&>div]:bg-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded"></span>
                    🩺 Médecins ({tarifConfig.medecinPercent}%)
                  </span>
                  <span className="text-sm font-bold">{formatFCFA(periodData.totalRevenue * tarifConfig.medecinPercent / 100)}</span>
                </div>
                <Progress 
                  value={tarifConfig.medecinPercent} 
                  className="h-3 [&>div]:bg-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-500 rounded"></span>
                    🏢 Plateforme ({tarifConfig.platformPercent}%)
                  </span>
                  <span className="text-sm font-bold">{formatFCFA(periodData.totalRevenue * tarifConfig.platformPercent / 100)}</span>
                </div>
                <Progress 
                  value={tarifConfig.platformPercent} 
                  className="h-3 [&>div]:bg-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Bonus distribués */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">🏆 BONUS DISTRIBUÉS</p>
                <p className="text-xl font-bold text-amber-700 mt-1">
                  {formatFCFA(periodData.totalBonus)}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Volume, qualité, urgents, astreintes
                </p>
              </div>
            </div>
          </div>

          {/* Totaux */}
          <div className="pt-4 border-t-2 space-y-2">
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold">💰 Émoluments totaux :</span>
              <span className="font-bold text-indigo-600">{formatFCFA(periodData.totalEmoluments)}</span>
              <Badge variant="secondary">{Math.round((periodData.totalEmoluments / periodData.totalRevenue) * 100)}%</Badge>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold">🏢 Revenus nets plateforme :</span>
              <span className="font-bold text-slate-600">{formatFCFA(periodData.platformRevenue)}</span>
              <Badge variant="secondary">{Math.round((periodData.platformRevenue / periodData.totalRevenue) * 100)}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Évolution 6 mois */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Évolution 6 derniers mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-2 h-64">
              {evolutionData.map((month, idx) => {
                const height = (month.revenue / maxRevenue) * 100;
                const platformHeight = (month.platform / month.revenue) * height;
                const emolumentsHeight = (month.emoluments / month.revenue) * height;
                
                return (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center relative" style={{ height: `${height}%` }}>
                      {/* Barre empilée */}
                      <div className="w-full flex flex-col-reverse">
                        <div 
                          className="w-full bg-slate-400 rounded-t"
                          style={{ height: `${platformHeight}%` }}
                        />
                        <div 
                          className="w-full bg-indigo-400"
                          style={{ height: `${emolumentsHeight * 0.6}%` }}
                        />
                        <div 
                          className="w-full bg-emerald-400 rounded-t"
                          style={{ height: `${emolumentsHeight * 0.4}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{month.month}</span>
                    <span className="text-xs font-bold">
                      {(month.revenue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-400 rounded"></span>
                <span>Médecins</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-indigo-400 rounded"></span>
                <span>Cardiologues</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-400 rounded"></span>
                <span>Plateforme</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers & Par établissement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Top Performers ({selectedPeriod})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Aucune donnée</p>
              ) : (
                topPerformers.map((performer, idx) => (
                  <div key={performer.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{performer.userName}</p>
                      <p className="text-xs text-gray-500">
                        {performer.ecgCount} ECG {performer.totalBonus > 0 && '+ bonus'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{formatFCFA(performer.totalGross)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Par établissement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Par Établissement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byHospital.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Aucune donnée</p>
              ) : (
                byHospital.map((hospital, idx) => {
                  const percent = (hospital.revenue / periodData.totalRevenue) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            idx === 0 && "bg-indigo-500",
                            idx === 1 && "bg-emerald-500",
                            idx === 2 && "bg-amber-500",
                            idx >= 3 && "bg-slate-500"
                          )}></span>
                          <span className="text-sm font-medium">{hospital.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {hospital.ecgCount} ECG • {formatFCFA(hospital.revenue)} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress 
                        value={percent} 
                        className={cn(
                          "h-2",
                          idx === 0 && "[&>div]:bg-indigo-500",
                          idx === 1 && "[&>div]:bg-emerald-500",
                          idx === 2 && "[&>div]:bg-amber-500",
                          idx >= 3 && "[&>div]:bg-slate-500"
                        )}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
