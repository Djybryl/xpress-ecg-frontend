import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  FileText,
  Send,
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
import { useSecondOpinionList } from '@/hooks/useSecondOpinionList';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

export function SecondOpinionRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { opinions, loading, error, updateStatus, respond } = useSecondOpinionList();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Dialogs
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  const selectedRequest = opinions.find(o => o.id === selectedId) ?? null;

  const filteredRequests = opinions.filter(req => {
    const matchSearch = req.ecg_record_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const paginatedRequests = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, urgencyFilter]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      pending:   { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
      accepted:  { label: 'En cours',   color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Complété',   color: 'bg-green-100 text-green-700' },
      refused:   { label: 'Décliné',    color: 'bg-gray-100 text-gray-700' },
    };
    const { label, color } = config[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={cn(color, "text-[10px] px-2")}>{label}</Badge>;
  };

  const handleOpenChat = (id: string) => {
    setSelectedId(id);
    setChatDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim() && selectedId) {
      await respond(selectedId, chatMessage.trim());
      toast({ title: "Message envoyé", duration: 3000 });
      setChatMessage('');
      setChatDialogOpen(false);
    }
  };

  const handleOpenDecline = (id: string) => {
    setSelectedId(id);
    setDeclineDialogOpen(true);
  };

  const handleConfirmDecline = async () => {
    if (declineReason && selectedId) {
      await updateStatus(selectedId, 'refused');
      toast({ title: "Demande déclinée", duration: 3000 });
      setDeclineReason('');
      setDeclineDialogOpen(false);
    }
  };

  const handleOpenAccept = (id: string) => {
    setSelectedId(id);
    setAcceptDialogOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (selectedId && selectedRequest) {
      await updateStatus(selectedId, 'accepted');
      toast({ title: "Demande acceptée", description: "Redirection vers l'analyse ECG", duration: 2000 });
      setAcceptDialogOpen(false);
      setTimeout(() => {
        navigate(`/cardiologue/analyze/${selectedRequest.ecg_record_id}`, {
          state: { secondOpinion: true, requestId: selectedRequest.id },
        });
      }, 500);
    }
  };

  const handleContinueAnalysis = (id: string, ecgRecordId: string) => {
    navigate(`/cardiologue/analyze/${ecgRecordId}`, {
      state: { secondOpinion: true, requestId: id },
    });
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {/* Header compact avec filtres à droite */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Attente Second Avis
            <Badge variant="secondary" className="text-xs font-normal">
              {loading ? '…' : filteredRequests.length}
            </Badge>
            {opinions.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px] font-normal">
                {opinions.filter(r => r.status === 'pending').length} en attente
              </Badge>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Référence ECG, demande…"
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
              <SelectItem value="accepted">En cours</SelectItem>
              <SelectItem value="completed">Complétés</SelectItem>
              <SelectItem value="refused">Déclinés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grille 2 colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {paginatedRequests.map((request) => (
          <Card key={request.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base font-mono text-indigo-700">{request.id.slice(0, 8)}…</CardTitle>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      ECG: {request.ecg_record_id.slice(0, 8)}…
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(request.created_at), 'd MMM yyyy • HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Notes */}
              {request.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-amber-900 mb-1">📋 Notes</p>
                  <p className="text-sm text-amber-800">{request.notes}</p>
                </div>
              )}

              {/* Réponse (si disponible) */}
              {request.response && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-green-900 mb-1">✅ Réponse</p>
                  <p className="text-sm text-green-800">{request.response}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {request.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                      onClick={() => handleOpenAccept(request.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Accepter & Analyser
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => handleOpenChat(request.id)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Discuter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleOpenDecline(request.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Décliner
                    </Button>
                  </>
                )}
                {request.status === 'accepted' && (
                  <Button
                    size="sm"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    onClick={() => handleContinueAnalysis(request.id, request.ecg_record_id)}
                  >
                    <Eye className="h-4 w-4" />
                    Continuer l'analyse
                  </Button>
                )}
                {request.status === 'completed' && (
                  <Button size="sm" variant="outline" className="w-full gap-2 border-indigo-300 text-indigo-700">
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

      {/* DIALOG ACCEPTER */}
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
                <p className="text-xs font-medium text-blue-900 mb-1">📋 Demande</p>
                <div className="space-y-1 text-sm">
                  <p><strong className="text-blue-900">ID:</strong> {selectedRequest.id}</p>
                  <p><strong className="text-blue-900">ECG:</strong> {selectedRequest.ecg_record_id.slice(0, 16)}…</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>Annuler</Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={handleConfirmAccept}>
              <CheckCircle2 className="h-4 w-4" />Confirmer & Commencer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG CHAT */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="sm:max-w-lg flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Répondre à la demande
            </DialogTitle>
            <DialogDescription className="text-xs">
              Demande ID: {selectedRequest?.id} • ECG: {selectedRequest?.ecg_record_id.slice(0, 16)}…
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {selectedRequest?.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-900 mb-1">📋 Notes du demandeur</p>
                <p className="text-sm text-amber-800">{selectedRequest.notes}</p>
              </div>
            )}
            <Textarea
              placeholder="Écrivez votre réponse..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="min-h-[100px] text-sm resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChatDialogOpen(false)}>Annuler</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={handleSendMessage} disabled={!chatMessage.trim()}>
              <Send className="h-4 w-4" />Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DÉCLINER */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Décliner la demande
            </DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du refus
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Select value={declineReason} onValueChange={setDeclineReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une raison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unavailable">Non disponible actuellement</SelectItem>
                <SelectItem value="overload">Charge de travail trop importante</SelectItem>
                <SelectItem value="not-specialized">Pas dans mon domaine de spécialité</SelectItem>
                <SelectItem value="insufficient-info">Informations insuffisantes</SelectItem>
                <SelectItem value="other">Autre raison</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" className="gap-2" onClick={handleConfirmDecline} disabled={!declineReason}>
              <XCircle className="h-4 w-4" />Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
