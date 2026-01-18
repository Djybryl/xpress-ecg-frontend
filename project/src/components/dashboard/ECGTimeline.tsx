import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Activity, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ECGRecord } from '@/types/ecg';

interface ECGTimelineProps {
  records: ECGRecord[];
  onOpenECG: (record: ECGRecord) => void;
}

export function ECGTimeline({ records, onOpenECG }: ECGTimelineProps) {
  const getWaitingTime = (date: string) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 1000 / 60);
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}j`;
  };

  const getPriorityLevel = (record: ECGRecord) => {
    const waitingTime = (Date.now() - new Date(record.created_at).getTime()) / 1000 / 60;
    if (waitingTime > 120) return 'high';
    if (waitingTime > 60) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-4">
      {records.map((record) => {
        const priority = getPriorityLevel(record);
        const waitingTime = getWaitingTime(record.created_at);

        return (
          <div
            key={record.id}
            className={cn(
              "p-4 rounded-lg border transition-colors",
              priority === 'high' && 'bg-red-50 border-red-200',
              priority === 'medium' && 'bg-yellow-50 border-yellow-200',
              priority === 'low' && 'bg-white border-gray-200'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className={cn(
                    "h-4 w-4",
                    priority === 'high' && 'text-red-600',
                    priority === 'medium' && 'text-yellow-600',
                    priority === 'low' && 'text-blue-600'
                  )} />
                  <h3 className="font-medium">{record.patient_name}</h3>
                  <span className="text-sm text-gray-500">({record.id})</span>
                </div>
                <p className="text-sm text-gray-500">{record.medical_center}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{waitingTime}</span>
                </div>

                {priority === 'high' && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Urgent</span>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenECG(record)}
                >
                  Examiner
                </Button>
              </div>
            </div>

            {record.tags && record.tags.length > 0 && (
              <div className="mt-2 flex gap-2">
                {record.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}