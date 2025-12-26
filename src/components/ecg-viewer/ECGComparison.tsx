import { useState, useEffect } from 'react';
import { 
  GitCompare, 
  X, 
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle,
  Maximize2,
  Minimize2,
  ArrowLeftRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { ECGRecord } from '@/stores/ecgStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ECGComparisonProps {
  currentECG: ECGRecord;
  availableECGs: ECGRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export function ECGComparison({ currentECG, availableECGs, isOpen, onClose }: ECGComparisonProps) {
  const [selectedECG, setSelectedECG] = useState<ECGRecord | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const [syncScroll, setSyncScroll] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter ECGs from same patient (excluding current)
  const patientECGs = availableECGs.filter(
    ecg => ecg.patient.id === currentECG.patient.id && ecg.id !== currentECG.id
  );

  // Sort by date descending
  const sortedECGs = [...patientECGs].sort(
    (a, b) => new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime()
  );

  useEffect(() => {
    if (sortedECGs.length > 0 && !selectedECG) {
      setSelectedECG(sortedECGs[0]);
    }
  }, [sortedECGs, selectedECG]);

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  const getStatusBadge = (status: ECGRecord['status']) => {
    const config: Record<string, { color: string; icon: typeof Clock; label: string }> = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, label: 'En attente' },
      in_progress: { color: 'bg-indigo-100 text-indigo-800', icon: Clock, label: 'En analyse' },
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

  // Mock ECG trace component
  const ECGTrace = ({ ecg, label }: { ecg: ECGRecord; label: string }) => (
    <div className="relative h-full bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white dark:from-gray-900 to-transparent p-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(ecg.acquisitionDate)}
            </p>
          </div>
          {getStatusBadge(ecg.status)}
        </div>
      </div>

      {/* ECG Grid & Trace (simulated) */}
      <div className="h-full pt-16 p-4">
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Grid */}
          <defs>
            <pattern id={`grid-${ecg.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fecaca" strokeWidth="0.5" />
            </pattern>
            <pattern id={`grid-major-${ecg.id}`} width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#fca5a5" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${ecg.id})`} />
          <rect width="100%" height="100%" fill={`url(#grid-major-${ecg.id})`} />

          {/* Simulated ECG trace */}
          <path
            d={`M 0 100 
               L 20 100 L 25 100 L 30 95 L 35 100 
               L 50 100 L 55 100 L 60 70 L 65 130 L 70 90 L 75 100 
               L 90 100 L 95 100 L 105 85 L 115 100
               L 130 100 L 135 100 L 140 95 L 145 100
               L 160 100 L 165 100 L 170 70 L 175 130 L 180 90 L 185 100
               L 200 100 L 205 100 L 215 85 L 225 100
               L 240 100 L 245 100 L 250 95 L 255 100
               L 270 100 L 275 100 L 280 70 L 285 130 L 290 90 L 295 100
               L 310 100 L 315 100 L 325 85 L 335 100
               L 350 100 L 355 100 L 360 95 L 365 100
               L 380 100 L 385 100 L 390 70 L 395 130 L 400 90`}
            fill="none"
            stroke="#1e40af"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Measurements */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent p-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">FC:</strong> {60 + Math.floor(Math.random() * 30)} bpm
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">PR:</strong> {150 + Math.floor(Math.random() * 50)} ms
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">QRS:</strong> {80 + Math.floor(Math.random() * 40)} ms
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">QTc:</strong> {400 + Math.floor(Math.random() * 60)} ms
          </span>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comparaison d'ECG"
      description={`Patient: ${currentECG.patient.firstName} ${currentECG.patient.lastName}`}
      size="full"
    >
      <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6' : ''}`}>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-4">
            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ArrowLeftRight className="h-4 w-4 inline mr-1" />
                Côte à côte
              </button>
              <button
                onClick={() => setViewMode('overlay')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'overlay'
                    ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <GitCompare className="h-4 w-4 inline mr-1" />
                Superposé
              </button>
            </div>

            {/* Sync scroll toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Synchroniser le défilement
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            {isFullscreen && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-4 min-h-[500px]">
          {/* ECG selector sidebar */}
          <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              ECG antérieurs ({sortedECGs.length})
            </h3>
            
            {sortedECGs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <GitCompare className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">Aucun ECG antérieur</p>
                <p className="text-xs mt-1">pour ce patient</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedECGs.map((ecg) => (
                  <button
                    key={ecg.id}
                    onClick={() => setSelectedECG(ecg)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedECG?.id === ecg.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {format(new Date(ecg.acquisitionDate), 'd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(ecg.acquisitionDate), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge(ecg.status)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comparison view */}
          <div className="flex-1">
            {viewMode === 'side-by-side' ? (
              <div className="grid grid-cols-2 gap-4 h-full">
                {/* Current ECG */}
                <ECGTrace ecg={currentECG} label="ECG Actuel" />

                {/* Selected ECG */}
                {selectedECG ? (
                  <ECGTrace ecg={selectedECG} label="ECG de Comparaison" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <ChevronLeft className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Sélectionnez un ECG</p>
                      <p className="text-xs">à comparer</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Overlay view */
              <div className="relative h-full bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 overflow-hidden">
                {/* Legend */}
                <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 shadow">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-blue-600"></span>
                      Actuel
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-emerald-500"></span>
                      Comparaison
                    </span>
                  </div>
                </div>

                {/* Overlaid traces */}
                <div className="h-full p-4">
                  <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                    {/* Grid */}
                    <defs>
                      <pattern id="grid-overlay" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fecaca" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-overlay)" />

                    {/* Current ECG trace */}
                    <path
                      d={`M 0 100 
                         L 20 100 L 25 100 L 30 95 L 35 100 
                         L 50 100 L 55 100 L 60 70 L 65 130 L 70 90 L 75 100 
                         L 90 100 L 95 100 L 105 85 L 115 100
                         L 130 100 L 135 100 L 140 95 L 145 100
                         L 160 100 L 165 100 L 170 70 L 175 130 L 180 90 L 185 100
                         L 200 100 L 205 100 L 215 85 L 225 100
                         L 240 100 L 245 100 L 250 95 L 255 100
                         L 270 100 L 275 100 L 280 70 L 285 130 L 290 90 L 295 100
                         L 310 100 L 315 100 L 325 85 L 335 100
                         L 350 100 L 355 100 L 360 95 L 365 100
                         L 380 100 L 385 100 L 390 70 L 395 130 L 400 90`}
                      fill="none"
                      stroke="#1e40af"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />

                    {/* Comparison ECG trace (slightly different) */}
                    {selectedECG && (
                      <path
                        d={`M 0 102 
                           L 20 102 L 25 102 L 30 97 L 35 102 
                           L 50 102 L 55 102 L 60 68 L 65 135 L 70 88 L 75 102 
                           L 90 102 L 95 102 L 105 83 L 115 102
                           L 130 102 L 135 102 L 140 97 L 145 102
                           L 160 102 L 165 102 L 170 68 L 175 135 L 180 88 L 185 102
                           L 200 102 L 205 102 L 215 83 L 225 102
                           L 240 102 L 245 102 L 250 97 L 255 102
                           L 270 102 L 275 102 L 280 68 L 285 135 L 290 88 L 295 102
                           L 310 102 L 315 102 L 325 83 L 335 102
                           L 350 102 L 355 102 L 360 97 L 365 102
                           L 380 102 L 385 102 L 390 68 L 395 135 L 400 88`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.7"
                      />
                    )}
                  </svg>
                </div>

                {/* Date labels */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-xs">
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                    {formatDate(currentECG.acquisitionDate)}
                  </span>
                  {selectedECG && (
                    <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded">
                      {formatDate(selectedECG.acquisitionDate)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison summary */}
        {selectedECG && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Résumé de la comparaison
            </h4>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Fréquence cardiaque', current: '78 bpm', previous: '72 bpm', change: '+6' },
                { label: 'Intervalle PR', current: '168 ms', previous: '162 ms', change: '+6' },
                { label: 'Durée QRS', current: '92 ms', previous: '88 ms', change: '+4' },
                { label: 'Intervalle QTc', current: '428 ms', previous: '420 ms', change: '+8' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{item.current}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      vs {item.previous}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${
                    item.change.startsWith('+') ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {item.change} ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
