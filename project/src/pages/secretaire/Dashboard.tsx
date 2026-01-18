import { useEffect, useState } from 'react';
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
  AlertCircle,
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
import { useECGQueueStore, cardiologists } from '@/stores/useECGQueueStore';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function SecretaireDashboard() {
  const navigate = useNavigate();
  const { queue, getCounts, getByStatus } = useECGQueueStore();
  const counts = getCounts();
  const [statsOpen, setStatsOpen] = useState(true);

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
    <div className="p-4 space-y-3">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            Tableau de bord
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
                  <span className="text-xl font-bold text-amber-600">{counts.received}</span>
                  <span className="text-xs text-gray-500">À valider</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-blue-600">{counts.validated}</span>
                  <span className="text-xs text-gray-500">À assigner</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-emerald-600">{counts.ready_to_send}</span>
                  <span className="text-xs text-gray-500">À envoyer</span>
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
                className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-amber-50/80 to-transparent border-amber-200/60"
                onClick={() => navigate('/secretaire/inbox')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-600 text-xs font-medium">À valider</p>
                      <p className="text-xl font-bold text-amber-700">{counts.received}</p>
                      {counts.urgent > 0 && (
                        <p className="text-[9px] text-amber-500 mt-0.5">
                          {urgentPending.filter(e => e.status === 'received').length} urgent(s)
                        </p>
                      )}
                    </div>
                    <Inbox className="h-5 w-5 text-amber-400" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-50/80 to-transparent border-blue-200/60"
                onClick={() => navigate('/secretaire/assign')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-xs font-medium">À assigner</p>
                      <p className="text-xl font-bold text-blue-700">{counts.validated}</p>
                      {urgentPending.filter(e => e.status === 'validated').length > 0 && (
                        <p className="text-[9px] text-blue-500 mt-0.5">
                          {urgentPending.filter(e => e.status === 'validated').length} urgent(s)
                        </p>
                      )}
                    </div>
                    <UserCog className="h-5 w-5 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-emerald-50/80 to-transparent border-emerald-200/60"
                onClick={() => navigate('/secretaire/send-reports')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-xs font-medium">À envoyer</p>
                      <p className="text-xl font-bold text-emerald-700">{counts.ready_to_send}</p>
                      <p className="text-[9px] text-emerald-500 mt-0.5">Rapports prêts</p>
                    </div>
                    <Send className="h-5 w-5 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-50/80 to-transparent border-violet-200/60">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-600 text-xs font-medium">En cours</p>
                      <p className="text-xl font-bold text-violet-700">
                        {(counts.assigned || 0) + (counts.analyzing || 0)}
                      </p>
                      <p className="text-[9px] text-violet-500 mt-0.5">En analyse</p>
                    </div>
                    <Activity className="h-5 w-5 text-violet-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Alertes urgentes */}
      {urgentPending.length > 0 && (
        <Card className="border-red-200/60 bg-gradient-to-r from-red-50/80 to-red-50/30">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-red-800">
                    {urgentPending.length} ECG urgent(s) en attente
                  </h3>
                  <p className="text-[10px] text-red-600">À traiter en priorité</p>
                </div>
              </div>
              <Button 
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={() => navigate('/secretaire/inbox')}
              >
                Traiter
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ECG récemment reçus */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Inbox className="h-4 w-4 text-amber-600" />
              ECG récemment reçus
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => navigate('/secretaire/inbox')}
            >
              Voir tout
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentReceived.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Inbox className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p>Aucun ECG en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReceived.map(ecg => (
                  <div 
                    key={ecg.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      ecg.urgency === 'urgent' 
                        ? "bg-red-50 border-red-200" 
                        : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        ecg.urgency === 'urgent' ? "bg-red-200" : "bg-gray-200"
                      )}>
                        <User className={cn(
                          "h-5 w-5",
                          ecg.urgency === 'urgent' ? "text-red-600" : "text-gray-600"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{ecg.patientName}</p>
                          {ecg.urgency === 'urgent' && (
                            <Badge className="bg-red-100 text-red-700 text-xs">URGENT</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {ecg.referringDoctor} • {ecg.hospital}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(parseISO(ecg.dateReceived), { addSuffix: true, locale: fr })}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1"
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readyToSend.map(ecg => (
                <div 
                  key={ecg.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    ecg.urgency === 'urgent' 
                      ? "bg-red-50 border-red-200" 
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-medium">{ecg.id}</span>
                    {ecg.urgency === 'urgent' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="font-medium">{ecg.patientName}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    Pour: {ecg.referringDoctor}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => navigate('/secretaire/send-reports')}
                  >
                    <Send className="h-3 w-3 mr-2" />
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

      {/* Actions rapides - Compact */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="h-auto px-3 py-2 flex items-center gap-2 hover:bg-amber-50/50 hover:border-amber-300/70"
          onClick={() => navigate('/secretaire/inbox')}
        >
          <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center">
            <Inbox className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-xs text-slate-800">Réception</h3>
            <p className="text-[10px] text-slate-500">{counts.received} en attente</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto px-3 py-2 flex items-center gap-2 hover:bg-blue-50/50 hover:border-blue-300/70"
          onClick={() => navigate('/secretaire/assign')}
        >
          <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
            <UserCog className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-xs text-slate-800">Assignation</h3>
            <p className="text-[10px] text-slate-500">{counts.validated} à assigner</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto px-3 py-2 flex items-center gap-2 hover:bg-emerald-50/50 hover:border-emerald-300/70"
          onClick={() => navigate('/secretaire/send-reports')}
        >
          <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
            <Send className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-xs text-slate-800">Envoi rapports</h3>
            <p className="text-[10px] text-slate-500">{counts.ready_to_send} prêts</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
