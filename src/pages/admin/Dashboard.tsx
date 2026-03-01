import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  Clock,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  UserPlus,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useActivityLogs } from '@/hooks/useDashboardStats';
import { useUserList } from '@/hooks/useUserList';
import type { AdminStats } from '@/types/dashboard';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { users } = useUserList();
  const { stats, loading: statsLoading } = useDashboardStats<AdminStats>();
  const { logs: activityLogs, loading: logsLoading } = useActivityLogs(5);

  const pendingUsers = users.filter(u => u.status === 'pending');

  const cardioCount = users.filter(u => u.role === 'cardiologue').length;
  const medecinCount = users.filter(u => u.role === 'medecin').length;
  const secretaireCount = users.filter(u => u.role === 'secretaire').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-3">
      {/* En-tête compact + pills stats + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-indigo-600" />
            Administration
          </h1>
          <span className="text-xs text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
            {format(new Date(), "d MMM yyyy", { locale: fr })}
          </span>
          {pendingUsers.length > 0 && (
            <button
              className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-xs font-semibold text-amber-700 hover:bg-amber-200 transition-colors"
              onClick={() => navigate('/admin/users')}
            >
              <UserPlus className="h-3 w-3" />
              {pendingUsers.length} en attente
            </button>
          )}
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700">
            <Users className="h-3 w-3" />
            <span className="font-bold">{statsLoading ? '…' : (stats?.total_users ?? '-')}</span>
            <span className="opacity-75">utilisateurs</span>
          </button>
          <button onClick={() => navigate('/admin/hospitals')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700">
            <Building2 className="h-3 w-3" />
            <span className="font-bold">{statsLoading ? '…' : (stats?.total_hospitals ?? '-')}</span>
            <span className="opacity-75">établissements</span>
          </button>
          <button onClick={() => navigate('/admin/statistics')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-xs font-medium text-blue-700">
            <Activity className="h-3 w-3" />
            <span className="font-bold">{statsLoading ? '…' : (stats?.total_ecg_month ?? '-')}</span>
            <span className="opacity-75">ECG mois</span>
          </button>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-xs font-medium text-violet-700">
            <Clock className="h-3 w-3" />
            <span className="font-bold">{statsLoading ? '…' : (stats?.total_ecg_today ?? '-')}</span>
            <span className="opacity-75">ECG auj.</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/admin/users')}>
            <Users className="h-3.5 w-3.5 mr-1.5" />Utilisateurs
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/admin/hospitals')}>
            <Building2 className="h-3.5 w-3.5 mr-1.5" />Établissements
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/admin/statistics')}>
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />Statistiques
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/admin/settings')}>
            <Settings className="h-3.5 w-3.5 mr-1.5" />Paramètres
          </Button>
        </div>
      </div>

      {/* Répartition rôles (pills) */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Rôles :</span>
        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs">{cardioCount} cardio</span>
        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">{medecinCount} médecins</span>
        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs">{secretaireCount} secrét.</span>
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">{adminCount} admin</span>
        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs">
          {statsLoading
            ? <span className="inline-block w-8 h-3 bg-green-200 rounded animate-pulse align-middle" />
            : `${stats?.total_ecg_today ?? 0} ECG aujourd'hui`
          }
        </span>
      </div>

      {/* Stats globales backend — toujours visible, squelette pendant le chargement */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Utilisateurs actifs', value: stats?.total_users,    color: 'text-indigo-700' },
          { label: 'Établissements',      value: stats?.total_hospitals, color: 'text-emerald-700' },
          { label: 'ECG ce mois',         value: stats?.total_ecg_month, color: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="p-2.5 rounded-md bg-slate-50 border border-slate-200/50 text-center">
            {statsLoading ? (
              <div className="h-7 w-12 bg-slate-200 rounded animate-pulse mx-auto mb-1" />
            ) : (
              <p className={`text-xl font-bold ${s.color}`}>{s.value ?? '-'}</p>
            )}
            <p className="text-[10px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activité récente */}
      <Card>
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              Activité récente
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/admin/logs')}>
              Voir tout <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logsLoading && (
                <p className="text-xs text-slate-400 text-center py-4">Chargement…</p>
              )}
              {!logsLoading && activityLogs.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">Aucune activité récente</p>
              )}
              {activityLogs.map(log => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{log.action}</p>
                      <span className="text-xs text-gray-500 shrink-0">
                        {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
