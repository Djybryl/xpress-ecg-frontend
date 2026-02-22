import { useState } from 'react';
import {
  Activity, Calendar, CheckCircle2, Clock, AlertTriangle,
  ChevronDown, ChevronUp, FileText, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CardiologueECG } from '@/stores/useCardiologueStore';
import type { ECGReport } from '@/stores/useReportStore';

interface PatientECGHistoryProps {
  patientName: string;
  ecgs?: CardiologueECG[];
  reports?: ECGReport[];
  onOpenReport?: (reportId: string) => void;
}

type TimelineItem =
  | { kind: 'ecg'; ecg: CardiologueECG; date: Date }
  | { kind: 'report'; report: ECGReport; date: Date };

export function PatientECGHistory({
  patientName,
  ecgs = [],
  reports = [],
  onOpenReport,
}: PatientECGHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Fusion et tri chronologique (plus récent en premier)
  const timeline: TimelineItem[] = [
    ...ecgs.map(ecg => ({ kind: 'ecg' as const, ecg, date: new Date(ecg.dateReceived) })),
    ...reports.map(report => ({ kind: 'report' as const, report, date: new Date(report.dateReceived) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (timeline.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-10 h-10 text-slate-200 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Aucun ECG enregistré pour ce patient.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <User className="w-3.5 h-3.5" />
        {timeline.length} ECG dans l'historique de {patientName}
      </p>

      {/* Ligne de temps */}
      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-slate-200" />

        <div className="space-y-3">
          {timeline.map((item, idx) => {
            const key = item.kind === 'ecg' ? `ecg-${item.ecg.id}` : `rep-${item.report.id}`;
            const isExpanded = expanded === key;

            if (item.kind === 'ecg') {
              const { ecg } = item;
              const statusConfig = {
                pending: { icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-200', label: 'En attente' },
                in_progress: { icon: Activity, color: 'text-blue-500 bg-blue-50 border-blue-200', label: 'En cours' },
                completed: { icon: CheckCircle2, color: 'text-green-500 bg-green-50 border-green-200', label: 'Interprété' },
              }[ecg.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div key={key} className="relative pl-10">
                  <div className={cn(
                    'absolute left-0 w-9 h-9 rounded-full border-2 flex items-center justify-center',
                    statusConfig.color
                  )}>
                    <StatusIcon className="w-4 h-4" />
                  </div>

                  <div className={cn(
                    'border rounded-lg overflow-hidden transition-shadow hover:shadow-sm',
                    ecg.urgency === 'urgent' ? 'border-red-200' : 'border-gray-200'
                  )}>
                    <button
                      className="w-full text-left px-4 py-3 flex items-center justify-between"
                      onClick={() => setExpanded(isExpanded ? null : key)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-400">{ecg.id}</span>
                            {ecg.urgency === 'urgent' && (
                              <Badge className="bg-red-100 text-red-600 text-[10px] px-1.5">URGENT</Badge>
                            )}
                            <Badge variant="outline" className={cn('text-[10px] px-1.5', statusConfig.color)}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {format(parseISO(ecg.ecgDate), 'd MMMM yyyy', { locale: fr })} •{' '}
                            {ecg.referringDoctor} • {ecg.hospital}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
                        {ecg.clinicalContext && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mt-3 mb-1">Contexte clinique</p>
                            <p className="text-sm text-gray-700">{ecg.clinicalContext}</p>
                          </div>
                        )}
                        {ecg.measurements && (
                          <div className="flex gap-4 text-center">
                            {ecg.measurements.heartRate && (
                              <div>
                                <p className="text-xs text-gray-400">FC</p>
                                <p className="text-sm font-bold text-indigo-600">{ecg.measurements.heartRate} bpm</p>
                              </div>
                            )}
                            {ecg.measurements.prInterval && (
                              <div>
                                <p className="text-xs text-gray-400">PR</p>
                                <p className="text-sm font-bold text-gray-700">{ecg.measurements.prInterval} ms</p>
                              </div>
                            )}
                            {ecg.measurements.qrsDuration && (
                              <div>
                                <p className="text-xs text-gray-400">QRS</p>
                                <p className="text-sm font-bold text-gray-700">{ecg.measurements.qrsDuration} ms</p>
                              </div>
                            )}
                            {ecg.measurements.qtcInterval && (
                              <div>
                                <p className="text-xs text-gray-400">QTc</p>
                                <p className="text-sm font-bold text-amber-600">{ecg.measurements.qtcInterval} ms</p>
                              </div>
                            )}
                          </div>
                        )}
                        {ecg.interpretation && (
                          <div className={cn(
                            'rounded p-3 text-sm',
                            ecg.interpretation.isNormal
                              ? 'bg-green-50 text-green-800'
                              : 'bg-red-50 text-red-800'
                          )}>
                            <p className="font-medium text-xs mb-1">
                              {ecg.interpretation.isNormal ? '✓ ECG normal' : '⚠ ECG anormal'}
                            </p>
                            <p>{ecg.interpretation.conclusion}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Rapport médecin
            const { report } = item;
            return (
              <div key={key} className="relative pl-10">
                <div className="absolute left-0 w-9 h-9 rounded-full border-2 border-indigo-200 bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>

                <div className="border border-indigo-100 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-400">{report.ecgId}</span>
                        {report.isUrgent && (
                          <Badge className="bg-red-100 text-red-600 text-[10px] px-1.5">URGENT</Badge>
                        )}
                        {!report.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(parseISO(report.dateReceived), 'd MMMM yyyy', { locale: fr })} •{' '}
                        {report.cardiologist}
                      </p>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-1">{report.conclusion}</p>
                    </div>
                    {onOpenReport && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-700 flex-shrink-0"
                        onClick={() => onOpenReport(report.id)}
                      >
                        Voir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
