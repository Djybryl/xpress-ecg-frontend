import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  Inbox,
  Activity,
  MessageSquare,
  RefreshCw,
  Calendar,
  User,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface ECGRequest {
  id: string;
  patient_name: string;
  patient_id?: string;
  patient_gender: 'M' | 'F';
  patient_age: number;
  date_sent: string;
  date_received?: string;
  date_analyzing?: string;
  date_completed?: string;
  status: 'pending' | 'received' | 'analyzing' | 'completed';
  urgency: 'normal' | 'urgent';
  cardiologist?: string;
  clinical_context?: string;
  ecg_date: string;
}

// Données mockées enrichies
const mockRequests: ECGRequest[] = [
  {
    id: 'ECG-2024-0412',
    patient_name: 'Sophie Martin',
    patient_id: 'PAT-006',
    patient_gender: 'F',
    patient_age: 45,
    date_sent: '2024-12-25T14:30:00',
    status: 'pending',
    urgency: 'urgent',
    clinical_context: 'Douleur thoracique atypique, facteurs de risque cardiovasculaires',
    ecg_date: '2024-12-25'
  },
  {
    id: 'ECG-2024-0411',
    patient_name: 'Lucas Bernard',
    patient_id: 'PAT-007',
    patient_gender: 'M',
    patient_age: 62,
    date_sent: '2024-12-25T11:00:00',
    date_received: '2024-12-25T11:05:00',
    status: 'received',
    urgency: 'normal',
    clinical_context: 'Bilan pré-opératoire',
    ecg_date: '2024-12-25'
  },
  {
    id: 'ECG-2024-0409',
    patient_name: 'Pierre Dupont',
    patient_id: 'PAT-001',
    patient_gender: 'M',
    patient_age: 58,
    date_sent: '2024-12-25T08:30:00',
    date_received: '2024-12-25T08:35:00',
    date_analyzing: '2024-12-25T09:00:00',
    status: 'analyzing',
    urgency: 'normal',
    cardiologist: 'Dr. Sophie Bernard',
    clinical_context: 'Suivi annuel, antécédent HTA',
    ecg_date: '2024-12-25'
  },
  {
    id: 'ECG-2024-0408',
    patient_name: 'Marie Laurent',
    patient_id: 'PAT-002',
    patient_gender: 'F',
    patient_age: 35,
    date_sent: '2024-12-24T16:00:00',
    date_received: '2024-12-24T16:05:00',
    date_analyzing: '2024-12-24T16:30:00',
    status: 'analyzing',
    urgency: 'urgent',
    cardiologist: 'Dr. Sophie Bernard',
    clinical_context: 'Palpitations fréquentes depuis 1 semaine',
    ecg_date: '2024-12-24'
  },
  {
    id: 'ECG-2024-0407',
    patient_name: 'Jean-Paul Mercier',
    patient_id: 'PAT-003',
    patient_gender: 'M',
    patient_age: 71,
    date_sent: '2024-12-24T14:20:00',
    date_received: '2024-12-24T14:25:00',
    date_analyzing: '2024-12-24T15:00:00',
    date_completed: '2024-12-24T16:45:00',
    status: 'completed',
    urgency: 'normal',
    cardiologist: 'Dr. Sophie Bernard',
    clinical_context: 'Contrôle après ajustement traitement',
    ecg_date: '2024-12-24'
  },
  {
    id: 'ECG-2024-0406',
    patient_name: 'Élise Moreau',
    patient_id: 'PAT-004',
    patient_gender: 'F',
    patient_age: 28,
    date_sent: '2024-12-24T11:00:00',
    date_received: '2024-12-24T11:10:00',
    date_analyzing: '2024-12-24T12:00:00',
    date_completed: '2024-12-24T13:30:00',
    status: 'completed',
    urgency: 'normal',
    cardiologist: 'Dr. François Dubois',
    clinical_context: 'Bilan sportif',
    ecg_date: '2024-12-24'
  },
  {
    id: 'ECG-2024-0405',
    patient_name: 'Robert Petit',
    patient_id: 'PAT-005',
    patient_gender: 'M',
    patient_age: 76,
    date_sent: '2024-12-23T16:30:00',
    date_received: '2024-12-23T16:35:00',
    date_analyzing: '2024-12-23T17:00:00',
    date_completed: '2024-12-23T18:00:00',
    status: 'completed',
    urgency: 'urgent',
    cardiologist: 'Dr. Sophie Bernard',
    clinical_context: 'Dyspnée d\'effort récente',
    ecg_date: '2024-12-23'
  },
];

