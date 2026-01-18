import { useState, useEffect } from 'react';
import { 
  Inbox, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Eye,
  Check,
  X,
  RefreshCw,
  AlertCircle
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

export function ECGInbox() {
  const { toast } = useToast();
  const { queue, getByStatus, validateECG, getCounts } = useECGQueueStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ECGQueueItem | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [itemToReject, setItemToReject] = useState<string | null>(null);

  // ECG en attente de validation
  const receivedECGs = getByStatus('received');
  const counts = getCounts();

  // Filtrage
  const filteredECGs = receivedECGs.filter(ecg => {
    const matchesSearch = 
      ecg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.referringDoctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || ecg.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  }).sort((a, b) => {
    // Trier par urgence d'abord, puis par date
    if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
    if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
    return new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime();
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

  const handleValidate = (id: string) => {
    validateECG(id);
    toast({
      title: "ECG validé",
      description: `L'ECG ${id} a été validé et peut maintenant être assigné.`
    });
  };

  const handleBulkValidate = () => {
    selectedItems.forEach(id => validateECG(id));
    toast({
      title: "ECG validés",
      description: `${selectedItems.length} ECG ont été validés.`
    });
    setSelectedItems([]);
  };

  const handleReject = (id: string) => {
    setItemToReject(id);
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (itemToReject) {
      // TODO: Implémenter le rejet avec raison
      toast({
        title: "ECG rejeté",
        description: `L'ECG ${itemToReject} a été rejeté. Le médecin sera notifié.`,
        variant: "destructive"
      });
    }
    setRejectDialogOpen(false);
    setRejectReason('');
    setItemToReject(null);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="h-6 w-6 text-indigo-600" />
            Réception ECG
          </h1>
          <p className="text-gray-500 mt-1">Validez les ECG entrants avant assignation aux cardiologues</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">En attente</p>
                <p className="text-2xl font-bold text-amber-700">{counts.received}</p>
              </div>
              <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-700" />
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
                  {receivedECGs.filter(e => e.urgency === 'urgent').length}
                </p>
              </div>
              <div className="h-10 w-10 bg-red-200 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Validés aujourd'hui</p>
                <p className="text-2xl font-bold text-green-700">{counts.validated}</p>
              </div>
              <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total en file</p>
                <p className="text-2xl font-bold text-blue-700">
                  {counts.received + counts.validated}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                <Inbox className="h-5 w-5 text-blue-700" />
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
                  onClick={handleBulkValidate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Valider la sélection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des ECG */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            ECG en attente de validation
            {counts.received > 0 && (
              <Badge variant="secondary" className="ml-2">{counts.received}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredECGs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucun ECG en attente</p>
              <p className="text-sm">Les nouveaux ECG apparaîtront ici</p>
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
                  <TableHead>Reçu</TableHead>
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
                        <div>
                          <p className="text-sm">
                            {format(parseISO(ecg.dateReceived), 'dd/MM HH:mm', { locale: fr })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(parseISO(ecg.dateReceived), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ecg.urgency === 'urgent' ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 animate-pulse">
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
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleValidate(ecg.id)}
                            title="Valider"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(ecg.id)}
                            title="Rejeter"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Ligne expandable avec détails */}
                    {expandedRow === ecg.id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={8} className="p-4">
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Informations Patient</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">ID:</span> {ecg.patientId}</p>
                                <p><span className="text-gray-500">Nom:</span> {ecg.patientName}</p>
                                <p><span className="text-gray-500">Âge:</span> {ecg.patientAge} ans</p>
                                <p><span className="text-gray-500">Sexe:</span> {ecg.patientGender === 'M' ? 'Masculin' : 'Féminin'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Contexte clinique</h4>
                              <p className="text-sm bg-white p-3 rounded border">
                                {ecg.clinicalContext || 'Non spécifié'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Actions rapides</h4>
                              <div className="flex flex-col gap-2">
                                <Button 
                                  className="w-full bg-green-600 hover:bg-green-700"
                                  onClick={() => handleValidate(ecg.id)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Valider cet ECG
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleReject(ecg.id)}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Rejeter
                                </Button>
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

      {/* Dialog de prévisualisation */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aperçu ECG - {previewItem?.id}
            </DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Patient</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-500">Nom:</span> {previewItem.patientName}</p>
                    <p><span className="text-gray-500">ID:</span> {previewItem.patientId}</p>
                    <p><span className="text-gray-500">Âge:</span> {previewItem.patientAge} ans</p>
                    <p><span className="text-gray-500">Sexe:</span> {previewItem.patientGender === 'M' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Médecin référent</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-500">Nom:</span> {previewItem.referringDoctor}</p>
                    <p><span className="text-gray-500">Email:</span> {previewItem.referringDoctorEmail}</p>
                    <p><span className="text-gray-500">Établissement:</span> {previewItem.hospital}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Contexte clinique</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  {previewItem.clinicalContext || 'Non spécifié'}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Aperçu du tracé ECG</h4>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-400">Aperçu du tracé ECG</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewItem(null)}>
              Fermer
            </Button>
            <Button 
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                if (previewItem) handleReject(previewItem.id);
                setPreviewItem(null);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (previewItem) handleValidate(previewItem.id);
                setPreviewItem(null);
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Rejeter l'ECG
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Veuillez indiquer la raison du rejet. Le médecin référent sera notifié.
            </p>
            <Textarea
              placeholder="Raison du rejet (qualité insuffisante, informations manquantes, etc.)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectReason.trim()}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
