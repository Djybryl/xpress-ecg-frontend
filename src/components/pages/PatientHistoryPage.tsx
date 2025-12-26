import { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  Search,
  Download,
  Eye,
  ChevronRight,
  Heart,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useECGStore, type ECGRecord } from '@/stores/ecgStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PatientHistoryPageProps {
  patientId: string;
  onClose: () => void;
  onViewECG: (ecg: ECGRecord) => void;
}

export function PatientHistoryPage({ patientId, onClose, onViewECG }: PatientHistoryPageProps) {
  const { records } = useECGStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get patient's ECGs
  const patientECGs = records.filter(r => r.patient.id === patientId);
  const patient = patientECGs[0]?.patient;

  // Filter and sort
  const filteredECGs = patientECGs
    .filter(ecg => {
      if (statusFilter !== 'all' && ecg.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          ecg.referenceNumber.toLowerCase().includes(query) ||
          ecg.interpretation?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.acquisitionDate).getTime();
      const dateB = new Date(b.acquisitionDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Statistics
  const stats = {
    total: patientECGs.length,
    normal: patientECGs.filter(e => e.priority === 'normal').length,
    urgent: patientECGs.filter(e => e.priority === 'urgent' || e.priority === 'critical').length,
    avgHeartRate: Math.round(
      patientECGs.reduce((sum, e) => sum + (e.measurements?.heartRate || 75), 0) / patientECGs.length
    ),
  };

  const getStatusBadge = (status: ECGRecord['status']) => {
    const config: Record<string, { color: string; icon: typeof Clock; label: string }> = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, label: 'En attente' },
      in_progress: { color: 'bg-indigo-100 text-indigo-800', icon: Activity, label: 'En analyse' },
      validated: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Validé' },
      sent: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Envoyé' },
    };
    const { color, icon: Icon, label } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Patient non trouvé</h2>
          <Button onClick={onClose} className="mt-4">Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {patient.gender === 'M' ? 'Homme' : 'Femme'} • ID: {patient.id}
                  </p>
                </div>
              </div>
            </div>

            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="h-4 w-4 mr-2" />
              Exporter l'historique
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total ECG</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ECG Normaux</p>
                <p className="text-2xl font-bold text-green-600">{stats.normal}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Urgents/Critiques</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">FC Moyenne</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgHeartRate} bpm</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par référence ou interprétation..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="analyzing">En analyse</option>
              <option value="completed">Terminé</option>
              <option value="urgent">Urgent</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
            </Button>
          </div>
        </div>

        {/* ECG Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Historique des ECG ({filteredECGs.length})
            </h2>
          </div>

          {filteredECGs.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun ECG trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Modifiez vos filtres ou effectuez une nouvelle recherche
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {filteredECGs.map((ecg, index) => {
                const prevECG = filteredECGs[index + 1];
                const hrChange = prevECG && ecg.measurements?.heartRate && prevECG.measurements?.heartRate
                  ? ecg.measurements.heartRate - prevECG.measurements.heartRate
                  : null;

                return (
                  <div
                    key={ecg.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    onClick={() => onViewECG(ecg)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          ecg.priority === 'critical' || ecg.priority === 'urgent'
                            ? 'bg-red-500'
                            : ecg.status === 'validated' || ecg.status === 'sent'
                              ? 'bg-green-500'
                              : 'bg-indigo-500'
                        }`} />
                        {index < filteredECGs.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-600 mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {ecg.referenceNumber}
                              </span>
                              {getStatusBadge(ecg.status)}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(ecg.acquisitionDate), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                            </p>
                          </div>

                          {/* Measurements */}
                          {ecg.measurements && (
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-right">
                                <p className="text-gray-500 dark:text-gray-400">FC</p>
                                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                  {ecg.measurements.heartRate} bpm
                                  {hrChange !== null && hrChange !== 0 && (
                                    <span className={`flex items-center text-xs ${
                                      hrChange > 0 ? 'text-amber-500' : 'text-green-500'
                                    }`}>
                                      {hrChange > 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3" />
                                      )}
                                      {Math.abs(hrChange)}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500 dark:text-gray-400">QRS</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {ecg.measurements.qrsDuration} ms
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500 dark:text-gray-400">QTc</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {ecg.measurements.qtcInterval} ms
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interpretation */}
                        {ecg.interpretation && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                            {ecg.interpretation}
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
