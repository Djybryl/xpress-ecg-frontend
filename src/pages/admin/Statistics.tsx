import { 
  BarChart3, 
  TrendingUp,
  Users,
  Building2,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from '@/stores/useAdminStore';
import { useEconomyStore } from '@/stores/useEconomyStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Statistics() {
  const { getStats, hospitals, users } = useAdminStore();
  const { emoluments, tarifConfig } = useEconomyStore();
  const stats = getStats();
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('global');

  // Données simulées pour les graphiques
  const weeklyData = [
    { day: 'Lun', count: 18 },
    { day: 'Mar', count: 24 },
    { day: 'Mer', count: 21 },
    { day: 'Jeu', count: 28 },
    { day: 'Ven', count: 32 },
    { day: 'Sam', count: 12 },
    { day: 'Dim', count: 8 },
  ];

  const monthlyGrowth = [
    { month: 'Oct', ecg: 420, users: 5 },
    { month: 'Nov', ecg: 485, users: 6 },
    { month: 'Dec', ecg: 523, users: 8 },
  ];

  const hospitalStats = hospitals.map(h => ({
    name: h.name,
    ecgCount: h.ecgCount,
    userCount: h.userCount,
    percentage: Math.round((h.ecgCount / stats.totalECG) * 100)
  })).sort((a, b) => b.ecgCount - a.ecgCount);

  const roleDistribution = [
    { role: 'Cardiologues', count: users.filter(u => u.role === 'cardiologue').length, color: 'bg-indigo-500' },
    { role: 'Médecins', count: users.filter(u => u.role === 'medecin').length, color: 'bg-emerald-500' },
    { role: 'Secrétaires', count: users.filter(u => u.role === 'secretaire').length, color: 'bg-amber-500' },
    { role: 'Admins', count: users.filter(u => u.role === 'admin').length, color: 'bg-slate-500' },
  ];

  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count));

  // Format FCFA
  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
  };

  // Calculs financiers
  const selectedPeriod = '2024-12';
  const periodEmoluments = emoluments.filter(e => e.period === selectedPeriod);
  const totalRevenue = periodEmoluments.reduce((sum, e) => sum + (e.ecgCount * tarifConfig.ecgCostPatient), 0);
  const totalEmoluments = periodEmoluments.reduce((sum, e) => sum + e.totalGross, 0);
  const platformRevenue = totalRevenue - totalEmoluments;

  return (
    <div className="space-y-3">
      {/* En-tête compact + pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Statistiques
          </h1>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700">
            <Activity className="h-3 w-3" />
            <span className="font-bold">{stats.totalECG}</span>
            <span className="opacity-75">ECG total</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-xs font-medium text-green-700">
            <Users className="h-3 w-3" />
            <span className="font-bold">{stats.totalUsers}</span>
            <span className="opacity-75">utilisateurs</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700">
            <Building2 className="h-3 w-3" />
            <span className="font-bold">{stats.totalHospitals}</span>
            <span className="opacity-75">établissements</span>
          </span>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Vue Globale
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financier
          </TabsTrigger>
        </TabsList>

        {/* Onglet Vue Globale */}
        <TabsContent value="global" className="space-y-6 mt-6">

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">ECG Total</p>
                <p className="text-3xl font-bold text-indigo-700">{stats.totalECG.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+12% vs mois dernier</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-indigo-200 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-indigo-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Ce mois</p>
                <p className="text-3xl font-bold text-green-700">{stats.ecgThisMonth}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+8% vs mois dernier</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Temps moyen</p>
                <p className="text-3xl font-bold text-blue-700">{stats.avgResponseTime}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDown className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">-5min vs semaine dernière</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">ECG Normaux</p>
                <p className="text-3xl font-bold text-emerald-700">{stats.normalECGPercent}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">des interprétations</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-emerald-200 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité de la semaine */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              ECG par jour (cette semaine)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyData.map((day, idx) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={cn(
                      "w-full rounded-t-lg transition-all",
                      idx === 4 ? "bg-indigo-500" : "bg-indigo-200"
                    )}
                    style={{ height: `${(day.count / maxWeeklyCount) * 150}px` }}
                  />
                  <span className="text-xs text-gray-500">{day.day}</span>
                  <span className="text-xs font-medium">{day.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">Total semaine</span>
              <span className="font-bold text-indigo-600">
                {weeklyData.reduce((acc, d) => acc + d.count, 0)} ECG
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par établissement */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              ECG par établissement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hospitalStats.map((hospital, idx) => (
                <div key={hospital.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        idx === 0 && "bg-indigo-500",
                        idx === 1 && "bg-emerald-500",
                        idx === 2 && "bg-amber-500",
                        idx === 3 && "bg-slate-500"
                      )} />
                      <span className="text-sm font-medium">{hospital.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {hospital.ecgCount.toLocaleString()} ({hospital.percentage}%)
                    </span>
                  </div>
                  <Progress 
                    value={hospital.percentage} 
                    className={cn(
                      "h-2",
                      idx === 0 && "[&>div]:bg-indigo-500",
                      idx === 1 && "[&>div]:bg-emerald-500",
                      idx === 2 && "[&>div]:bg-amber-500",
                      idx === 3 && "[&>div]:bg-slate-500"
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition des utilisateurs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Utilisateurs par rôle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roleDistribution.map(role => (
                <div key={role.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", role.color)} />
                    <span className="text-sm">{role.role}</span>
                  </div>
                  <Badge variant="secondary">{role.count}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total utilisateurs</span>
                <span className="font-bold">{stats.totalUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Croissance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Évolution mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyGrowth.map((month, idx) => (
                <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{month.month} 2024</p>
                    <p className="text-sm text-gray-500">{month.ecg} ECG</p>
                  </div>
                  {idx > 0 && (
                    <Badge className="bg-green-100 text-green-700">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +{Math.round(((month.ecg - monthlyGrowth[idx-1].ecg) / monthlyGrowth[idx-1].ecg) * 100)}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Indicateurs clés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Taux de complétion</span>
                  <span className="font-bold text-green-700">98.5%</span>
                </div>
                <Progress value={98.5} className="h-1 mt-2 [&>div]:bg-green-500" />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Satisfaction médecins</span>
                  <span className="font-bold text-blue-700">4.8/5</span>
                </div>
                <Progress value={96} className="h-1 mt-2 [&>div]:bg-blue-500" />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-700">ECG urgents traités &lt; 1h</span>
                  <span className="font-bold text-amber-700">94%</span>
                </div>
                <Progress value={94} className="h-1 mt-2 [&>div]:bg-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        {/* Onglet Financier */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          {/* KPIs financiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">CA du mois</p>
                    <p className="text-2xl font-bold text-green-700">{formatFCFA(totalRevenue)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+12% vs mois dernier</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-600 text-sm font-medium">Émoluments</p>
                    <p className="text-2xl font-bold text-indigo-700">{formatFCFA(totalEmoluments)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-indigo-600">{Math.round((totalEmoluments / totalRevenue) * 100)}% du CA</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-indigo-200 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-indigo-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Marge plateforme</p>
                    <p className="text-2xl font-bold text-slate-700">{formatFCFA(platformRevenue)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-slate-600">{tarifConfig.platformPercent}% du CA</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Répartition des revenus */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Répartition des revenus ({selectedPeriod})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <span className="w-3 h-3 bg-indigo-500 rounded"></span>
                      👨‍⚕️ Cardiologues ({tarifConfig.cardiologuePercent}%)
                    </span>
                    <span className="text-sm font-bold">{formatFCFA(totalRevenue * tarifConfig.cardiologuePercent / 100)}</span>
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
                    <span className="text-sm font-bold">{formatFCFA(totalRevenue * tarifConfig.medecinPercent / 100)}</span>
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
                    <span className="text-sm font-bold">{formatFCFA(totalRevenue * tarifConfig.platformPercent / 100)}</span>
                  </div>
                  <Progress 
                    value={tarifConfig.platformPercent} 
                    className="h-3 [&>div]:bg-slate-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Émoluments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  Top Cardiologues (émoluments)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {periodEmoluments
                    .filter(e => e.userRole === 'cardiologue')
                    .sort((a, b) => b.totalGross - a.totalGross)
                    .slice(0, 5)
                    .map((emol, idx) => (
                      <div key={emol.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}</span>
                          <span className="text-sm font-medium">{emol.userName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600">{formatFCFA(emol.totalGross)}</p>
                          <p className="text-xs text-gray-500">{emol.ecgCount} ECG</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Revenus par établissement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hospitals.slice(0, 5).map((hospital, idx) => {
                    const hospitalRevenue = (hospital.ecgCount * tarifConfig.ecgCostPatient);
                    const percent = (hospitalRevenue / totalRevenue) * 100;
                    
                    return (
                      <div key={hospital.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{hospital.name}</span>
                          <span className="text-sm text-gray-600">{formatFCFA(hospitalRevenue)}</span>
                        </div>
                        <Progress 
                          value={percent} 
                          className={cn(
                            "h-2",
                            idx === 0 && "[&>div]:bg-indigo-500",
                            idx === 1 && "[&>div]:bg-emerald-500",
                            idx === 2 && "[&>div]:bg-amber-500",
                            idx >= 3 && "[&>div]:bg-slate-400"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Indicateurs économiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Indicateurs économiques clés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Coût moyen ECG</span>
                    <span className="font-bold text-blue-700">{formatFCFA(tarifConfig.ecgCostPatient)}</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-indigo-700">Émolument moyen cardio</span>
                    <span className="font-bold text-indigo-700">
                      {formatFCFA((tarifConfig.ecgCostPatient * tarifConfig.cardiologuePercent) / 100)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-700">Émolument moyen médecin</span>
                    <span className="font-bold text-emerald-700">
                      {formatFCFA((tarifConfig.ecgCostPatient * tarifConfig.medecinPercent) / 100)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
