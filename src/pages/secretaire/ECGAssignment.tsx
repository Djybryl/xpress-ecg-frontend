import { useState, useEffect } from 'react';
import {
  UserCog,
  Search,
  User,
  Building2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Users,
  RefreshCw,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEcgList, ecgRef } from '@/hooks/useEcgList';
import type { EcgRecordItem } from '@/hooks/useEcgList';
import { useUserList } from '@/hooks/useUserList';
import { api, ApiError } from '@/lib/apiClient';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function ECGAssignment() {
  const { toast } = useToast();

  // ECG en attente (non encore assignés)
  const { records: pendingRecords, loading: loadingECG, error: errorECG, refetch: refetchECG } = useEcgList({ status: 'pending' });
  // ECG déjà assignés (pour le tableau de suivi)
  const { records: assignedRecords, refetch: refetchAssigned } = useEcgList({ status: 'assigned' });
  // Cardiologues actifs
  const { users: cardiologists, loading: loadingCardio } = useUserList({ role: 'cardiologue', status: 'active' });

  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCardiologistId, setSelectedCardiologistId] = useState<string>('');
  const [itemsToAssign, setItemsToAssign] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const PAGE_SIZE = 10;

  useEffect(() => { setPage(1); }, [searchTerm, urgencyFilter]);

  const filteredECGs = pendingRecords.filter(ecg => {
    const matchesSearch =
      ecg.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecgRef(ecg).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ecg.medical_center || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || ecg.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  }).sort((a, b) => {
    if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
    if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(filteredECGs.length / PAGE_SIZE));
  const paginatedECGs = filteredECGs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? filteredECGs.map(e => e.id) : []);
  };

  const openAssignDialog = (ids: string[]) => {
    setItemsToAssign(ids);
    setSelectedCardiologistId('');
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedCardiologistId) {
      toast({ title: 'Cardiologue requis', description: 'Veuillez sélectionner un cardiologue.', variant: 'destructive' });
      return;
    }
    const cardio = cardiologists.find(c => c.id === selectedCardiologistId);
    setAssigning(true);
    try {
      await Promise.all(
        itemsToAssign.map(id =>
          api.post(`/ecg-records/${id}/assign`, { cardiologistId: selectedCardiologistId })
        )
      );
      toast({
        title: 'Assignation effectuée',
        description: `${itemsToAssign.length} ECG assigné${itemsToAssign.length > 1 ? 's' : ''} à ${cardio?.name ?? 'le cardiologue'}.`,
      });
      setAssignDialogOpen(false);
      setSelectedItems([]);
      setItemsToAssign([]);
      refetchECG();
      refetchAssigned();
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof ApiError ? err.message : "Erreur lors de l'assignation.",
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleRefetch = () => { refetchECG(); refetchAssigned(); };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <UserCog className="h-5 w-5 text-indigo-600" />
          Assignation spécifique
          {pendingRecords.length > 0 && (
            <Badge variant="secondary" className="text-xs">{pendingRecords.length} en attente</Badge>
          )}
        </h1>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={handleRefetch} title="Actualiser">
          <RefreshCw className={`h-4 w-4 ${loadingECG ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Info workflow */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          L'assignation est <strong>optionnelle</strong>. Sans assignation, tous les cardiologues disponibles voient l'ECG.
          En assignant à un cardiologue spécifique, <strong>seul celui-ci</strong> le verra dans sa file.
        </span>
      </div>

      {/* Pills cardiologues */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> Cardiologues actifs :
        </span>
        {loadingCardio ? (
          <span className="text-xs text-gray-400">Chargement…</span>
        ) : cardiologists.length === 0 ? (
          <span className="text-xs text-gray-400">Aucun cardiologue actif</span>
        ) : (
          cardiologists.map(c => (
            <div key={c.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-200 text-xs font-medium text-indigo-700 bg-indigo-50">
              <User className="h-3 w-3" />
              <span>{c.name}</span>
              {c.specialty && <span className="opacity-60">— {c.specialty}</span>}
            </div>
          ))
        )}
      </div>

      {/* Tableau ECG en attente */}
      {errorECG && (
        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span>{errorECG}</span>
          <Button variant="outline" size="sm" onClick={handleRefetch} className="ml-4 h-7 text-xs">Réessayer</Button>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs w-48"
              />
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
              <Button
                onClick={() => openAssignDialog(selectedItems)}
                size="sm"
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 ml-auto"
              >
                <UserCog className="h-3.5 w-3.5 mr-1.5" />
                Assigner ({selectedItems.length})
              </Button>
            )}
            <span className="ml-auto text-xs text-gray-400">{filteredECGs.length} ECG en attente</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingECG ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
              Chargement…
            </div>
          ) : filteredECGs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucun ECG en attente d'assignation</p>
              <p className="text-sm">Tous les ECG ont été pris en charge</p>
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
                  <TableHead className="w-[40px]" />
                  <TableHead>Référence</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin référent</TableHead>
                  <TableHead>Reçu</TableHead>
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
                        "cursor-pointer hover:bg-gray-50 text-sm",
                        ecg.urgency === 'urgent' && "bg-red-50/60 hover:bg-red-100/60",
                        expandedRow === ecg.id && "bg-indigo-50/60"
                      )}
                    >
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems.includes(ecg.id)}
                          onCheckedChange={checked => {
                            setSelectedItems(prev =>
                              checked ? [...prev, ecg.id] : prev.filter(i => i !== ecg.id)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6"
                          onClick={() => setExpandedRow(expandedRow === ecg.id ? null : ecg.id)}>
                          {expandedRow === ecg.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium text-indigo-700">{ecgRef(ecg)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <div>
                            <p className="font-medium leading-tight">{ecg.patient_name}</p>
                            <p className="text-xs text-gray-400">{ecg.gender === 'M' ? 'H' : ecg.gender === 'F' ? 'F' : '—'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="leading-tight">{ecg.medical_center || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="leading-tight">{format(parseISO(ecg.created_at), 'dd/MM HH:mm', { locale: fr })}</p>
                        <p className="text-xs text-gray-400">{formatDistanceToNow(parseISO(ecg.created_at), { addSuffix: true, locale: fr })}</p>
                      </TableCell>
                      <TableCell>
                        {ecg.urgency === 'urgent' ? (
                          <Badge className="bg-red-100 text-red-700 text-xs animate-pulse">
                            <AlertCircle className="h-3 w-3 mr-1" />URGENT
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600 text-xs">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => openAssignDialog([ecg.id])}
                        >
                          <UserCog className="h-3 w-3 mr-1" />
                          Assigner
                        </Button>
                      </TableCell>
                    </TableRow>

                    {expandedRow === ecg.id && (
                      <TableRow key={`${ecg.id}-exp`} className="bg-gray-50">
                        <TableCell colSpan={8} className="p-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Contexte clinique</h4>
                              <p className="text-sm bg-white p-3 rounded border">
                                {ecg.clinical_context || 'Non spécifié'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Assignation directe</h4>
                              <div className="flex flex-col gap-2">
                                {cardiologists.slice(0, 4).map(cardio => (
                                  <Button
                                    key={cardio.id}
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start h-8 text-xs"
                                    onClick={() => {
                                      setItemsToAssign([ecg.id]);
                                      setSelectedCardiologistId(cardio.id);
                                      setAssignDialogOpen(true);
                                    }}
                                  >
                                    <User className="h-3 w-3 mr-2 text-indigo-500" />
                                    {cardio.name}
                                    {cardio.specialty && <span className="ml-1 opacity-60">— {cardio.specialty}</span>}
                                  </Button>
                                ))}
                                {cardiologists.length > 4 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-8 text-xs text-indigo-600"
                                    onClick={() => openAssignDialog([ecg.id])}
                                  >
                                    Voir tous ({cardiologists.length}) cardiologues…
                                  </Button>
                                )}
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
              <span>page {page}/{totalPages}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau ECG déjà assignés */}
      {assignedRecords.length > 0 && (
        <Card>
          <CardHeader className="border-b p-0">
            <div className="px-3 py-2 bg-gray-50 flex items-center gap-2">
              <UserCog className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium">ECG assignés en cours d'analyse</span>
              <Badge variant="secondary" className="text-xs ml-auto">{assignedRecords.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Référence</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Cardiologue assigné</TableHead>
                  <TableHead>Assigné</TableHead>
                  <TableHead>Urgence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedRecords.map((ecg: EcgRecordItem) => {
                  const assignedCardio = cardiologists.find(c => c.id === ecg.assigned_to);
                  return (
                    <TableRow key={ecg.id} className="text-sm">
                      <TableCell className="font-mono text-xs text-indigo-700">{ecgRef(ecg)}</TableCell>
                      <TableCell>{ecg.patient_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{assignedCardio?.name ?? ecg.assigned_to ?? '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {formatDistanceToNow(parseISO(ecg.updated_at), { addSuffix: true, locale: fr })}
                      </TableCell>
                      <TableCell>
                        {ecg.urgency === 'urgent'
                          ? <Badge className="bg-red-100 text-red-700 text-xs">URGENT</Badge>
                          : <Badge variant="outline" className="text-xs">Normal</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog d'assignation */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-indigo-600" />
              Assigner à un cardiologue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              {itemsToAssign.length > 1
                ? `${itemsToAssign.length} ECG seront assignés au cardiologue sélectionné.`
                : 'Cet ECG sera visible uniquement par le cardiologue sélectionné.'}
            </p>
            {loadingCardio ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                Chargement des cardiologues…
              </div>
            ) : cardiologists.length === 0 ? (
              <p className="text-sm text-red-600">Aucun cardiologue actif trouvé.</p>
            ) : (
              <RadioGroup value={selectedCardiologistId} onValueChange={setSelectedCardiologistId} className="space-y-2">
                {cardiologists.map(cardio => (
                  <div key={cardio.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-indigo-50 cursor-pointer">
                    <RadioGroupItem value={cardio.id} id={cardio.id} />
                    <Label htmlFor={cardio.id} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm">{cardio.name}</div>
                      {cardio.specialty && (
                        <div className="text-xs text-gray-500">{cardio.specialty}</div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} disabled={assigning}>
              Annuler
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleAssign}
              disabled={!selectedCardiologistId || assigning || loadingCardio}
            >
              {assigning ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Assignation…</>
              ) : (
                <><UserCog className="h-4 w-4 mr-2" />Confirmer l'assignation</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
