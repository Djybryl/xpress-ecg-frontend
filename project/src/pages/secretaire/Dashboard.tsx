import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  UserCog, 
  Send, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  TrendingUp,
  Users,
  FileText,
  ChevronRight,
  User,
  Building2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useECGQueueStore, cardiologists } from '@/stores/useECGQueueStore';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function SecretaireDashboard() {
  const navigate = useNavigate();
  const { queue, getCounts, getByStatus } = useECGQueueStore();
  const counts = getCounts();

  // ECG urgents en attente
  const urgentPending = getByStatus(['received', 'validated']).filter(e => e.urgency === 'urgent');
  // ECG récemment reçus
  const recentReceived = getByStatus('received').slice(0, 3);
  // Rapports prêts à envoyer
  const readyToSend = getByStatus('ready_to_send').slice(0, 3);

  // Stats de la journée (simulées)
  const todayStats = {
    received: 12,
    validated: 10,
    assigned: 8,
    sent: 6,
    avgTime: '1h45'
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Tableau de bord
          </h1>
          <p className="text-sm text-slate-500">
            Vue d'ensemble de la gestion des ECG
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </div>
      </div>

      {/* Alertes urgentes */}
      {urgentPending.length > 0 && (
        <Card className="border-red-200/60 bg-gradient-to-r from-red-50/80 to-red-50/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 bg-red-100 rounded-lg flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">
                    {urgentPending.length} ECG urgent(s) en attente
                  </h3>
                  <p className="text-xs text-red-600">
                    À traiter en priorité
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive"
                size="sm"
                className="h-8 text-xs"
                onClick={() => navigate('/secretaire/inbox')}
              >
                Traiter maintenant
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-amber-50/80 to-amber-50/20 border-amber-200/60"
          onClick={() => navigate('/secretaire/inbox')}
        >
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-xs font-medium">À valider</p>
                <p className="text-2xl font-bold text-amber-700">{counts.received}</p>
                <p className="text-[10px] text-amber-500 mt-0.5">
                  {counts.urgent > 0 && `dont ${urgentPending.filter(e => e.status === 'received').length} urgent(s)`}
                </p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Inbox className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-50/80 to-blue-50/20 border-blue-200/60"
          onClick={() => navigate('/secretaire/assign')}
        >
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-xs font-medium">À assigner</p>
                <p className="text-2xl font-bold text-blue-700">{counts.validated}</p>
                <p className="text-[10px] text-blue-500 mt-0.5">
                  {urgentPending.filter(e => e.status === 'validated').length > 0 && 
                    `dont ${urgentPending.filter(e => e.status === 'validated').length} urgent(s)`}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCog className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-emerald-50/80 to-emerald-50/20 border-emerald-200/60"
          onClick={() => navigate('/secretaire/send-reports')}
        >
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-xs font-medium">À envoyer</p>
                <p className="text-2xl font-bold text-emerald-700">{counts.ready_to_send}</p>
                <p className="text-[10px] text-emerald-500 mt-0.5">
                  Rapports prêts
                </p>
              </div>
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Send className="h-5 w-5 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50/80 to-violet-50/20 border-violet-200/60">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-600 text-xs font-medium">En cours</p>
                <p className="text-2xl font-bold text-violet-700">
                  {(counts.assigned || 0) + (counts.analyzing || 0)}
                </p>
                <p className="text-[10px] text-violet-500 mt-0.5">
                  En analyse
                </p>
              </div>
              <div className="h-10 w-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-violet-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ECG récemment reçus */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Inbox className="h-5 w-5 text-amber-600" />
              ECG récemment reçus
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/secretaire/inbox')}
            >
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
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

        {/* Cardiologues */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Cardiologues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cardiologists.map(cardio => (
                <div 
                  key={cardio.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    cardio.available 
                      ? "bg-green-50 border-green-200" 
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        cardio.available ? "bg-green-200" : "bg-gray-200"
                      )}>
                        <User className={cn(
                          "h-4 w-4",
                          cardio.available ? "text-green-600" : "text-gray-500"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cardio.name}</p>
                        <p className="text-xs text-gray-500">{cardio.specialty}</p>
                      </div>
                    </div>
                    <Badge variant={cardio.available ? "default" : "secondary"} className="text-xs">
                      {cardio.available ? `${cardio.currentLoad} ECG` : 'Occupé'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rapports prêts à envoyer */}
      {readyToSend.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Rapports prêts à envoyer
              <Badge variant="secondary" className="ml-2">{counts.ready_to_send}</Badge>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/secretaire/send-reports')}
            >
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {readyToSend.map(ecg => (
                <div 
                  key={ecg.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    ecg.urgency === 'urgent' 
                      ? "bg-red-50 border-red-200" 
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-medium">{ecg.id}</span>
                    {ecg.urgency === 'urgent' && (
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                  </div>
                  <p className="font-medium text-sm">{ecg.patientName}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Pour: {ecg.referringDoctor}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700 h-7 text-xs"
                    onClick={() => navigate('/secretaire/send-reports')}
                  >
                    <Send className="h-3 w-3 mr-1.5" />
                    Envoyer
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats de la journée */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Statistiques du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{todayStats.received}</p>
              <p className="text-sm text-gray-500">Reçus</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{todayStats.validated}</p>
              <p className="text-sm text-gray-500">Validés</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{todayStats.assigned}</p>
              <p className="text-sm text-gray-500">Assignés</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{todayStats.sent}</p>
              <p className="text-sm text-gray-500">Envoyés</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">{todayStats.avgTime}</p>
              <p className="text-sm text-gray-500">Temps moyen</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Flux du jour</span>
              <span className="font-medium">
                {Math.round((todayStats.sent / todayStats.received) * 100)}% traités
              </span>
            </div>
            <Progress value={(todayStats.sent / todayStats.received) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1.5 hover:bg-amber-50/50 hover:border-amber-300/70 border-border/60 transition-all duration-200"
          onClick={() => navigate('/secretaire/inbox')}
        >
          <Inbox className="h-6 w-6 text-amber-600" />
          <span className="text-sm font-medium">Réception</span>
          <span className="text-[10px] text-slate-500">{counts.received} en attente</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1.5 hover:bg-blue-50/50 hover:border-blue-300/70 border-border/60 transition-all duration-200"
          onClick={() => navigate('/secretaire/assign')}
        >
          <UserCog className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium">Assignation</span>
          <span className="text-[10px] text-slate-500">{counts.validated} à assigner</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1.5 hover:bg-emerald-50/50 hover:border-emerald-300/70 border-border/60 transition-all duration-200"
          onClick={() => navigate('/secretaire/send-reports')}
        >
          <Send className="h-6 w-6 text-emerald-600" />
          <span className="text-sm font-medium">Envoi rapports</span>
          <span className="text-[10px] text-slate-500">{counts.ready_to_send} prêts</span>
        </Button>
      </div>
    </div>
  );
}
