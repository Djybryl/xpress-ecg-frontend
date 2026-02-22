import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  User,
  Building2,
  Lightbulb,
  Send,
  FileText,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface SecondOpinionRequest {
  id: string;
  ecgId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  requestDate: string;
  urgency: 'critical' | 'urgent' | 'normal';
  status: 'pending' | 'in-progress' | 'completed' | 'declined';
  requestingDoctor: string;
  requestingDoctorEmail: string;
  clinicalContext: string;
  preliminaryAnalysis: string;
  questions: string[];
  hospital: string;
}

export function SecondOpinionRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  
  // Dialogs
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SecondOpinionRequest | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  // Données simulées
  const requests: SecondOpinionRequest[] = [
    {
      id: 'SO-2026-001',
      ecgId: 'ECG-2026-1234',
      patientName: 'Jean Dupont',
      patientAge: 62,
      patientGender: 'M',
      requestDate: '2026-01-26T14:30:00',
      urgency: 'urgent',
      status: 'pending',
      requestingDoctor: 'Dr. Sophie Bernard',
      requestingDoctorEmail: 's.bernard@example.com',
      clinicalContext: 'Douleur thoracique depuis 2h, antécédents HTA',
      preliminaryAnalysis: 'Sus-décalage ST en V2-V4. Hésitation entre STEMI antérieur ou repolarisation précoce. Patient jeune, pas d\'ATCD cardiovasculaire.',
      questions: ['Confirmation diagnostic', 'Conduite à tenir immédiate', 'Activation SAMU ?'],
      hospital: 'CHU Saint-Pierre'
    },
    {
      id: 'SO-2026-002',
      ecgId: 'ECG-2026-0987',
      patientName: 'Marie Martin',
      patientAge: 45,
      patientGender: 'F',
      requestDate: '2026-01-26T10:15:00',
      urgency: 'normal',
      status: 'in-progress',
      requestingDoctor: 'Dr. Pierre Laurent',
      requestingDoctorEmail: 'p.laurent@example.com',
      clinicalContext: 'Bilan systématique, asymptomatique',
      preliminaryAnalysis: 'Bloc de branche droit incomplet. Demande confirmation et pertinence clinique.',
      questions: ['Type exact de bloc', 'Examens complémentaires nécessaires'],
      hospital: 'Clinique du Parc'
    },
    {
      id: 'SO-2026-003',
      ecgId: 'ECG-2026-0654',
      patientName: 'Ahmed Ben Ali',
      patientAge: 58,
      patientGender: 'M',
      requestDate: '2026-01-25T16:45:00',
      urgency: 'critical',
      status: 'pending',
      requestingDoctor: 'Dr. Anne Rousseau',
      requestingDoctorEmail: 'a.rousseau@example.com',
      clinicalContext: 'Syncope, patient diabétique sous traitement',
      preliminaryAnalysis: 'QTc allongé (490ms). Risque de torsades de pointes. Questionnement sur arrêt médicaments.',
      questions: ['Confirmation QTc pathologique', 'Conduite thérapeutique', 'Hospitalisation nécessaire ?'],
      hospital: 'Hôpital Général'
    },
  ];

  const filteredRequests = requests.filter(req => {
    const matchSearch = req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       req.ecgId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       req.requestingDoctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchUrgency = urgencyFilter === 'all' || req.urgency === urgencyFilter;
    return matchSearch && matchStatus && matchUrgency;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const paginatedRequests = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, urgencyFilter]);

  const getStatusBadge = (status: SecondOpinionRequest['status']) => {
    const config = {
      pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
      'in-progress': { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Complété', color: 'bg-green-100 text-green-700' },
      declined: { label: 'Décliné', color: 'bg-gray-100 text-gray-700' }
    };
    const { label, color } = config[status];
    return <Badge className={cn(color, "text-[10px] px-2")}>{label}</Badge>;
  };

  const getUrgencyBadge = (urgency: SecondOpinionRequest['urgency']) => {
    const config = {
      critical: { label: 'CRITIQUE', color: 'bg-red-600 text-white animate-pulse' },
      urgent: { label: 'URGENT', color: 'bg-orange-500 text-white' },
      normal: { label: 'Normal', color: 'bg-gray-200 text-gray-700' }
    };
    const { label, color } = config[urgency];
    return <Badge className={cn(color, "text-[10px] px-2")}>{label}</Badge>;
  };

  const handleOpenChat = (request: SecondOpinionRequest) => {
    setSelectedRequest(request);
    setChatDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      toast({
        title: "💬 Message envoyé",
        description: `Votre message a été envoyé à ${selectedRequest?.requestingDoctor}`,
        duration: 3000,
      });
      setChatMessage('');
      setChatDialogOpen(false);
    }
  };

  const handleOpenDecline = (request: SecondOpinionRequest) => {
    setSelectedRequest(request);
    setDeclineDialogOpen(true);
  };

  const handleConfirmDecline = () => {
    if (declineReason.trim()) {
      toast({
        title: "❌ Demande déclinée",
        description: `La demande de ${selectedRequest?.requestingDoctor} a été déclinée`,
        duration: 3000,
      });
      setDeclineReason('');
      setDeclineDialogOpen(false);
    }
  };

  const handleOpenAccept = (request: SecondOpinionRequest) => {
    setSelectedRequest(request);
    setAcceptDialogOpen(true);
  };

  const handleConfirmAccept = () => {
    if (selectedRequest) {
      toast({
        title: "✅ Demande acceptée",
        description: "Vous allez être redirigé vers l'analyse ECG",
        duration: 2000,
      });
      setAcceptDialogOpen(false);
      setTimeout(() => {
        navigate(`/cardiologue/analyze/${selectedRequest.ecgId}`, { 
          state: { 
            secondOpinion: true, 
            requestId: selectedRequest.id,
            requestingDoctor: selectedRequest.requestingDoctor 
          } 
        });
      }, 500);
    }
  };

  const handleContinueAnalysis = (request: SecondOpinionRequest) => {
    navigate(`/cardiologue/analyze/${request.ecgId}`, { 
      state: { 
        secondOpinion: true, 
        requestId: request.id,
        requestingDoctor: request.requestingDoctor 
      } 
    });
  };

  return (
    <div className="space-y-3">
      {/* Header compact avec filtres à droite */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Attente Second Avis
            <Badge variant="secondary" className="text-xs font-normal">
              {filteredRequests.length}
            </Badge>
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px] font-normal">
                {requests.filter(r => r.status === 'pending').length} en attente
              </Badge>
            )}
          </h1>
        </div>
        {/* Filtres inline — à droite du titre */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Patient, ECG, médecin…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs w-48"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="in-progress">En cours</SelectItem>
              <SelectItem value="completed">Complétés</SelectItem>
              <SelectItem value="declined">Déclinés</SelectItem>
            </SelectContent>
          </Select>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="critical">Critiques</SelectItem>
              <SelectItem value="urgent">Urgents</SelectItem>
              <SelectItem value="normal">Normaux</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grille 2 colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {paginatedRequests.map((request) => (
          <Card key={request.id} className={cn(
            "overflow-hidden transition-shadow hover:shadow-md",
            request.urgency === 'critical' && "border-l-4 border-l-red-600",
            request.urgency === 'urgent' && "border-l-4 border-l-orange-500"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{request.patientName}</CardTitle>
                    {getUrgencyBadge(request.urgency)}
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {request.patientAge} ans • {request.patientGender === 'M' ? 'Homme' : 'Femme'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {request.hospital}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(request.requestDate), 'd MMM yyyy • HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Demandeur */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-1">👨‍⚕️ Demandeur</p>
                <p className="text-sm font-semibold text-blue-900">{request.requestingDoctor}</p>
                <p className="text-xs text-blue-700">{request.requestingDoctorEmail}</p>
              </div>

              {/* Contexte clinique */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-900 mb-1">📋 Contexte clinique</p>
                <p className="text-sm text-amber-800">{request.clinicalContext}</p>
              </div>

              {/* Analyse préliminaire */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs font-medium text-purple-900 mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Analyse préliminaire
                </p>
                <p className="text-sm text-purple-800">{request.preliminaryAnalysis}</p>
              </div>

              {/* Questions */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-900 mb-2">❓ Questions posées</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {request.questions.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-xs text-gray-400">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions - UX AMÉLIORÉE */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {request.status === 'pending' && (
                  <>
                    <Button 
                      size="lg"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleOpenAccept(request)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Accepter & Analyser
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline" 
                      className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => handleOpenChat(request)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Discuter
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline" 
                      className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleOpenDecline(request)}
                    >
                      <XCircle className="h-4 w-4" />
                      Décliner
                    </Button>
                  </>
                )}
                {request.status === 'in-progress' && (
                  <>
                    <Button 
                      size="lg"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleContinueAnalysis(request)}
                    >
                      <Eye className="h-4 w-4" />
                      Continuer l'analyse
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline" 
                      className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => handleOpenChat(request)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Discuter
                    </Button>
                  </>
                )}
                {request.status === 'completed' && (
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="w-full gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  >
                    <FileText className="h-4 w-4" />
                    Voir le rapport complet
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <Card className="xl:col-span-2">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune demande de second avis</p>
              <p className="text-xs text-gray-400 mt-1">Modifiez les filtres pour voir plus de résultats</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
          <span>{filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} • page {page}/{totalPages}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === 1} onClick={() => setPage(1)}>«</Button>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              return start + i;
            }).map(p => (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm"
                className={cn('h-6 w-6 p-0 text-xs', p === page && 'bg-indigo-600 text-white')}
                onClick={() => setPage(p)}>{p}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</Button>
          </div>
        </div>
      )}

      {/* DIALOG ACCEPTER - CONFIRMATION */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Accepter la demande de second avis
            </DialogTitle>
            <DialogDescription>
              Confirmez que vous souhaitez accepter cette demande
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-3 py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-1">📋 Résumé de la demande</p>
                <div className="space-y-1 text-sm">
                  <p><strong className="text-blue-900">Patient:</strong> {selectedRequest.patientName}, {selectedRequest.patientAge} ans</p>
                  <p><strong className="text-blue-900">ECG:</strong> {selectedRequest.ecgId}</p>
                  <p><strong className="text-blue-900">Demandeur:</strong> {selectedRequest.requestingDoctor}</p>
                  <p><strong className="text-blue-900">Urgence:</strong> {
                    selectedRequest.urgency === 'critical' ? '🔴 CRITIQUE' : 
                    selectedRequest.urgency === 'urgent' ? '🟠 URGENT' : 
                    '🟢 Normal'
                  }</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-medium text-green-900 mb-2">✅ En acceptant cette demande:</p>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• Vous vous engagez à analyser cet ECG</li>
                  <li>• Le médecin demandeur sera notifié</li>
                  <li>• Vous aurez accès à toutes les informations cliniques</li>
                  <li>• Un délai de réponse sera affiché</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={handleConfirmAccept}
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirmer & Commencer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG CHAT - MESSAGERIE COMPLÈTE */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-3 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Discussion avec {selectedRequest?.requestingDoctor}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Concernant: {selectedRequest?.patientName} • ECG {selectedRequest?.ecgId}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0 px-6 py-4">
            {/* Contexte */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex-shrink-0">
              <p className="text-xs font-medium text-amber-900 mb-1">📋 Contexte de la demande</p>
              <p className="text-sm text-amber-800">{selectedRequest?.clinicalContext}</p>
            </div>

            {/* Messages simulés */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0 mb-4">
              {/* Message du médecin */}
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {selectedRequest?.requestingDoctor?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <p className="text-xs font-medium text-gray-900 mb-1">{selectedRequest?.requestingDoctor}</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {selectedRequest?.preliminaryAnalysis}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {selectedRequest && format(parseISO(selectedRequest.requestDate), 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message système */}
              <div className="flex justify-center">
                <div className="bg-gray-200 rounded-full px-3 py-1">
                  <p className="text-[10px] text-gray-600">Demande de second avis envoyée</p>
                </div>
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="flex-shrink-0 space-y-2 pt-4 border-t">
              <Textarea
                placeholder="Écrivez votre message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="min-h-[80px] text-sm resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-500">
                  💡 Entrée = Envoyer • Shift+Entrée = Nouvelle ligne
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG DÉCLINER - AVEC RAISON */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Décliner la demande
            </DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du refus (optionnel mais recommandé)
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-3 py-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-900 mb-1">Demande concernée</p>
                <p className="text-sm text-gray-700">
                  {selectedRequest.patientName} • ECG {selectedRequest.ecgId}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Demandeur: {selectedRequest.requestingDoctor}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Raison du refus
                </label>
                <Select value={declineReason} onValueChange={setDeclineReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une raison" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unavailable">Non disponible actuellement</SelectItem>
                    <SelectItem value="overload">Charge de travail trop importante</SelectItem>
                    <SelectItem value="not-specialized">Pas dans mon domaine de spécialité</SelectItem>
                    <SelectItem value="insufficient-info">Informations insuffisantes</SelectItem>
                    <SelectItem value="refer-colleague">Référer à un collègue plus approprié</SelectItem>
                    <SelectItem value="other">Autre raison</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-900 mb-1">ℹ️ Information</p>
                <p className="text-xs text-amber-800">
                  Le médecin demandeur sera notifié de votre refus avec la raison indiquée.
                  Il pourra contacter un autre cardiologue senior.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              className="gap-2"
              onClick={handleConfirmDecline}
              disabled={!declineReason}
            >
              <XCircle className="h-4 w-4" />
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
