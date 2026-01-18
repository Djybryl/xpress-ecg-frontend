import { BarChart2, TrendingUp, TrendingDown, Clock, Activity, CheckCircle, Send } from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';
import { useECGStore } from '@/stores/ecgStore';

interface StatisticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatisticsDrawer({ isOpen, onClose }: StatisticsDrawerProps) {
  const { getStats, records, hospitals } = useECGStore();

  const todayStats = getStats('today');
  const weekStats = getStats('week');
  // const monthStats = getStats('month'); // Available for future use

  // Calculate trends (mock data)
  const trends = {
    received: { value: 12, positive: true },
    analyzed: { value: 8, positive: true },
    avgTime: { value: 3, positive: false }, // negative means faster = good
  };

  // ECG by priority
  const byPriority = {
    normal: records.filter(r => r.priority === 'normal').length,
    urgent: records.filter(r => r.priority === 'urgent').length,
    critical: records.filter(r => r.priority === 'critical').length,
  };

  // ECG by status
  const byStatus = {
    pending: records.filter(r => r.status === 'pending').length,
    in_progress: records.filter(r => r.status === 'in_progress').length,
    validated: records.filter(r => r.status === 'validated').length,
    sent: records.filter(r => r.status === 'sent').length,
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Statistiques"
      description="Vue d'ensemble de votre activité"
      size="lg"
    >
      <div className="space-y-6">
        {/* Today's Stats */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Aujourd'hui
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                {trends.received.positive ? (
                  <span className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                    +{trends.received.value}%
                  </span>
                ) : (
                  <span className="flex items-center text-xs text-red-600">
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                    -{trends.received.value}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{todayStats.received}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">ECG reçus</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{trends.analyzed.value}%
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{todayStats.analyzed}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Analysés</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{todayStats.sent}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Envoyés</p>
            </div>
          </div>
        </div>

        {/* Average Time */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Temps moyen d'interprétation</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.avgTime} min</p>
            </div>
            <div className="ml-auto text-right">
              <span className="flex items-center text-sm text-green-600">
                <TrendingDown className="h-4 w-4 mr-1" />
                {trends.avgTime.value} min plus rapide
              </span>
              <p className="text-xs text-gray-400">vs. semaine dernière</p>
            </div>
          </div>
        </div>

        {/* By Priority */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Par priorité
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">Normal</span>
              <span className="font-semibold text-gray-900 dark:text-white">{byPriority.normal}</span>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${(byPriority.normal / records.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">Urgent</span>
              <span className="font-semibold text-amber-600">{byPriority.urgent}</span>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(byPriority.urgent / records.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">Critique</span>
              <span className="font-semibold text-red-600">{byPriority.critical}</span>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${(byPriority.critical / records.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* By Status */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Par statut
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{byStatus.pending}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">En attente</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">{byStatus.in_progress}</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400">En cours</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{byStatus.validated}</p>
              <p className="text-xs text-green-700 dark:text-green-400">Validés</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{byStatus.sent}</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">Envoyés</p>
            </div>
          </div>
        </div>

        {/* Top Hospitals */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Établissements (ECG en attente)
          </h3>
          <div className="space-y-2">
            {hospitals.slice(0, 5).map((hospital) => (
              <div key={hospital.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{hospital.name}</p>
                </div>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                  {hospital.pendingCount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="h-5 w-5" />
            <h3 className="font-semibold">Résumé de la semaine</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{weekStats.received}</p>
              <p className="text-xs text-indigo-200">Reçus</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{weekStats.analyzed}</p>
              <p className="text-xs text-indigo-200">Analysés</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{weekStats.sent}</p>
              <p className="text-xs text-indigo-200">Envoyés</p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
