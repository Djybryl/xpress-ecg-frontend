import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Plus,
  Calendar,
  Bell,
  User
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReportStore } from '@/stores/useReportStore';
import { cn } from '@/lib/utils';

// Types
interface ECGRequest {
  id: string;
  patient_name: string;
  date: string;
  status: 'pending' | 'analyzing' | 'completed';
  urgency: 'normal' | 'urgent';
}

// Données mockées
const mockRequests: ECGRequest[] = [
  {
    id: 'ECG-2024-0409',
    patient_name: 'Pierre Dupont',
    date: '2024-12-25',
    status: 'pending',
    urgency: 'normal'
  },
  {
    id: 'ECG-2024-0408',
    patient_name: 'Marie Laurent',
    date: '2024-12-25',
    status: 'analyzing',
    urgency: 'urgent'
  },
  {
    id: 'ECG-2024-0407',
    patient_name: 'Jean-Paul Mercier',
    date: '2024-12-24',
    status: 'completed',
    urgency: 'normal'
  },
  {
    id: 'ECG-2024-0406',
    patient_name: 'Élise Moreau',
    date: '2024-12-24',
    status: 'completed',
    urgency: 'normal'
  },
];

const mockStats = {
  pending: 3,
  analyzing: 2,
  completed: 15,
  total: 20
};

export function MedecinDashboard() {
  const navigate = useNavigate();
  const [requests] = useState<ECGRequest[]>(mockRequests);
  const { reports, unreadCount, urgentUnreadCount } = useReportStore();

  // Rapports non lus
  const unreadReports = reports.filter(r => !r.isRead).slice(0, 3);

  const getStatusIcon = (status: ECGRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'analyzing':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusLabel = (status: ECGRequest['status']) => {
    const labels = {
      pending: 'En attente',
      analyzing: 'En analyse',
      completed: 'Terminé'
    };
    return labels[status];
  };

  const getStatusColor = (status: ECGRequest['status']) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      analyzing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-5">
      {/* En-tête avec action rapide */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Tableau de bord</h1>
          <p className="text-sm text-slate-500">Bienvenue, suivez vos demandes d'interprétation ECG</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 h-9 text-sm"
          onClick={() => navigate('/medecin/new-ecg')}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nouvel ECG
        </Button>
      </div>

      {/* Alerte rapports urgents */}
      {urgentUnreadCount > 0 && (
        <div className="bg-red-50/80 border border-red-200/60 rounded-md p-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                {urgentUnreadCount} rapport{urgentUnreadCount > 1 ? 's' : ''} urgent{urgentUnreadCount > 1 ? 's' : ''} à consulter
              </p>
              <p className="text-xs text-red-600">
                Action immédiate requise
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              className="h-8 text-xs"
              onClick={() => navigate('/medecin/reports')}
            >
              Voir maintenant
            </Button>
          </div>
        </div>
      )}

      {/* Cartes statistiques - Ultra compact */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-50/60 border border-amber-200/50">
          <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-amber-700 leading-none">{mockStats.pending}</p>
            <p className="text-[10px] text-amber-600 truncate">En attente</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-md bg-blue-50/60 border border-blue-200/50">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-blue-700 leading-none">{mockStats.analyzing}</p>
            <p className="text-[10px] text-blue-600 truncate">En cours</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-md bg-emerald-50/60 border border-emerald-200/50">
          <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-emerald-700 leading-none">{mockStats.completed}</p>
            <p className="text-[10px] text-emerald-600 truncate">Terminés</p>
          </div>
        </div>

        <div 
          className={cn(
            "flex items-center gap-2 p-2.5 rounded-md cursor-pointer hover:shadow-sm transition-all",
            unreadCount > 0 ? "bg-red-50/60 border border-red-200/50" : "bg-indigo-50/60 border border-indigo-200/50"
          )}
          onClick={() => navigate('/medecin/reports')}
        >
          <div className={cn("w-8 h-8 rounded flex items-center justify-center flex-shrink-0", unreadCount > 0 ? "bg-red-100" : "bg-indigo-100")}>
            <Bell className={cn("h-4 w-4", unreadCount > 0 ? "text-red-600" : "text-indigo-600")} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className={cn("text-lg font-bold leading-none", unreadCount > 0 ? "text-red-700" : "text-indigo-700")}>{unreadCount}</p>
              {unreadCount > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <p className={cn("text-[10px] truncate", unreadCount > 0 ? "text-red-600" : "text-indigo-600")}>Non lus</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-md bg-slate-50/60 border border-slate-200/50">
          <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
            <Calendar className="h-4 w-4 text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-700 leading-none">{mockStats.total}</p>
            <p className="text-[10px] text-slate-600 truncate">Ce mois</p>
          </div>
        </div>
      </div>

      {/* Actions rapides - Format horizontal compact */}
      <div className="flex flex-wrap gap-2">
        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-indigo-300/70 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-400 transition-all group"
          onClick={() => navigate('/medecin/new-ecg')}
        >
          <div className="w-7 h-7 bg-indigo-100 rounded flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-slate-700">Envoyer un ECG</p>
            <p className="text-[10px] text-slate-500">Nouvelle demande</p>
          </div>
        </button>

        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-amber-200/60 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-300 transition-all group"
          onClick={() => navigate('/medecin/requests')}
        >
          <div className="w-7 h-7 bg-amber-100 rounded flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-slate-700">Mes demandes</p>
            <p className="text-[10px] text-slate-500">Suivre mes ECG</p>
          </div>
        </button>

        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-emerald-200/60 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-300 transition-all group"
          onClick={() => navigate('/medecin/patients')}
        >
          <div className="w-7 h-7 bg-emerald-100 rounded flex items-center justify-center group-hover:scale-105 transition-transform">
            <User className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-slate-700">Mes patients</p>
            <p className="text-[10px] text-slate-500">Historique</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rapports à consulter */}
        {unreadCount > 0 && (
          <Card className="border-amber-200/60 bg-amber-50/20">
            <CardHeader className="border-b border-amber-100/60 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-600" />
                  Rapports à consulter
                  <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5">{unreadCount}</Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/medecin/reports')}>
                  Voir tout
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-amber-100/50">
                {unreadReports.map((report) => (
                  <div
                    key={report.id}
                    className={cn(
                      "flex items-center justify-between p-3 hover:bg-amber-50/50 cursor-pointer transition-colors",
                      report.isUrgent && "bg-red-50/50 hover:bg-red-50"
                    )}
                    onClick={() => navigate(`/medecin/reports/${report.id}`)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        report.isUrgent ? "bg-red-500 animate-pulse" : "bg-amber-500"
                      )} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-slate-800">{report.patientName}</p>
                          {report.isUrgent && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">URGENT</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-[220px]">
                          {report.conclusion}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des demandes récentes */}
        <Card className={unreadCount === 0 ? 'lg:col-span-2' : ''}>
          <CardHeader className="border-b border-border/40 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Demandes récentes</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/medecin/requests')}>
                Voir tout
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-2 hover:bg-slate-50/80 cursor-pointer transition-colors"
                  onClick={() => navigate('/medecin/requests')}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="text-xs font-medium text-slate-800">{request.patient_name}</p>
                      <p className="text-[10px] text-slate-500">{request.id} • {formatDate(request.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {request.urgency === 'urgent' && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        Urgent
                      </Badge>
                    )}
                    <Badge className={cn("text-[10px] px-1.5 py-0.5", getStatusColor(request.status))}>
                      {getStatusLabel(request.status)}
                    </Badge>
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
