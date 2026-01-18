import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
  Play,
  Calendar,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Users
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCardiologueStore } from '@/stores/useCardiologueStore';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Données mock des établissements
const establishments = [
  { id: 'all', name: 'Tous les établissements', count: 34 },
  { id: 'hsl', name: 'Hôpital Saint-Louis', count: 12 },
  { id: 'cds', name: 'Clinique du Sport', count: 5 },
  { id: 'ccp', name: 'Centre Cardio Paris', count: 8 },
  { id: 'ha', name: 'Hôpital Américain', count: 3 },
  { id: 'icp', name: 'Institut Cœur Paris', count: 6 },
];

export function CardiologueDashboard() {
  const navigate = useNavigate();
  const { getPending, getUrgent, getInProgress, getCompleted, getCounts, startAnalysis } = useCardiologueStore();

  const [selectedEstablishment, setSelectedEstablishment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [statsOpen, setStatsOpen] = useState(true);

  const pendingECGs = getPending();
  const urgentECGs = getUrgent();
  const inProgressECGs = getInProgress();
  const completedECGs = getCompleted();
  const counts = getCounts();

  // Calcul des ECG non interprétés (pending + in progress)
  const notInterpreted = counts.pending + counts.inProgress;

  const handleStartAnalysis = (ecgId: string) => {
    startAnalysis(ecgId);
    navigate(`/cardiologue/analyze/${ecgId}`);
  };

  // Filtrer les ECG par recherche
  const filteredECGs = pendingECGs.filter(ecg => {
    const matchSearch = searchTerm === '' || 
      ecg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const getStatusBadge = (status: string, urgency?: string) => {
    if (urgency === 'urgent') {
      return <Badge className="bg-red-500 text-white text-[10px] px-2">URGENT</Badge>;
    }
    if (urgency === 'critical') {
      return <Badge className="bg-red-700 text-white text-[10px] px-2">CRITICAL</Badge>;
    }
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 text-[10px] px-2">En attente</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 text-[10px] px-2">En cours</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 text-[10px] px-2">Validé</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Établissements */}
      <aside className="w-56 border-r border-border/40 bg-background/50 flex-shrink-0 overflow-y-auto">
        <div className="p-3">
          {/* Section Nouveaux ECG */}
          <nav className="space-y-0.5">
            <button
              onClick={() => navigate('/cardiologue/pending')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-indigo-50 text-indigo-700 bg-indigo-50/50"
            >
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                <span>Nouveaux ECG</span>
              </div>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-[10px]">{counts.pending}</Badge>
            </button>

            <button
              onClick={() => navigate('/cardiologue/urgent')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-red-50 text-gray-700"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>ECG urgents</span>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px]">{counts.urgent}</Badge>
            </button>

            <button
              onClick={() => navigate('/cardiologue/second-opinion')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-100 text-gray-700"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Second Avis</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">1</Badge>
            </button>
          </nav>

          {/* Section Établissements */}
          <div className="mt-4 pt-4 border-t border-border/40">
            <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Établissements
            </p>
            <nav className="space-y-0.5">
              {establishments.slice(1).map(est => (
                <button
                  key={est.id}
                  onClick={() => setSelectedEstablishment(est.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                    selectedEstablishment === est.id
                      ? "bg-gray-100 text-gray-900"
                      : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  <span className="truncate">{est.name}</span>
                  <span className="text-[11px] text-gray-400">{est.count}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {/* Header avec stats compactes inline - épuré */}
          <div className="flex items-center justify-between">
            <Collapsible open={statsOpen} onOpenChange={setStatsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-indigo-600">{counts.pending}</span>
                      <span className="text-xs text-gray-500">Reçus</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-green-600">{counts.today}</span>
                      <span className="text-xs text-gray-500">Analysés</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-blue-600">{counts.completed}</span>
                      <span className="text-xs text-gray-500">Envoyés</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-amber-600">{notInterpreted}</span>
                      <span className="text-xs text-gray-500">Non interprétés</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-3 w-3 text-gray-400 transition-transform",
                      statsOpen && "rotate-180"
                    )} />
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="grid grid-cols-4 gap-2">
                  <Card className="bg-gradient-to-br from-indigo-50/80 to-transparent border-indigo-200/60">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-indigo-600 text-xs font-medium">Reçus</p>
                          <p className="text-xl font-bold text-indigo-700">{counts.pending}</p>
                        </div>
                        <Inbox className="h-5 w-5 text-indigo-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50/80 to-transparent border-green-200/60">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-xs font-medium">Analysés aujourd'hui</p>
                          <p className="text-xl font-bold text-green-700">{counts.today}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50/80 to-transparent border-blue-200/60">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-xs font-medium">Envoyés</p>
                          <p className="text-xl font-bold text-blue-700">{counts.completed}</p>
                        </div>
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-50/80 to-transparent border-amber-200/60">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-600 text-xs font-medium">Non interprétés</p>
                          <p className="text-xl font-bold text-amber-700">{notInterpreted}</p>
                        </div>
                        <Clock className="h-5 w-5 text-amber-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex items-center gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerte urgents */}
          {urgentECGs.length > 0 && (
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-transparent">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-800 text-sm">
                        {urgentECGs.length} ECG urgent(s) en attente
                      </p>
                      <p className="text-xs text-red-600">Nécessite une attention immédiate</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 h-8 text-xs"
                    onClick={() => handleStartAnalysis(urgentECGs[0].id)}
                  >
                    Traiter maintenant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Barre de recherche et filtres */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un patient, ECG..."
                className="pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-1" />
              Filtres
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualiser
            </Button>
          </div>

          {/* Titre section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-900">Nouveaux ECG en attente</h2>
            </div>
            <span className="text-sm text-gray-500">{filteredECGs.length} résultats</span>
          </div>

          {/* Tableau des ECG */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-gray-50/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Établissement</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Heure</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredECGs.map((ecg) => (
                    <tr 
                      key={ecg.id} 
                      className={cn(
                        "hover:bg-gray-50/50 transition-colors",
                        ecg.urgency === 'urgent' && "bg-red-50/30"
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm text-indigo-600 font-medium">{ecg.id}</span>
                          {ecg.urgency === 'urgent' && (
                            <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 w-fit mt-0.5">
                              ⚡ URGENT
                            </Badge>
                          )}
                          {ecg.urgency === 'critical' && (
                            <Badge className="bg-red-700 text-white text-[9px] px-1.5 py-0 w-fit mt-0.5">
                              ⚡ CRITICAL
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                            ecg.patientGender === 'M' 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-pink-100 text-pink-700"
                          )}>
                            {ecg.patientGender === 'M' ? 'M' : 'F'}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{ecg.patientName}</p>
                            <p className="text-xs text-gray-500">{ecg.patientAge} ans</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">{ecg.hospital}</p>
                          <p className="text-xs text-gray-500">{ecg.referringDoctor}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {format(parseISO(ecg.dateAssigned), 'dd MMM yyyy', { locale: fr })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(parseISO(ecg.dateAssigned), 'HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(ecg.status, ecg.urgency)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStartAnalysis(ecg.id)}
                            title="Analyser"
                          >
                            <FileText className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Aperçu"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Copier"
                          >
                            <FileText className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Exemples supplémentaires pour remplir le tableau */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-indigo-600 font-medium">ECG-2025-0411</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-pink-100 text-pink-700">F</div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">Marie Laurent</p>
                          <p className="text-xs text-gray-500">47 ans</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">Clinique du Sport</p>
                        <p className="text-xs text-gray-500">Dr. Sophie Bernard</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{format(new Date(), 'dd MMM yyyy', { locale: fr })}</p>
                        <p className="text-xs text-gray-500">10:01</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-blue-100 text-blue-700 text-[10px] px-2">En cours</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-indigo-600 font-medium">ECG-2025-0410</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-blue-100 text-blue-700">M</div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">Jean-Paul Mercier</p>
                          <p className="text-xs text-gray-500">74 ans</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">Centre Cardio Paris</p>
                        <p className="text-xs text-gray-500">Dr. François Dubois</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{format(new Date(), 'dd MMM yyyy', { locale: fr })}</p>
                        <p className="text-xs text-gray-500">08:01</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-100 text-green-700 text-[10px] px-2">Validé</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50/50 transition-colors bg-red-50/30">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-indigo-600 font-medium">ECG-2025-0409</span>
                        <Badge className="bg-red-700 text-white text-[9px] px-1.5 py-0 w-fit mt-0.5">
                          ⚡ CRITICAL
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-pink-100 text-pink-700">F</div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">Élise Moreau</p>
                          <p className="text-xs text-gray-500">57 ans</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">Hôpital Saint-Louis</p>
                        <p className="text-xs text-gray-500">Dr. Jean Martin</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{format(new Date(), 'dd MMM yyyy', { locale: fr })}</p>
                        <p className="text-xs text-gray-500">07:01</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-amber-100 text-amber-700 text-[10px] px-2">En attente</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
