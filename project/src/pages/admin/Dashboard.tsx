import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAdminStore, roleLabels, roleColors, statusColors } from '@/stores/useAdminStore';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { getStats, users, hospitals, getLogs } = useAdminStore();
  const stats = getStats();
  const logs = getLogs();

  // Utilisateurs en attente de validation
  const pendingUsers = users.filter(u => u.status === 'pending');
  // Logs récents
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-3">
      {/* En-tête compact */}
      <div className="flex items-center justify-between h-11">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-indigo-600" />
          <h1 className="text-base font-semibold text-slate-800">Administration</h1>
          <span className="text-[10px] text-slate-400">Vue système Xpress-ECG</span>
        </div>
        <div className="text-[10px] text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
          {format(new Date(), "EEE d MMM yyyy", { locale: fr })}
        </div>
      </div>

      {/* Alertes */}
      {pendingUsers.length > 0 && (
        <Card className="border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-amber-50/30">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800">
                    {pendingUsers.length} inscription(s) en attente
                  </h3>
                  <p className="text-xs text-amber-600">
                    Nécessite votre validation
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                className="h-8 text-xs border-amber-300/70 text-amber-700 hover:bg-amber-100"
                onClick={() => navigate('/admin/users')}
              >
                Voir les demandes
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques principales - COMPACT */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Card 
          className="cursor-pointer hover:shadow-sm transition-all duration-200 bg-slate-50 hover:bg-slate-100 border-slate-200"
          onClick={() => navigate('/admin/users')}
        >
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-indigo-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 leading-tight">Utilisateurs</p>
                <p className="text-lg font-bold text-slate-800 leading-tight">{stats.totalUsers}</p>
              </div>
              <p className="text-[9px] text-slate-400">{stats.activeUsers} actifs</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-sm transition-all duration-200 bg-slate-50 hover:bg-slate-100 border-slate-200"
          onClick={() => navigate('/admin/hospitals')}
        >
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 leading-tight">Établissements</p>
                <p className="text-lg font-bold text-slate-800 leading-tight">{stats.totalHospitals}</p>
              </div>
              <p className="text-[9px] text-slate-400">{stats.activeHospitals} actifs</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-sm transition-all duration-200 bg-slate-50 hover:bg-slate-100 border-slate-200"
          onClick={() => navigate('/admin/statistics')}
        >
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 leading-tight">ECG mois</p>
                <p className="text-lg font-bold text-slate-800 leading-tight">{stats.ecgThisMonth}</p>
              </div>
              <p className="text-[9px] text-slate-400">{stats.ecgToday} auj.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 hover:bg-slate-100 border-slate-200">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-violet-100 rounded flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-violet-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 leading-tight">Temps moy.</p>
                <p className="text-lg font-bold text-slate-800 leading-tight">{stats.avgResponseTime}</p>
              </div>
              <p className="text-[9px] text-slate-400">réponse</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Activité récente */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Activité récente
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/logs')}>
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div 
                  key={log.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    log.type === 'error' && "bg-red-50 border-red-200",
                    log.type === 'warning' && "bg-amber-50 border-amber-200",
                    log.type === 'success' && "bg-green-50 border-green-200",
                    log.type === 'info' && "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    log.type === 'error' && "bg-red-200",
                    log.type === 'warning' && "bg-amber-200",
                    log.type === 'success' && "bg-green-200",
                    log.type === 'info' && "bg-gray-200"
                  )}>
                    {log.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {log.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    {log.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {log.type === 'info' && <Activity className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{log.action}</p>
                      <span className="text-xs text-gray-500 shrink-0">
                        {formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{log.details}</p>
                    <p className="text-xs text-gray-400">{log.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Vue rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ECG Normaux vs Anormaux */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">ECG Normaux</span>
                <span className="font-medium text-green-600">{stats.normalECGPercent}%</span>
              </div>
              <Progress value={stats.normalECGPercent} className="h-2 [&>div]:bg-green-500" />
            </div>

            {/* Utilisateurs actifs */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Utilisateurs actifs</span>
                <span className="font-medium">
                  {stats.activeUsers}/{stats.totalUsers}
                </span>
              </div>
              <Progress 
                value={(stats.activeUsers / stats.totalUsers) * 100} 
                className="h-2" 
              />
            </div>

            {/* Établissements actifs */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Établissements actifs</span>
                <span className="font-medium">
                  {stats.activeHospitals}/{stats.totalHospitals}
                </span>
              </div>
              <Progress 
                value={(stats.activeHospitals / stats.totalHospitals) * 100} 
                className="h-2 [&>div]:bg-emerald-500" 
              />
            </div>

            {/* Répartition par rôle */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Répartition des utilisateurs</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-indigo-50 rounded text-center">
                  <p className="text-lg font-bold text-indigo-700">
                    {users.filter(u => u.role === 'cardiologue').length}
                  </p>
                  <p className="text-xs text-indigo-600">Cardiologues</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded text-center">
                  <p className="text-lg font-bold text-emerald-700">
                    {users.filter(u => u.role === 'medecin').length}
                  </p>
                  <p className="text-xs text-emerald-600">Médecins</p>
                </div>
                <div className="p-2 bg-amber-50 rounded text-center">
                  <p className="text-lg font-bold text-amber-700">
                    {users.filter(u => u.role === 'secretaire').length}
                  </p>
                  <p className="text-xs text-amber-600">Secrétaires</p>
                </div>
                <div className="p-2 bg-slate-50 rounded text-center">
                  <p className="text-lg font-bold text-slate-700">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                  <p className="text-xs text-slate-600">Admins</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1.5 hover:bg-indigo-50/50 hover:border-indigo-300/70 border-border/60 transition-all duration-200"
          onClick={() => navigate('/admin/users')}
        >
          <Users className="h-6 w-6 text-indigo-600" />
          <span className="text-sm font-medium">Utilisateurs</span>
          <span className="text-[10px] text-slate-500">{stats.totalUsers} comptes</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1.5 hover:bg-emerald-50/50 hover:border-emerald-300/70 border-border/60 transition-all duration-200"
          onClick={() => navigate('/admin/hospitals')}
        >
          <Building2 className="h-6 w-6 text-emerald-600" />
          <span className="text-sm font-medium">Établissements</span>
          <span className="text-[10px] text-slate-500">{stats.totalHospitals} partenaires</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1.5 hover:bg-blue-50/50 hover:border-blue-300/70 border-border/60 transition-all duration-200"
          onClick={() => navigate('/admin/statistics')}
        >
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium">Statistiques</span>
          <span className="text-[10px] text-slate-500">Rapports détaillés</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1.5 hover:bg-slate-100/50 hover:border-slate-300/70 border-border/60 transition-all duration-200"
          onClick={() => navigate('/admin/settings')}
        >
          <Settings className="h-6 w-6 text-slate-600" />
          <span className="text-sm font-medium">Paramètres</span>
          <span className="text-[10px] text-slate-500">Configuration</span>
        </Button>
      </div>
    </div>
  );
}
