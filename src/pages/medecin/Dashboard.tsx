import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
    <div className="space-y-4">
      {/* En-tête avec titre + badge urgents + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold text-slate-800">Tableau de bord</h1>
          {urgentUnreadCount > 0 && (
            <button
              className="flex items-center gap-1 px-2 py-0.5 bg-red-100 border border-red-300 rounded-full text-xs font-semibold text-red-700 animate-pulse hover:bg-red-200 transition-colors"
              onClick={() => navigate('/medecin/reports')}
            >
              <AlertCircle className="h-3 w-3" />
              {urgentUnreadCount} urgent{urgentUnreadCount > 1 ? 's' : ''} non lu{urgentUnreadCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-dashed border-indigo-300/70 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-400 transition-all group text-xs"
            onClick={() => navigate('/medecin/requests')}
          >
            <FileText className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-medium text-slate-700">Mes demandes</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-200/60 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-300 transition-all group text-xs"
            onClick={() => navigate('/medecin/patients')}
          >
            <User className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-medium text-slate-700">Patients</span>
          </button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs"
            onClick={() => navigate('/medecin/new-ecg')}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nouvel ECG
          </Button>
        </div>
      </div>

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

      {/* Card unifiée : Rapports non lus + Demandes récentes */}
      <Card>
        <CardHeader className="border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <>
                  <Bell className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm font-medium">
                    Rapports reçus
                    <Badge className="ml-2 bg-amber-100 text-amber-700 text-[10px] px-1.5">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</Badge>
                  </CardTitle>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 text-slate-400" />
                  <CardTitle className="text-sm font-medium">Demandes récentes</CardTitle>
                </>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate(unreadCount > 0 ? '/medecin/reports' : '/medecin/requests')}>
              Voir tout <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Rapports non lus (si présents) */}
          {unreadCount > 0 && (
            <div className="divide-y divide-amber-100/50 border-b">
              {unreadReports.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 hover:bg-amber-50/50 cursor-pointer transition-colors",
                    report.isUrgent && "bg-red-50/40 hover:bg-red-50"
                  )}
                  onClick={() => navigate(`/medecin/reports/${report.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", report.isUrgent ? "bg-red-500 animate-pulse" : "bg-amber-500")} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-slate-800">{report.patientName}</p>
                        {report.isUrgent && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">URGENT</Badge>}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate max-w-[280px]">{report.conclusion}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
          {/* Demandes récentes */}
          <div className="divide-y divide-border/30">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-slate-50/80 cursor-pointer transition-colors"
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
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Urgent</Badge>
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
  );
}
