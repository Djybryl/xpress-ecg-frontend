import { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus,
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
import { useAdminStore, type Hospital } from '@/stores/useAdminStore';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function HospitalManagement() {
  const { toast } = useToast();
  const { 
    hospitals, 
    getStats,
    addHospital, 
    updateHospital, 
    deleteHospital 
  } = useAdminStore();
  const stats = getStats();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isNewHospital, setIsNewHospital] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Filtrage
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hospital.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculs
  const totalECG = hospitals.reduce((acc, h) => acc + h.ecgCount, 0);
  const totalUsers = hospitals.reduce((acc, h) => acc + h.userCount, 0);

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

  const handleOpenEdit = (hospital: Hospital) => {
    setIsNewHospital(false);
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name,
      address: hospital.address,
      city: hospital.city,
      phone: hospital.phone,
      email: hospital.email,
      status: hospital.status
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (isNewHospital) {
      addHospital(formData);
      toast({
        title: "Établissement créé",
        description: `${formData.name} a été ajouté avec succès.`
      });
    } else if (selectedHospital) {
      updateHospital(selectedHospital.id, formData);
      toast({
        title: "Établissement modifié",
        description: `Les informations de ${formData.name} ont été mises à jour.`
      });
    }
    setEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedHospital) {
      deleteHospital(selectedHospital.id);
      toast({
        title: "Établissement supprimé",
        description: `${selectedHospital.name} a été supprimé.`,
        variant: "destructive"
      });
    }
    setDeleteDialogOpen(false);
    setSelectedHospital(null);
  };

  const handleToggleStatus = (hospital: Hospital) => {
    const newStatus = hospital.status === 'active' ? 'inactive' : 'active';
    updateHospital(hospital.id, { status: newStatus });
    toast({
      title: newStatus === 'active' ? "Établissement activé" : "Établissement désactivé",
      description: `${hospital.name} est maintenant ${newStatus === 'active' ? 'actif' : 'inactif'}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            Gestion des établissements
          </h1>
          <p className="text-gray-500 mt-1">Gérez les hôpitaux et cliniques partenaires</p>
        </div>
        <Button onClick={handleOpenNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel établissement
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-indigo-700">{stats.totalHospitals}</p>
              </div>
              <div className="h-10 w-10 bg-indigo-200 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-indigo-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Actifs</p>
                <p className="text-2xl font-bold text-green-700">{stats.activeHospitals}</p>
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
                <p className="text-blue-600 text-sm font-medium">Utilisateurs</p>
                <p className="text-2xl font-bold text-blue-700">{totalUsers}</p>
              </div>
              <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">ECG total</p>
                <p className="text-2xl font-bold text-purple-700">{totalECG.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des établissements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Établissements ({filteredHospitals.length})
          </CardTitle>
        </CardHeader>
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
              {filteredHospitals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun établissement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredHospitals.map((hospital) => (
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
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{hospital.userCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{hospital.ecgCount.toLocaleString()}</span>
                      </div>
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
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              {isNewHospital ? 'Créer' : 'Enregistrer'}
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
