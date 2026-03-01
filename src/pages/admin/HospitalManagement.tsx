import { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Search, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Users,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHospitalList, type HospitalItem } from '@/hooks/useHospitalList';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function HospitalManagement() {
  const { toast } = useToast();
  const { hospitals, loading, error, createHospital, updateHospital, deleteHospital } = useHospitalList();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<HospitalItem | null>(null);
  const [isNewHospital, setIsNewHospital] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ⌨️ Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N : Nouvel établissement
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !editDialogOpen) {
        e.preventDefault();
        handleOpenNew();
      }
      // Ctrl+F : Focus recherche
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editDialogOpen]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive'
  });

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hospital.city ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hospital.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredHospitals.length / PAGE_SIZE));
  const paginatedHospitals = filteredHospitals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = hospitals.filter(h => h.status === 'active').length;
  const inactiveCount = hospitals.filter(h => h.status === 'inactive').length;

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const handleOpenNew = () => {
    setIsNewHospital(true);
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      status: 'active'
    });
    setEditDialogOpen(true);
  };

  const handleOpenEdit = (hospital: HospitalItem) => {
    setIsNewHospital(false);
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name,
      address: hospital.address ?? '',
      city: hospital.city ?? '',
      phone: hospital.phone ?? '',
      email: hospital.email ?? '',
      status: hospital.status === 'pending' ? 'active' : hospital.status
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNewHospital) {
        await createHospital({
          name: formData.name,
          address: formData.address || undefined,
          city: formData.city || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        });
        toast({ title: 'Établissement créé', description: `${formData.name} a été ajouté avec succès.` });
      } else if (selectedHospital) {
        await updateHospital(selectedHospital.id, {
          name: formData.name,
          address: formData.address || null,
          city: formData.city || null,
          phone: formData.phone || null,
          email: formData.email || null,
          status: formData.status,
        });
        toast({ title: 'Établissement modifié', description: `Les informations de ${formData.name} ont été mises à jour.` });
      }
      setEditDialogOpen(false);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedHospital) {
      try {
        await deleteHospital(selectedHospital.id);
        toast({ title: 'Établissement supprimé', description: `${selectedHospital.name} a été supprimé.`, variant: 'destructive' });
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de supprimer.', variant: 'destructive' });
      }
    }
    setDeleteDialogOpen(false);
    setSelectedHospital(null);
  };

  const handleToggleStatus = async (hospital: HospitalItem) => {
    const newStatus = hospital.status === 'active' ? 'inactive' : 'active';
    try {
      await updateHospital(hospital.id, { status: newStatus });
      toast({
        title: newStatus === 'active' ? 'Établissement activé' : 'Établissement désactivé',
        description: `${hospital.name} est maintenant ${newStatus === 'active' ? 'actif' : 'inactif'}.`
      });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de modifier le statut.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      )}
      {/* En-tête + Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Établissements
          </h1>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700">
            {loading ? <span className="inline-block w-5 h-3 bg-indigo-200 rounded animate-pulse" /> : <span className="font-bold">{hospitals.length}</span>}
            <span className="opacity-75">total</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-xs font-medium text-green-700">
            <span className="font-bold">{activeCount}</span>
            <span className="opacity-75">actifs</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
            <span className="font-bold">{inactiveCount}</span>
            <span className="opacity-75">inactifs</span>
          </span>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="Rechercher... (Ctrl+F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 w-[180px] text-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-gray-400">
            {loading ? 'Chargement…' : `${filteredHospitals.length} établissement${filteredHospitals.length > 1 ? 's' : ''}`}
          </span>
          <Button onClick={handleOpenNew} size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs" title="Ctrl+N">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nouveau
          </Button>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Établissement</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead>ECG</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">Chargement…</TableCell>
                </TableRow>
              ) : filteredHospitals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun établissement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHospitals.map((hospital) => (
                  <TableRow key={hospital.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          hospital.status === 'active' ? "bg-indigo-100" : "bg-gray-100"
                        )}>
                          <Building2 className={cn(
                            "h-5 w-5",
                            hospital.status === 'active' ? "text-indigo-600" : "text-gray-400"
                          )} />
                        </div>
                        <div>
                          <p className="font-medium">{hospital.name}</p>
                          <p className="text-xs text-gray-500">ID: {hospital.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p>{hospital.address}</p>
                          <p className="text-gray-500">{hospital.city}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {hospital.phone}
                        </p>
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {hospital.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400">-</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400">-</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        hospital.status === 'active' 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      )}>
                        {hospital.status === 'active' ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" />Actif</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" />Inactif</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(hospital)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(hospital)}>
                            {hospital.status === 'active' ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedHospital(hospital);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 py-2 border-t">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(1)} title="Première page">«</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-slate-500 px-2">{page} / {totalPages}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(totalPages)} title="Dernière page">»</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition/création */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isNewHospital ? 'Nouvel établissement' : 'Modifier l\'établissement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de l'établissement</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Hôpital Saint-Louis"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="1 Avenue Claude Vellefaux"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Paris"
                />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value as 'active' | 'inactive'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="01 42 49 49 49"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contact@hopital.fr"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
              {saving ? 'Sauvegarde…' : isNewHospital ? 'Créer' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'établissement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedHospital?.name} ? 
              Cette action est irréversible et supprimera également les utilisateurs associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
