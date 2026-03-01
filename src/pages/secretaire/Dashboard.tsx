import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  UserCog, 
  Send, 
  Clock,
  AlertTriangle,
  Activity,
  ChevronRight,
  User,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useECGQueueStore } from '@/stores/useECGQueueStore';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import type { SecretaryStats } from '@/types/dashboard';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function SecretaireDashboard() {
  const navigate = useNavigate();
  const { getCounts, getByStatus } = useECGQueueStore();
  const counts = getCounts();
  const { stats, loading: statsLoading } = useDashboardStats<SecretaryStats>();

  // Priorité aux données backend, fallback sur le store mock
  const pendingValidation = statsLoading ? counts.received : (stats?.pending_validation ?? counts.received);
  const totalToday = statsLoading ? 0 : (stats?.total_today ?? 0);

  // ECG urgents en attente
  const urgentPending = getByStatus(['received', 'validated']).filter(e => e.urgency === 'urgent');
  // ECG récemment reçus
  const recentReceived = getByStatus('received').slice(0, 3);
  return (
    <div className="space-y-4">
      {/* En-tête compact + badge urgents + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold text-slate-800">Tableau de bord</h1>
          <span className="text-xs text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
            {format(new Date(), "d MMM yyyy", { locale: fr })}
          </span>
          {urgentPending.length > 0 && (
            <button
              className="flex items-center gap-1 px-2 py-0.5 bg-red-100 border border-red-300 rounded-full text-xs font-semibold text-red-700 animate-pulse hover:bg-red-200 transition-colors"
              onClick={() => navigate('/secretaire/inbox')}
            >
              <AlertTriangle className="h-3 w-3" />
              {urgentPending.length} urgent{urgentPending.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/secretaire/inbox')}>
            <Inbox className="h-3.5 w-3.5 mr-1.5" />Réception
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/secretaire/assign')}>
            <UserCog className="h-3.5 w-3.5 mr-1.5" />Assigner
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/secretaire/send-reports')}>
            <Send className="h-3.5 w-3.5 mr-1.5" />Rapports terminés
          </Button>
        </div>
      </div>

      {/* Pills stats compactes */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: 'À valider', value: pendingValidation, color: 'border-amber-300 text-amber-700 bg-amber-50', skelColor: 'bg-amber-200', loading: false, icon: Inbox, onClick: () => navigate('/secretaire/inbox') },
          { label: 'À assigner', value: counts.validated, color: 'border-blue-300 text-blue-700 bg-blue-50', skelColor: 'bg-blue-200', loading: false, icon: UserCog, onClick: () => navigate('/secretaire/assign') },
          { label: 'À envoyer', value: counts.ready_to_send, color: 'border-emerald-300 text-emerald-700 bg-emerald-50', skelColor: 'bg-emerald-200', loading: false, icon: Send, onClick: () => navigate('/secretaire/send-reports') },
          { label: "Reçus auj.", value: totalToday, color: 'border-violet-300 text-violet-700 bg-violet-50', skelColor: 'bg-violet-200', loading: statsLoading, icon: Activity, onClick: undefined },
        ].map(k => {
          const Icon = k.icon;
          return (
            <button key={k.label} onClick={k.onClick}
              className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity', k.color)}
            >
              <Icon className="h-3 w-3" />
              {k.loading
                ? <span className={cn('inline-block h-3 w-4 rounded animate-pulse', k.skelColor)} />
                : <span className="font-bold">{k.value}</span>}
              <span className="font-normal opacity-75">{k.label}</span>
            </button>
          );
        })}
      </div>

      {/* ECG récemment reçus */}
      <Card>
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Inbox className="h-4 w-4 text-amber-600" />
              ECG récemment reçus
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/secretaire/inbox')}>
              Voir tout <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentReceived.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Inbox className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p>Aucun ECG en attente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentReceived.map(ecg => (
                  <div 
                    key={ecg.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg border",
                      ecg.urgency === 'urgent' 
                        ? "bg-red-50 border-red-200" 
                        : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        ecg.urgency === 'urgent' ? "bg-red-200" : "bg-gray-200"
                      )}>
                        <User className={cn(
                          "h-4 w-4",
                          ecg.urgency === 'urgent' ? "text-red-600" : "text-gray-600"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-sm">{ecg.patientName}</p>
                          {ecg.urgency === 'urgent' && (
                            <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0">URGENT</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {ecg.referringDoctor} • {ecg.hospital}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">
                        {formatDistanceToNow(parseISO(ecg.dateReceived), { addSuffix: true, locale: fr })}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-0.5 h-6 text-xs"
                        onClick={() => navigate('/secretaire/inbox')}
                      >
                        Traiter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
