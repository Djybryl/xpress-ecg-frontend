import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  AlertTriangle,
  Clock,
  User,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  RefreshCw,
  AlertCircle,
  UserCog,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useEcgList } from '@/hooks/useEcgList';
import type { EcgRecordItem } from '@/hooks/useEcgList';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

/** Type enrichi pour l'affichage */
interface InboxItem {
  id: string;
  reference: string;
  patientName: string;
  patientGender: 'M' | 'F';
  patientAge: number;
  referringDoctor: string;
  hospital: string;
  dateReceived: string;
  urgency: 'normal' | 'urgent';
  clinicalContext: string;
  status: EcgRecordItem['status'];
}

const STATUS_LABELS: Record<EcgRecordItem['status'], { label: string; className: string }> = {
  pending:    { label: 'En attente',  className: 'bg-amber-100 text-amber-700' },
  validated:  { label: 'Validé',      className: 'bg-blue-100 text-blue-700' },
  assigned:   { label: 'Assigné',     className: 'bg-indigo-100 text-indigo-700' },
  analyzing:  { label: 'En analyse',  className: 'bg-purple-100 text-purple-700' },
  completed:  { label: 'Terminé',     className: 'bg-green-100 text-green-700' },
};

function toInboxItem(r: EcgRecordItem): InboxItem {
  return {
    id:             r.id,
    reference:      r.reference,
    patientName:    r.patient_name,
    patientGender:  r.gender ?? 'M',
    patientAge:     0,
    referringDoctor: r.medical_center || 'Médecin référent',
    hospital:       r.medical_center || '',
    dateReceived:   r.created_at,
    urgency:        r.urgency,
    clinicalContext: r.clinical_context ?? '',
    status:         r.status,
  };
}

export function ECGInbox() {
  const navigate = useNavigate();
  const { toast: _toast } = useToast();

  // Tous les ECG non complétés (lecture seule)
  const { records, loading, error, refetch } = useEcgList({});

  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<InboxItem | null>(null);
  const PAGE_SIZE = 10;

  const allItems: InboxItem[] = records.map(toInboxItem);

  const filteredItems = allItems.filter(ecg => {
    const matchesSearch =
      ecg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.referringDoctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || ecg.urgency === urgencyFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? ecg.status !== 'completed'
        : ecg.status === statusFilter;
    return matchesSearch && matchesUrgency && matchesStatus;
  }).sort((a, b) => {
    if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
    if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
    return new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-3">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Inbox className="h-5 w-5 text-indigo-600" />
          Demandes entrantes
          {allItems.filter(e => e.status !== 'completed').length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {allItems.filter(e => e.status !== 'completed').length}
            </Badge>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => navigate('/secretaire/assign')}
          >
            <UserCog className="h-3.5 w-3.5 mr-1.5" />
            Assignation spécifique
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={refetch} title="Actualiser">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Bannière info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Les ECG entrants sont <strong>directement accessibles aux cardiologues disponibles</strong>.
          L'assignation spécifique à un cardiologue est optionnelle.
        </span>
      </div>

      {!loading && error && (
        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refetch} className="ml-4 h-7 text-xs">Réessayer</Button>
        </div>
      )}

      <Card>
        <CardHeader className="border-b p-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Patient, Référence, médecin…"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-8 h-8 text-xs w-48"
              />
            </div>
            <Select value={urgencyFilter} onValueChange={(v) => { setUrgencyFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue placeholder="Urgence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="urgent">Urgents</SelectItem>
                <SelectItem value="normal">Normaux</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">En cours</SelectItem>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="assigned">Assignés</SelectItem>
                <SelectItem value="analyzing">En analyse</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto text-xs text-gray-400">{filteredItems.length} demande{filteredItems.length > 1 ? 's' : ''}</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
              Chargement des demandes…
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucune demande</p>
              <p className="text-sm">Les nouvelles demandes ECG apparaîtront ici</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin référent</TableHead>
                  <TableHead>Reçu</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Urgence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((ecg) => (
                  <>
                    <TableRow
                      key={ecg.id}
                      className={cn(
                        "cursor-pointer hover:bg-gray-50",
                        ecg.urgency === 'urgent' && "bg-red-50 hover:bg-red-100",
                        expandedRow === ecg.id && "bg-indigo-50"
                      )}
                    >
                      <TableCell>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setExpandedRow(expandedRow === ecg.id ? null : ecg.id)}
                        >
                          {expandedRow === ecg.id
                            ? <ChevronUp className="h-4 w-4" />
                            : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium text-indigo-700">
                        {ecg.reference}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{ecg.patientName}</p>
                            <p className="text-xs text-gray-500">
                              {ecg.patientGender === 'M' ? 'Homme' : 'Femme'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="text-sm">{ecg.referringDoctor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{format(parseISO(ecg.dateReceived), 'dd/MM HH:mm', { locale: fr })}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(parseISO(ecg.dateReceived), { addSuffix: true, locale: fr })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', STATUS_LABELS[ecg.status].className)}>
                          {STATUS_LABELS[ecg.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ecg.urgency === 'urgent' ? (
                          <Badge className="bg-red-100 text-red-700 animate-pulse text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />URGENT
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600 text-xs">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => setPreviewItem(ecg)}
                          title="Aperçu"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {expandedRow === ecg.id && (
                      <TableRow key={`${ecg.id}-expanded`} className="bg-gray-50">
                        <TableCell colSpan={8} className="p-4">
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Informations Patient</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">Nom :</span> {ecg.patientName}</p>
                                <p><span className="text-gray-500">Sexe :</span> {ecg.patientGender === 'M' ? 'Masculin' : 'Féminin'}</p>
                                <p><span className="text-gray-500">Référence ECG :</span> <span className="font-mono">{ecg.reference}</span></p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Contexte clinique</h4>
                              <p className="text-sm bg-white p-3 rounded border">
                                {ecg.clinicalContext || 'Non spécifié'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Actions</h4>
                              <div className="flex flex-col gap-2">
                                {(ecg.status === 'pending' || ecg.status === 'validated') && (
                                  <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    size="sm"
                                    onClick={() => navigate('/secretaire/assign')}
                                  >
                                    <UserCog className="h-4 w-4 mr-2" />
                                    Assigner à un cardiologue
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setPreviewItem(ecg)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir les détails
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-gray-500">
              <span>{filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''} • page {page}/{totalPages}</span>
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

      {/* Dialog de prévisualisation */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Détails ECG — <span className="font-mono text-indigo-600">{previewItem?.reference}</span>
            </DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Patient</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-500">Nom :</span> {previewItem.patientName}</p>
                    <p><span className="text-gray-500">Sexe :</span> {previewItem.patientGender === 'M' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Médecin référent</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-500">Établissement :</span> {previewItem.hospital}</p>
                    <p><span className="text-gray-500">Statut :</span>
                      <Badge className={cn('ml-2 text-xs', STATUS_LABELS[previewItem.status].className)}>
                        {STATUS_LABELS[previewItem.status].label}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Contexte clinique</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  {previewItem.clinicalContext || 'Non spécifié'}
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg flex items-center gap-2 text-sm text-indigo-700">
                <Activity className="h-4 w-4 shrink-0" />
                <span>Cet ECG est visible par tous les cardiologues disponibles.</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {previewItem && (previewItem.status === 'pending' || previewItem.status === 'validated') && (
              <Button
                variant="outline"
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                onClick={() => { setPreviewItem(null); navigate('/secretaire/assign'); }}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Assigner
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewItem(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Supprime les imports inutilisés du lint
void AlertTriangle;
void Clock;
