import { useState } from 'react';
import { 
  ArrowLeft, 
  BarChart2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Activity,
  Clock,
  Users,
  Building2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useECGStore } from '@/stores/ecgStore';

interface StatisticsPageProps {
  onBack: () => void;
}

export function StatisticsPage({ onBack }: StatisticsPageProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { hospitals } = useECGStore();

  // Mock detailed stats
  const stats = {
    week: {
      received: 312,
      analyzed: 298,
      sent: 285,
      avgTime: 14,
      urgentRate: 8.5,
      satisfactionRate: 98,
    },
    month: {
      received: 1234,
      analyzed: 1200,
      sent: 1180,
      avgTime: 15,
      urgentRate: 7.2,
      satisfactionRate: 97,
    },
    year: {
      received: 14500,
      analyzed: 14200,
      sent: 14000,
      avgTime: 16,
      urgentRate: 6.8,
      satisfactionRate: 96,
    },
  };

  const currentStats = stats[period];

  // Mock daily data for chart
  const dailyData = [
    { day: 'Lun', received: 45, analyzed: 42 },
    { day: 'Mar', received: 52, analyzed: 50 },
    { day: 'Mer', received: 38, analyzed: 38 },
    { day: 'Jeu', received: 48, analyzed: 45 },
    { day: 'Ven', received: 55, analyzed: 52 },
    { day: 'Sam', received: 35, analyzed: 34 },
    { day: 'Dim', received: 28, analyzed: 28 },
  ];

  const maxValue = Math.max(...dailyData.map(d => Math.max(d.received, d.analyzed)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-600" />
              Statistiques
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border dark:border-gray-700 overflow-hidden">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    period === p 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
                </button>
              ))}
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 opacity-80" />
                <span className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </span>
              </div>
              <p className="text-4xl font-bold">{currentStats.received}</p>
              <p className="text-indigo-100 mt-1">ECG reçus</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 opacity-80" />
                <span className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2 min
                </span>
              </div>
              <p className="text-4xl font-bold">{currentStats.avgTime} min</p>
              <p className="text-green-100 mt-1">Temps moyen d'interprétation</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-4xl font-bold">{currentStats.satisfactionRate}%</p>
              <p className="text-purple-100 mt-1">Taux de satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Activité quotidienne
              </span>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  Reçus
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  Analysés
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-4">
              {dailyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 justify-center" style={{ height: '200px' }}>
                    <div 
                      className="w-5 bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-600"
                      style={{ height: `${(day.received / maxValue) * 100}%` }}
                      title={`${day.received} reçus`}
                    />
                    <div 
                      className="w-5 bg-green-500 rounded-t-md transition-all hover:bg-green-600"
                      style={{ height: `${(day.analyzed / maxValue) * 100}%` }}
                      title={`${day.analyzed} analysés`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* By Hospital */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                ECG par établissement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hospitals.map((hospital) => {
                  const percentage = Math.floor(Math.random() * 30) + 10;
                  return (
                    <div key={hospital.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {hospital.name}
                        </span>
                        <span className="text-sm text-gray-500">{percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Indicateurs de performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Taux d'analyse
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round((currentStats.analyzed / currentStats.received) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(currentStats.analyzed / currentStats.received) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Taux d'envoi
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round((currentStats.sent / currentStats.analyzed) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(currentStats.sent / currentStats.analyzed) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ECG urgents
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {currentStats.urgentRate}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${currentStats.urgentRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
