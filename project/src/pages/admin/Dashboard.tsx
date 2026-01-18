import { useState } from 'react';
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
  Settings,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAdminStore, roleLabels, roleColors, statusColors } from '@/stores/useAdminStore';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { getStats, users, hospitals, getLogs } = useAdminStore();
  const stats = getStats();
  const logs = getLogs();
  const [statsOpen, setStatsOpen] = useState(true);

  // Utilisateurs en attente de validation
  const pendingUsers = users.filter(u => u.status === 'pending');
  // Logs récents
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="p-4 space-y-3">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-indigo-600" />
            Administration
          </h1>
        </div>
        <div className="text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </div>
      </div>

      {/* Stats compactes collapsibles */}
      <div className="flex items-center justify-between">
        <Collapsible open={statsOpen} onOpenChange={setStatsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-indigo-600">{stats.totalUsers}</span>
                  <span className="text-xs text-gray-500">Utilisateurs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-emerald-600">{stats.totalHospitals}</span>
                  <span className="text-xs text-gray-500">Établissements</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-blue-600">{stats.ecgThisMonth}</span>
                  <span className="text-xs text-gray-500">ECG ce mois</span>
                </div>
                <ChevronDown className={cn(
                  "h-3 w-3 text-gray-400 transition-transform",
                  statsOpen && "rotate-180"
                )} />
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-indigo-50/80 to-transparent border-indigo-200/60"
                onClick={() => navigate('/admin/users')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-600 text-xs font-medium">Utilisateurs</p>
                      <p className="text-xl font-bold text-indigo-700">{stats.totalUsers}</p>
                      <p className="text-[9px] text-indigo-500 mt-0.5">{stats.activeUsers} actifs</p>
                    </div>
                    <Users className="h-5 w-5 text-indigo-400" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-emerald-50/80 to-transparent border-emerald-200/60"
                onClick={() => navigate('/admin/hospitals')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-xs font-medium">Établissements</p>
                      <p className="text-xl font-bold text-emerald-700">{stats.totalHospitals}</p>
                      <p className="text-[9px] text-emerald-500 mt-0.5">{stats.activeHospitals} actifs</p>
                    </div>
                    <Building2 className="h-5 w-5 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-50/80 to-transparent border-blue-200/60"
                onClick={() => navigate('/admin/statistics')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-xs font-medium">ECG ce mois</p>
                      <p className="text-xl font-bold text-blue-700">{stats.ecgThisMonth}</p>
                      <p className="text-[9px] text-blue-500 mt-0.5">{stats.ecgToday} aujourd'hui</p>
                    </div>
                    <Activity className="h-5 w-5 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-50/80 to-transparent border-violet-200/60">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-600 text-xs font-medium">Temps moyen</p>
                      <p className="text-xl font-bold text-violet-700">{stats.avgResponseTime}</p>
                      <p className="text-[9px] text-violet-500 mt-0.5">réponse</p>
                    </div>
                    <Clock className="h-5 w-5 text-violet-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Alertes */}
      {pendingUsers.length > 0 && (
        <Card className="border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-amber-50/30">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-amber-800">
                    {pendingUsers.length} inscription(s) en attente
                  </h3>
                  <p className="text-[10px] text-amber-600">Nécessite votre validation</p>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                className="h-7 text-xs border-amber-300/70 text-amber-700 hover:bg-amber-100"
                onClick={() => navigate('/admin/users')}
              >
                Voir
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activité récente */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              Activité récente
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/admin/logs')}>
              Voir tout
              <ChevronRight className="h-3 w-3 ml-1" />
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
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

      {/* Actions rapides - Compact */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="h-auto px-3 py-2 flex items-center gap-2 hover:bg-indigo-50/50 hover:border-indigo-300/70"
          onClick={() => navigate('/admin/users')}
        >
          <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-xs text-slate-800">Utilisateurs</h3>
            <p className="text-[10px] text-slate-500">{stats.totalUsers} comptes</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto px-3 py-2 flex items-center gap-2 hover:bg-emerald-50/50 hover:border-emerald-300/70"
          onClick={() => navigate('/admin/hospitals')}
        >
          <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
            <Building2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-xs text-slate-800">Établissements</h3>
            <p className="text-[10px] text-slate-500">{stats.totalHospitals} partenaires</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto px-3 py-2 flex items-center gap-2 hover:bg-blue-50/50 hover:border-blue-300/70"
          onClick={() => navigate('/admin/statistics')}
        >
          <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-xs text-slate-800">Statistiques</h3>
            <p className="text-[10px] text-slate-500">Rapports détaillés</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto px-3 py-2 flex items-center gap-2 hover:bg-slate-100/50 hover:border-slate-300/70"
          onClick={() => navigate('/admin/settings')}
        >
          <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center">
            <Settings className="h-4 w-4 text-slate-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-xs text-slate-800">Paramètres</h3>
            <p className="text-[10px] text-slate-500">Configuration</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
