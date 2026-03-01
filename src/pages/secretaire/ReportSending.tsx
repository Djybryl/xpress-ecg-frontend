import { useState, useEffect } from 'react';
import { 
  Send, 
  Search, 
  Filter,
  User,
  Building2,
  Clock,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Mail,
  FileText,
  Eye,
  CheckCircle2,
  Printer,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useECGQueueStore, type ECGQueueItem } from '@/stores/useECGQueueStore';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function ReportSending() {
  const { toast } = useToast();
  const { getByStatus, markAsSent, bulkMarkAsSent, getCounts } = useECGQueueStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ECGQueueItem | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [itemsToSend, setItemsToSend] = useState<string[]>([]);
  const [emailMessage, setEmailMessage] = useState('');
  const [tab, setTab] = useState<'to_send' | 'sent'>('to_send');
  const [page, setPage] = useState(1);
  const [sendAllConfirm, setSendAllConfirm] = useState(false);
  const PAGE_SIZE = 10;

  // ECG prêts à être envoyés
  const readyToSend = getByStatus('ready_to_send');
  // ECG déjà envoyés (récents)
  const sentECGs = getByStatus('sent').slice(0, 5);
  const counts = getCounts();

  // Filtrage
  const filteredECGs = readyToSend.filter(ecg => {
    const matchesSearch = 
      ecg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.referringDoctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || ecg.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  }).sort((a, b) => {
    if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
    if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
    return new Date(b.dateCompleted || b.dateReceived).getTime() - new Date(a.dateCompleted || a.dateReceived).getTime();
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredECGs.map(ecg => ecg.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(i => i !== id));
    }
  };

  const openSendDialog = (ids: string[]) => {
    setItemsToSend(ids);
    setEmailMessage('');
    setSendDialogOpen(true);
  };

  const handleSend = () => {
    if (itemsToSend.length === 1) {
      markAsSent(itemsToSend[0]);
    } else {
      bulkMarkAsSent(itemsToSend);
    }

    toast({
      title: "Rapport(s) envoyé(s)",
      description: `${itemsToSend.length} rapport(s) envoyé(s) aux médecins référents.`
    });

    setSendDialogOpen(false);
    setSelectedItems([]);
    setItemsToSend([]);
  };

  const handleSendAll = () => {
    const allIds = filteredECGs.map(e => e.id);
    bulkMarkAsSent(allIds);
    toast({
      title: "Tous les rapports envoyés",
      description: `${allIds.length} rapport(s) envoyé(s) aux médecins référents.`
    });
    setSendAllConfirm(false);
  };

  const totalPages = Math.max(1, Math.ceil(filteredECGs.length / PAGE_SIZE));
  const paginatedECGs = filteredECGs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [searchTerm, urgencyFilter, tab]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Send className="h-5 w-5 text-indigo-600" />
          Envoi des Rapports
          {counts.ready_to_send > 0 && <Badge variant="secondary" className="text-xs">{counts.ready_to_send}</Badge>}
        </h1>
        <Button 
          onClick={() => setSendAllConfirm(true)}
          disabled={filteredECGs.length === 0}
          size="sm"
          className="h-8 text-xs bg-green-600 hover:bg-green-700"
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Envoyer tous ({filteredECGs.length})
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b p-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 flex-wrap">
            <button onClick={() => setTab('to_send')} className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', tab === 'to_send' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200')}>
              À envoyer <span className={cn('rounded-full px-1', tab === 'to_send' ? 'bg-white/20' : 'bg-gray-200')}>{counts.ready_to_send}</span>
            </button>
            <button onClick={() => setTab('sent')} className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', tab === 'sent' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200')}>
              Envoyés récemment <span className={cn('rounded-full px-1', tab === 'sent' ? 'bg-white/20' : 'bg-gray-200')}>{sentECGs.length}</span>
            </button>
            {tab === 'to_send' && (
              <>
                <div className="relative ml-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input placeholder="Patient, Référence…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-xs w-40" />
                </div>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue placeholder="Urgence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="urgent">Urgents</SelectItem>
                    <SelectItem value="normal">Normaux</SelectItem>
                  </SelectContent>
                </Select>
                {selectedItems.length > 0 && (
                  <Button onClick={() => openSendDialog(selectedItems)} size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 ml-auto">
                    <Send className="h-3.5 w-3.5 mr-1.5" />Envoyer ({selectedItems.length})
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {tab === 'sent' ? (
            sentECGs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Aucun rapport envoyé récemment</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Référence</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Envoyé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sentECGs.map(ecg => (
                    <TableRow key={ecg.id}>
                      <TableCell className="font-mono text-sm">{ecg.id}</TableCell>
                      <TableCell className="font-medium">{ecg.patientName}</TableCell>
                      <TableCell className="text-sm">{ecg.referringDoctor}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {ecg.dateSent && formatDistanceToNow(parseISO(ecg.dateSent), { addSuffix: true, locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : filteredECGs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucun rapport à envoyer</p>
              <p className="text-sm">Les rapports interprétés apparaîtront ici</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedItems.length === filteredECGs.length && filteredECGs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin référent</TableHead>
                  <TableHead>Cardiologue</TableHead>
                  <TableHead>Terminé</TableHead>
                  <TableHead>Urgence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedECGs.map((ecg) => (
                  <>
                    <TableRow 
                      key={ecg.id}
                      className={cn(
                        "cursor-pointer hover:bg-gray-50",
                        ecg.urgency === 'urgent' && "bg-red-50 hover:bg-red-100",
                        expandedRow === ecg.id && "bg-indigo-50"
                      )}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems.includes(ecg.id)}
                          onCheckedChange={(checked) => handleSelectItem(ecg.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setExpandedRow(expandedRow === ecg.id ? null : ecg.id)}
                        >
                          {expandedRow === ecg.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">
                        {ecg.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{ecg.patientName}</p>
                            <p className="text-xs text-gray-500">
                              {ecg.patientGender === 'M' ? 'Homme' : 'Femme'}, {ecg.patientAge} ans
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm">{ecg.referringDoctor}</p>
                            <p className="text-xs text-gray-500">{ecg.hospital}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-indigo-600" />
                          </div>
                          <span className="text-sm">{ecg.assignedTo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {ecg.dateCompleted && format(parseISO(ecg.dateCompleted), 'dd/MM HH:mm', { locale: fr })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ecg.dateCompleted && formatDistanceToNow(parseISO(ecg.dateCompleted), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ecg.urgency === 'urgent' ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            URGENT
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPreviewItem(ecg)}
                            title="Aperçu"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Télécharger PDF"
                          >
                            <Download className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Imprimer"
                          >
                            <Printer className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openSendDialog([ecg.id])}
                            className="bg-green-600 hover:bg-green-700 ml-2"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Envoyer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Ligne expandable avec détails */}
                    {expandedRow === ecg.id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={9} className="p-4">
                          <div className="grid grid-cols-4 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Informations Patient</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">ID:</span> {ecg.patientId}</p>
                                <p><span className="text-gray-500">Nom:</span> {ecg.patientName}</p>
                                <p><span className="text-gray-500">Âge:</span> {ecg.patientAge} ans</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Contexte clinique</h4>
                              <p className="text-sm bg-white p-3 rounded border">
                                {ecg.clinicalContext || 'Non spécifié'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Destinataire</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">Médecin:</span> {ecg.referringDoctor}</p>
                                <p><span className="text-gray-500">Email:</span> {ecg.referringDoctorEmail}</p>
                                <p><span className="text-gray-500">Hôpital:</span> {ecg.hospital}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Timeline</h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span>Reçu: {ecg.dateReceived && format(parseISO(ecg.dateReceived), 'dd/MM HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span>Validé: {ecg.dateValidated && format(parseISO(ecg.dateValidated), 'dd/MM HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span>Assigné: {ecg.dateAssigned && format(parseISO(ecg.dateAssigned), 'dd/MM HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span>Terminé: {ecg.dateCompleted && format(parseISO(ecg.dateCompleted), 'dd/MM HH:mm')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
          {tab === 'to_send' && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-gray-500">
              <span>{filteredECGs.length} résultat{filteredECGs.length > 1 ? 's' : ''} • page {page}/{totalPages}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === 1} onClick={() => setPage(1)}>«</Button>
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => Math.max(1, Math.min(page - 2, totalPages - 4)) + i).map(p => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className={cn('h-6 w-6 p-0 text-xs', p === page && 'bg-indigo-600 text-white')} onClick={() => setPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog confirmation Envoyer tous */}
      <Dialog open={sendAllConfirm} onOpenChange={setSendAllConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer tous les rapports</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Envoyer les {filteredECGs.length} rapport{filteredECGs.length > 1 ? 's' : ''} aux médecins référents ?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendAllConfirm(false)}>Annuler</Button>
            <Button onClick={handleSendAll}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de prévisualisation */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aperçu Rapport - {previewItem?.id}
            </DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-6">
              {/* En-tête du rapport */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Rapport d'interprétation ECG</h3>
                    <p className="text-sm text-gray-600">Référence: {previewItem.id}</p>
                  </div>
                  <Badge className={previewItem.urgency === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}>
                    {previewItem.urgency === 'urgent' ? 'URGENT' : 'Standard'}
                  </Badge>
                </div>
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold border-b pb-2">Patient</h4>
                  <div className="text-sm space-y-2">
                    <p><span className="text-gray-500 w-24 inline-block">Nom:</span> {previewItem.patientName}</p>
                    <p><span className="text-gray-500 w-24 inline-block">ID:</span> {previewItem.patientId}</p>
                    <p><span className="text-gray-500 w-24 inline-block">Âge:</span> {previewItem.patientAge} ans</p>
                    <p><span className="text-gray-500 w-24 inline-block">Sexe:</span> {previewItem.patientGender === 'M' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold border-b pb-2">Destinataire</h4>
                  <div className="text-sm space-y-2">
                    <p><span className="text-gray-500 w-24 inline-block">Médecin:</span> {previewItem.referringDoctor}</p>
                    <p><span className="text-gray-500 w-24 inline-block">Email:</span> {previewItem.referringDoctorEmail}</p>
                    <p><span className="text-gray-500 w-24 inline-block">Hôpital:</span> {previewItem.hospital}</p>
                  </div>
                </div>
              </div>

              {/* Contexte clinique */}
              <div>
                <h4 className="font-semibold border-b pb-2 mb-2">Contexte clinique</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {previewItem.clinicalContext || 'Non spécifié'}
                </p>
              </div>

              {/* Tracé ECG (placeholder) */}
              <div>
                <h4 className="font-semibold border-b pb-2 mb-2">Tracé ECG</h4>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-400">Tracé ECG du patient</p>
                </div>
              </div>

              {/* Interprétation (placeholder) */}
              <div>
                <h4 className="font-semibold border-b pb-2 mb-2">Interprétation</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                  <p><strong>Rythme:</strong> Sinusal régulier</p>
                  <p><strong>Fréquence:</strong> 72 bpm</p>
                  <p><strong>Axe:</strong> Normal</p>
                  <p><strong>Anomalies:</strong> Aucune anomalie significative</p>
                </div>
              </div>

              {/* Conclusion */}
              <div>
                <h4 className="font-semibold border-b pb-2 mb-2">Conclusion</h4>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    ECG normal. Pas de signe d'ischémie ou de trouble du rythme.
                  </p>
                </div>
              </div>

              {/* Signature */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  Interprété par: <strong>{previewItem.assignedTo}</strong>
                </p>
                <p className="text-xs text-gray-400">
                  Date: {previewItem.dateCompleted && format(parseISO(previewItem.dateCompleted), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewItem(null)}>
              Fermer
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (previewItem) openSendDialog([previewItem.id]);
                setPreviewItem(null);
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'envoi */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Envoyer {itemsToSend.length} rapport(s)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Les rapports seront envoyés par email aux médecins référents respectifs.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message personnalisé (optionnel)</label>
              <Textarea
                placeholder="Ajoutez un message à l'email..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-medium mb-2">Résumé de l'envoi:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• {itemsToSend.length} rapport(s) à envoyer</li>
                <li>• Format: PDF + lien sécurisé</li>
                <li>• Notification automatique au médecin</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSend}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Confirmer l'envoi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
