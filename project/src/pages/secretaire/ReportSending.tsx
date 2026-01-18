import { useState } from 'react';
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
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Send className="h-6 w-6 text-indigo-600" />
            Envoi des Rapports
          </h1>
          <p className="text-gray-500 mt-1">Envoyez les rapports interprétés aux médecins référents</p>
        </div>
        <Button 
          onClick={handleSendAll}
          disabled={filteredECGs.length === 0}
          className="bg-gradient-to-r from-green-600 to-emerald-600"
        >
          <Send className="h-4 w-4 mr-2" />
          Envoyer tous ({filteredECGs.length})
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Prêts à envoyer</p>
                <p className="text-2xl font-bold text-green-700">{counts.ready_to_send}</p>
              </div>
              <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Urgents</p>
                <p className="text-2xl font-bold text-red-700">
                  {readyToSend.filter(e => e.urgency === 'urgent').length}
                </p>
              </div>
              <div className="h-10 w-10 bg-red-200 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Envoyés aujourd'hui</p>
                <p className="text-2xl font-bold text-blue-700">{counts.sent}</p>
              </div>
              <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Temps moyen</p>
                <p className="text-2xl font-bold text-purple-700">~2h</p>
              </div>
              <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher patient, ID, médecin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Urgence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="urgent">Urgents</SelectItem>
                  <SelectItem value="normal">Normaux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedItems.length} sélectionné(s)
                </span>
                <Button 
                  onClick={() => openSendDialog(selectedItems)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer la sélection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des rapports à envoyer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            Rapports prêts à envoyer
            {counts.ready_to_send > 0 && (
              <Badge variant="secondary" className="ml-2">{counts.ready_to_send}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredECGs.length === 0 ? (
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
                  <TableHead>ID ECG</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin référent</TableHead>
                  <TableHead>Cardiologue</TableHead>
                  <TableHead>Terminé</TableHead>
                  <TableHead>Urgence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredECGs.map((ecg) => (
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
        </CardContent>
      </Card>

      {/* Rapports récemment envoyés */}
      {sentECGs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Récemment envoyés
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID ECG</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin référent</TableHead>
                  <TableHead>Envoyé</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentECGs.map((ecg) => (
                  <TableRow key={ecg.id} className="bg-green-50/30">
                    <TableCell className="font-mono text-sm font-medium">
                      {ecg.id}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{ecg.patientName}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{ecg.referringDoctor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {ecg.dateSent && formatDistanceToNow(parseISO(ecg.dateSent), { addSuffix: true, locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Envoyé
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
