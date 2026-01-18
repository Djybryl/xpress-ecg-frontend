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
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from '@/stores/useAdminStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Statistics() {
  const { getStats, hospitals, users } = useAdminStore();
  const stats = getStats();
  const [period, setPeriod] = useState('month');

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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            Statistiques globales
          </h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de l'activité de la plateforme</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
    </div>
  );
}
