import { useState, useEffect } from 'react';
import { 
  UserCog, 
  Search, 
  Filter,
  User,
  Building2,
  Clock,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Users,
  Activity,
  Zap
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useECGQueueStore, cardiologists, type ECGQueueItem } from '@/stores/useECGQueueStore';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function ECGAssignment() {
  const { toast } = useToast();
  const { getByStatus, assignECG, getCounts } = useECGQueueStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const PAGE_SIZE = 10;
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCardiologist, setSelectedCardiologist] = useState<string>('');
  const [itemsToAssign, setItemsToAssign] = useState<string[]>([]);

  // ECG validés (prêts à être assignés)
  const validatedECGs = getByStatus('validated');
  // ECG en cours d'analyse
  const analyzingECGs = getByStatus(['assigned', 'analyzing']);
  const counts = getCounts();

  // Filtrage
  const filteredECGs = validatedECGs.filter(ecg => {
    const matchesSearch = 
      ecg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.referringDoctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || ecg.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  }).sort((a, b) => {
    if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
    if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
    return new Date(a.dateValidated || a.dateReceived).getTime() - new Date(b.dateValidated || b.dateReceived).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(filteredECGs.length / PAGE_SIZE));
  const paginatedECGs = filteredECGs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [searchTerm, urgencyFilter]);

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

  const openAssignDialog = (ids: string[]) => {
    setItemsToAssign(ids);
    setSelectedCardiologist('');
    setAssignDialogOpen(true);
  };

  const handleAssign = () => {
    if (!selectedCardiologist) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un cardiologue.",
        variant: "destructive"
      });
      return;
    }

    const cardiologistName = cardiologists.find(c => c.id === selectedCardiologist)?.name || '';
    
    itemsToAssign.forEach(id => {
      assignECG(id, cardiologistName);
    });

    toast({
      title: "ECG assigné(s)",
      description: `${itemsToAssign.length} ECG assigné(s) à ${cardiologistName}.`
    });

    setAssignDialogOpen(false);
    setSelectedItems([]);
    setItemsToAssign([]);
  };

  // Auto-assignation intelligente
  const handleAutoAssign = () => {
    const availableCardiologists = cardiologists.filter(c => c.available);
    if (availableCardiologists.length === 0) {
      toast({
        title: "Aucun cardiologue disponible",
        description: "Tous les cardiologues sont occupés.",
        variant: "destructive"
      });
      return;
    }

    // Assigner à celui qui a le moins de charge
    const leastLoaded = availableCardiologists.reduce((prev, curr) => 
      prev.currentLoad < curr.currentLoad ? prev : curr
    );

    const urgentFirst = [...filteredECGs].sort((a, b) => {
      if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
      if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
      return 0;
    });

    urgentFirst.forEach(ecg => {
      assignECG(ecg.id, leastLoaded.name);
    });

    toast({
      title: "Auto-assignation terminée",
      description: `${filteredECGs.length} ECG assignés automatiquement.`
    });
  };

  const [autoAssignConfirm, setAutoAssignConfirm] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <UserCog className="h-5 w-5 text-indigo-600" />
          Assignation ECG
          {counts.validated > 0 && <Badge variant="secondary" className="text-xs">{counts.validated}</Badge>}
        </h1>
        <Button 
          onClick={() => setAutoAssignConfirm(true)}
          disabled={filteredECGs.length === 0}
          size="sm"
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
        >
          <Zap className="h-3.5 w-3.5 mr-1.5" />
          Auto-assignation
        </Button>
      </div>

      {/* Pills cardiologues */}
      <div className="flex items-center gap-2 flex-wrap">
        {cardiologists.map(cardio => (
          <div
            key={cardio.id}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
              cardio.available ? "border-green-300 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-gray-50"
            )}
          >
            <User className="h-3 w-3" />
            <span>{cardio.name}</span>
            <span className="opacity-75">({cardio.currentLoad})</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b p-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Patient, Référence, médecin…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-xs w-48" />
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
              <Button onClick={() => openAssignDialog(selectedItems)} size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 ml-auto">
                <UserCog className="h-3.5 w-3.5 mr-1.5" />Assigner ({selectedItems.length})
              </Button>
            )}
            <span className="ml-auto text-xs text-gray-400">{filteredECGs.length} ECG</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredECGs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucun ECG à assigner</p>
              <p className="text-sm">Les ECG validés apparaîtront ici</p>
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
                  <TableHead>Validé</TableHead>
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
                        <div>
                          <p className="text-sm">
                            {ecg.dateValidated && format(parseISO(ecg.dateValidated), 'dd/MM HH:mm', { locale: fr })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ecg.dateValidated && formatDistanceToNow(parseISO(ecg.dateValidated), { addSuffix: true, locale: fr })}
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
                        <Button
                          size="sm"
                          onClick={() => openAssignDialog([ecg.id])}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Assigner
                        </Button>
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
                              <h4 className="font-semibold text-sm mb-2">Assignation rapide</h4>
                              <div className="space-y-2">
                                {cardiologists.filter(c => c.available).map(cardio => (
                                  <Button
                                    key={cardio.id}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => {
                                      assignECG(ecg.id, cardio.name);
                                      toast({
                                        title: "ECG assigné",
                                        description: `${ecg.id} assigné à ${cardio.name}.`
                                      });
                                      setExpandedRow(null);
                                    }}
                                  >
                                    <User className="h-4 w-4 mr-2" />
                                    {cardio.name}
                                    <span className="ml-auto text-xs text-gray-500">
                                      {cardio.currentLoad} ECG
                                    </span>
                                  </Button>
                                ))}
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

      {/* ECG en cours d'analyse */}
      {analyzingECGs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              ECG en cours d'analyse
              <Badge variant="secondary" className="ml-2">{analyzingECGs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Référence</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Cardiologue</TableHead>
                  <TableHead>Assigné</TableHead>
                  <TableHead>Urgence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyzingECGs.map((ecg) => (
                  <TableRow 
                    key={ecg.id}
                    className={cn(
                      ecg.urgency === 'urgent' && "bg-amber-50"
                    )}
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      {ecg.id}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{ecg.patientName}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-indigo-600" />
                        </div>
                        <span className="text-sm">{ecg.assignedTo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {ecg.dateAssigned && formatDistanceToNow(parseISO(ecg.dateAssigned), { addSuffix: true, locale: fr })}
                    </TableCell>
                    <TableCell>
                      {ecg.urgency === 'urgent' ? (
                        <Badge className="bg-red-100 text-red-700">URGENT</Badge>
                      ) : (
                        <Badge variant="outline">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog confirmation auto-assignation */}
      <Dialog open={autoAssignConfirm} onOpenChange={setAutoAssignConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-assignation</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Assigner les {filteredECGs.length} ECG à l'équilibre de charge (cardiologue le moins chargé) ?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoAssignConfirm(false)}>Annuler</Button>
            <Button onClick={() => { handleAutoAssign(); setAutoAssignConfirm(false); }}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'assignation */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-indigo-600" />
              Assigner {itemsToAssign.length} ECG
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Sélectionnez le cardiologue qui prendra en charge ces ECG.
            </p>
            
            <RadioGroup value={selectedCardiologist} onValueChange={setSelectedCardiologist}>
              {cardiologists.map(cardio => (
                <div
                  key={cardio.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    selectedCardiologist === cardio.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300",
                    !cardio.available && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <RadioGroupItem 
                    value={cardio.id} 
                    id={cardio.id}
                    disabled={!cardio.available}
                  />
                  <Label 
                    htmlFor={cardio.id} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cardio.name}</p>
                        <p className="text-xs text-gray-500">{cardio.specialty}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={cardio.available ? "default" : "secondary"} className="text-xs">
                          {cardio.available ? 'Disponible' : 'Occupé'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {cardio.currentLoad} ECG en cours
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedCardiologist}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmer l'assignation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
