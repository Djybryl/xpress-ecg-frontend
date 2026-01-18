import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  TrendingUp,
  User,
  Building2,
  ChevronRight,
  Play,
  Calendar,
  Zap,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCardiologueStore } from '@/stores/useCardiologueStore';
import { format, parseISO, formatDistanceToNow, startOfWeek, endOfWeek, isWithinInterval, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function CardiologueDashboard() {
  const navigate = useNavigate();
  const { getPending, getUrgent, getInProgress, getCompleted, getCounts, startAnalysis } = useCardiologueStore();

  const pendingECGs = getPending();
  const urgentECGs = getUrgent();
  const inProgressECGs = getInProgress();
  const completedECGs = getCompleted();
  const counts = getCounts();

  // Calcul du temps moyen d'analyse (mocked)
  const avgAnalysisTime = completedECGs.length > 0 
    ? Math.round(completedECGs.reduce((acc, ecg) => {
        if (ecg.dateStarted && ecg.dateCompleted) {
          return acc + differenceInMinutes(parseISO(ecg.dateCompleted), parseISO(ecg.dateStarted));
        }
        return acc;
      }, 0) / completedECGs.length)
    : 0;

  // Stats de la semaine
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyCompleted = completedECGs.filter(e => 
    e.dateCompleted && isWithinInterval(parseISO(e.dateCompleted), { start: thisWeekStart, end: thisWeekEnd })
  ).length;

  const handleStartAnalysis = (ecgId: string) => {
    startAnalysis(ecgId);
    navigate(`/cardiologue/analyze/${ecgId}`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-500 mt-1">
            Bienvenue, Dr. Sophie Bernard
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </div>
      </div>

      {/* Alertes urgentes */}
      {urgentECGs.length > 0 && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">
                    {urgentECGs.length} ECG urgent(s) à analyser
                  </h3>
                  <p className="text-sm text-red-600">
                    Ces ECG nécessitent une attention immédiate
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive"
                onClick={() => handleStartAnalysis(urgentECGs[0].id)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Traiter le premier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          onClick={() => navigate('/cardiologue/pending')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">En attente</p>
                <p className="text-3xl font-bold text-amber-700">{counts.pending}</p>
                <p className="text-xs text-amber-500 mt-1">
                  {counts.urgent > 0 && `dont ${counts.urgent} urgent(s)`}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                <Inbox className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">En cours</p>
                <p className="text-3xl font-bold text-blue-700">{counts.inProgress}</p>
                <p className="text-xs text-blue-500 mt-1">
                  Analyse en cours
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          onClick={() => navigate('/cardiologue/completed')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Aujourd'hui</p>
                <p className="text-3xl font-bold text-green-700">{counts.today}</p>
                <p className="text-xs text-green-500 mt-1">
                  ECG analysés
                </p>
              </div>
              <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Temps moyen</p>
                <p className="text-3xl font-bold text-purple-700">{avgAnalysisTime}m</p>
                <p className="text-xs text-purple-500 mt-1">
                  Par analyse
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ECG en attente */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Inbox className="h-5 w-5 text-amber-600" />
              ECG en attente
              {counts.pending > 0 && (
                <Badge variant="secondary" className="ml-2">{counts.pending}</Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/cardiologue/pending')}
            >
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {pendingECGs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-300" />
                <p>Aucun ECG en attente</p>
                <p className="text-sm">Vous êtes à jour !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingECGs.slice(0, 5).map(ecg => (
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
                          <span className="font-mono text-xs text-gray-500">{ecg.id}</span>
                          <p className="font-medium">{ecg.patientName}</p>
                          {ecg.urgency === 'urgent' && (
                            <Badge className="bg-red-100 text-red-700 text-xs animate-pulse">URGENT</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {ecg.patientAge} ans • {ecg.referringDoctor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(parseISO(ecg.dateAssigned), { addSuffix: true, locale: fr })}
                      </span>
                      <Button 
                        size="sm"
                        onClick={() => handleStartAnalysis(ecg.id)}
                        className={cn(
                          ecg.urgency === 'urgent' 
                            ? "bg-red-600 hover:bg-red-700" 
                            : "bg-indigo-600 hover:bg-indigo-700"
                        )}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Analyser
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques de la semaine */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Résumé */}
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-4xl font-bold text-indigo-600">{weeklyCompleted}</p>
              <p className="text-sm text-indigo-500">ECG analysés</p>
            </div>

            {/* Répartition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Normaux</span>
                <span className="text-sm font-medium text-green-600">
                  {completedECGs.filter(e => e.interpretation?.isNormal).length}
                </span>
              </div>
              <Progress 
                value={
                  counts.completed > 0 
                    ? (completedECGs.filter(e => e.interpretation?.isNormal).length / counts.completed) * 100 
                    : 0
                } 
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Anormaux</span>
                <span className="text-sm font-medium text-amber-600">
                  {completedECGs.filter(e => !e.interpretation?.isNormal).length}
                </span>
              </div>
              <Progress 
                value={
                  counts.completed > 0 
                    ? (completedECGs.filter(e => !e.interpretation?.isNormal).length / counts.completed) * 100 
                    : 0
                } 
                className="h-2 [&>div]:bg-amber-500"
              />
            </div>

            {/* Performance */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Objectif quotidien</span>
                <span className="font-medium">10 ECG</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Progression aujourd'hui</span>
                <span className="font-medium text-green-600">{counts.today}/10</span>
              </div>
              <Progress value={(counts.today / 10) * 100} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ECG en cours d'analyse */}
      {inProgressECGs.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
              <Clock className="h-5 w-5" />
              Analyse en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inProgressECGs.map(ecg => (
                <div 
                  key={ecg.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500">{ecg.id}</span>
                        <p className="font-medium">{ecg.patientName}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Démarré {ecg.dateStarted && formatDistanceToNow(parseISO(ecg.dateStarted), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/cardiologue/analyze/${ecg.id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continuer
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-amber-50 hover:border-amber-300"
          onClick={() => navigate('/cardiologue/pending')}
        >
          <Inbox className="h-8 w-8 text-amber-600" />
          <span className="font-medium">ECG en attente</span>
          <span className="text-xs text-gray-500">{counts.pending} à analyser</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-red-50 hover:border-red-300"
          onClick={() => navigate('/cardiologue/urgent')}
        >
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <span className="font-medium">ECG urgents</span>
          <span className="text-xs text-gray-500">{counts.urgent} urgent(s)</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
          onClick={() => navigate('/cardiologue/completed')}
        >
          <CheckCircle2 className="h-8 w-8 text-green-600" />
          <span className="font-medium">ECG terminés</span>
          <span className="text-xs text-gray-500">{counts.completed} analysés</span>
        </Button>
      </div>
    </div>
  );
}