// Composant Timeline
function StatusTimeline({ request }: { request: ECGRequest }) {
  const steps = [
    { 
      key: 'sent', 
      label: 'Envoyé', 
      date: request.date_sent,
      icon: Send,
      completed: true 
    },
    { 
      key: 'received', 
      label: 'Reçu', 
      date: request.date_received,
      icon: Inbox,
      completed: !!request.date_received 
    },
    { 
      key: 'analyzing', 
      label: 'En analyse', 
      date: request.date_analyzing,
      icon: Activity,
      completed: !!request.date_analyzing 
    },
    { 
      key: 'completed', 
      label: 'Terminé', 
      date: request.date_completed,
      icon: CheckCircle,
      completed: !!request.date_completed 
    },
  ];

  const formatTime = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="flex items-center justify-between py-4">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
              step.completed 
                ? 'bg-green-100 border-green-500 text-green-600' 
                : 'bg-gray-100 border-gray-300 text-gray-400'
            )}>
              <step.icon className="h-5 w-5" />
            </div>
            <p className={cn(
              'text-xs font-medium mt-2',
              step.completed ? 'text-green-700' : 'text-gray-500'
            )}>
              {step.label}
            </p>
            {step.date && (
              <p className="text-xs text-gray-400">
                {formatDate(step.date)} {formatTime(step.date)}
              </p>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              'flex-1 h-1 mx-2 rounded',
              steps[index + 1].completed ? 'bg-green-500' : 'bg-gray-200'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// Calcul du temps d'attente
function getWaitingTime(dateSent: string, status: string): { text: string; isLong: boolean } {
  if (status === 'completed') {
    return { text: '', isLong: false };
  }
  
  const sent = new Date(dateSent);
  const now = new Date();
  const diffMs = now.getTime() - sent.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  let text = '';
  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    text = `${days}j ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    text = `${diffHours}h ${diffMins}min`;
  } else {
    text = `${diffMins}min`;
  }
  
  // Plus de 4h = considéré comme long
  const isLong = diffHours >= 4;
  
  return { text, isLong };
}

export function RequestsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showRelanceDialog, setShowRelanceDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ECGRequest | null>(null);
  const [relanceMessage, setRelanceMessage] = useState('');
  const itemsPerPage = 10;

  // Filtrage
  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = 
      request.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const stats = {
    pending: mockRequests.filter(r => r.status === 'pending').length,
    received: mockRequests.filter(r => r.status === 'received').length,
    analyzing: mockRequests.filter(r => r.status === 'analyzing').length,
    completed: mockRequests.filter(r => r.status === 'completed').length,
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusIcon = (status: ECGRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'received':
        return <Inbox className="h-4 w-4 text-blue-500" />;
      case 'analyzing':
        return <Activity className="h-4 w-4 text-indigo-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusLabel = (status: ECGRequest['status']) => {
    const labels = {
      pending: 'En attente',
      received: 'Reçu',
      analyzing: 'En analyse',
      completed: 'Terminé'
    };
    return labels[status];
  };

  const getStatusColor = (status: ECGRequest['status']) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      received: 'bg-blue-100 text-blue-800',
      analyzing: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRelance = () => {
    if (!selectedRequest) return;
    
    toast({
      title: "Relance envoyée",
      description: `Une relance a été envoyée pour ${selectedRequest.id}.`
    });
    
    setShowRelanceDialog(false);
    setSelectedRequest(null);
    setRelanceMessage('');
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      title: "Export en cours",
      description: `Génération du fichier ${format.toUpperCase()}...`
    });
    // TODO: Implémenter l'export réel
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
          <p className="text-gray-500">Suivez l'état de vos demandes d'interprétation ECG</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Exporter en PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exporter en Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Onglets par statut */}
      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">
            Toutes ({mockRequests.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3 w-3" />
            Attente ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="received" className="gap-1">
            <Inbox className="h-3 w-3" />
            Reçu ({stats.received})
          </TabsTrigger>
          <TabsTrigger value="analyzing" className="gap-1">
            <Activity className="h-3 w-3" />
            Analyse ({stats.analyzing})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Terminé ({stats.completed})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tableau des demandes */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg">Liste des demandes</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {currentRequests.map((request) => {
              const isExpanded = expandedRows.has(request.id);
              const waitingTime = getWaitingTime(request.date_sent, request.status);
              
              return (
                <Collapsible
                  key={request.id}
                  open={isExpanded}
                  onOpenChange={() => toggleRow(request.id)}
                >
                  {/* Ligne principale */}
                  <div className={cn(
                    'flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors',
                    request.urgency === 'urgent' && request.status !== 'completed' && 'bg-red-50/50'
                  )}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                      {/* Patient */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{request.patient_name}</span>
                          {request.urgency === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.id} • {request.patient_gender === 'M' ? 'H' : 'F'}, {request.patient_age} ans
                        </p>
                      </div>

                      {/* Date d'envoi */}
                      <div>
                        <p className="text-sm text-gray-600">{formatDate(request.date_sent)}</p>
                      </div>

                      {/* Statut */}
                      <div>
                        <Badge className={cn('gap-1', getStatusColor(request.status))}>
                          {getStatusIcon(request.status)}
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>

                      {/* Temps d'attente */}
                      <div>
                        {waitingTime.text && (
                          <div className={cn(
                            'flex items-center gap-1 text-sm',
                            waitingTime.isLong ? 'text-red-600 font-medium' : 'text-gray-500'
                          )}>
                            <Clock className="h-3 w-3" />
                            {waitingTime.text}
                            {waitingTime.isLong && (
                              <AlertCircle className="h-3 w-3" />
                            )}
                          </div>
                        )}
                        {request.cardiologist && (
                          <p className="text-xs text-gray-500">{request.cardiologist}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-1">
                        {request.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/medecin/reports');
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Rapport
                          </Button>
                        )}
                        {(request.status === 'pending' || request.status === 'received') && waitingTime.isLong && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-300 hover:bg-amber-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(request);
                              setShowRelanceDialog(true);
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Relancer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contenu expandable */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 bg-gray-50 border-t">
                      {/* Timeline */}
                      <div className="py-4 border-b">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Suivi de la demande</h4>
                        <StatusTimeline request={request} />
                      </div>

                      {/* Détails */}
                      <div className="grid grid-cols-3 gap-6 pt-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Patient
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-500">Nom :</span> {request.patient_name}</p>
                            <p><span className="text-gray-500">ID :</span> {request.patient_id || '-'}</p>
                            <p><span className="text-gray-500">Sexe :</span> {request.patient_gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                            <p><span className="text-gray-500">Âge :</span> {request.patient_age} ans</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            ECG
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-500">Date ECG :</span> {new Date(request.ecg_date).toLocaleDateString('fr-FR')}</p>
                            <p><span className="text-gray-500">Envoyé le :</span> {formatDate(request.date_sent)}</p>
                            <p>
                              <span className="text-gray-500">Priorité :</span>{' '}
                              <Badge variant={request.urgency === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                                {request.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                              </Badge>
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Contexte clinique
                          </h4>
                          <p className="text-sm text-gray-600">
                            {request.clinical_context || 'Aucun contexte renseigné'}
                          </p>
                          {request.cardiologist && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm">
                                <span className="text-gray-500">Cardiologue :</span>{' '}
                                <span className="font-medium text-indigo-600">{request.cardiologist}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions détaillées */}
                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                        {request.status !== 'completed' && (
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contacter le support
                          </Button>
                        )}
                        {request.status === 'completed' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate('/medecin/reports')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir le rapport
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger PDF
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {currentRequests.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune demande trouvée</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredRequests.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
              <span className="text-sm text-gray-500">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRequests.length)} sur {filteredRequests.length}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 px-0 ${currentPage === page ? 'bg-indigo-600' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de relance */}
      <Dialog open={showRelanceDialog} onOpenChange={setShowRelanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Relancer la demande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-800">
                  {selectedRequest.id} - {selectedRequest.patient_name}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  En attente depuis {getWaitingTime(selectedRequest.date_sent, selectedRequest.status).text}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message (optionnel)</label>
              <Textarea
                placeholder="Ajoutez un message pour préciser l'urgence ou donner des informations complémentaires..."
                className="min-h-[100px]"
                value={relanceMessage}
                onChange={(e) => setRelanceMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRelanceDialog(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleRelance}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Envoyer la relance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
