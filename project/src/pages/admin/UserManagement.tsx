import { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  Activity,
  UserCheck,
  UserX
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
import { 
  useAdminStore, 
  roleLabels, 
  statusLabels, 
  roleColors, 
  statusColors,
  type SystemUser,
  type UserRole,
  type UserStatus
} from '@/stores/useAdminStore';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function UserManagement() {
  const { toast } = useToast();
  const { 
    users, 
    hospitals,
    getStats,
    addUser, 
    updateUser, 
    deleteUser,
    activateUser,
    deactivateUser 
  } = useAdminStore();
  const stats = getStats();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'medecin' as UserRole,
    status: 'active' as UserStatus,
    hospitalId: '',
    phone: '',
    specialty: ''
  });

  // Filtrage
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenNew = () => {
    setIsNewUser(true);
    setFormData({
      name: '',
      email: '',
      role: 'medecin',
      status: 'active',
      hospitalId: '',
      phone: '',
      specialty: ''
    });
    setEditDialogOpen(true);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setIsNewUser(false);
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      hospitalId: user.hospitalId || '',
      phone: user.phone || '',
      specialty: user.specialty || ''
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    const hospital = hospitals.find(h => h.id === formData.hospitalId);
    
    if (isNewUser) {
      addUser({
        ...formData,
        hospital: hospital?.name,
      });
      toast({
        title: "Utilisateur créé",
        description: `${formData.name} a été ajouté avec succès.`
      });
    } else if (selectedUser) {
      updateUser(selectedUser.id, {
        ...formData,
        hospital: hospital?.name,
      });
      toast({
        title: "Utilisateur modifié",
        description: `Les informations de ${formData.name} ont été mises à jour.`
      });
    }
    setEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      toast({
        title: "Utilisateur supprimé",
        description: `${selectedUser.name} a été supprimé.`,
        variant: "destructive"
      });
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = (user: SystemUser) => {
    if (user.status === 'active') {
      deactivateUser(user.id);
      toast({
        title: "Utilisateur désactivé",
        description: `${user.name} a été désactivé.`
      });
    } else {
      activateUser(user.id);
      toast({
        title: "Utilisateur activé",
        description: `${user.name} a été activé.`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-500 mt-1">Gérez les comptes utilisateurs de la plateforme</p>
        </div>
        <Button onClick={handleOpenNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-indigo-700">{stats.totalUsers}</p>
              </div>
              <div className="h-10 w-10 bg-indigo-200 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Actifs</p>
                <p className="text-2xl font-bold text-green-700">{stats.activeUsers}</p>
              </div>
              <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">En attente</p>
                <p className="text-2xl font-bold text-amber-700">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
              <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Inactifs</p>
                <p className="text-2xl font-bold text-gray-700">
                  {users.filter(u => u.status === 'inactive').length}
                </p>
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <UserX className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="cardiologue">Cardiologue</SelectItem>
                <SelectItem value="medecin">Médecin</SelectItem>
                <SelectItem value="secretaire">Secrétaire</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Utilisateurs ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Établissement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>ECG</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-white font-medium",
                          user.role === 'cardiologue' && "bg-indigo-500",
                          user.role === 'medecin' && "bg-emerald-500",
                          user.role === 'secretaire' && "bg-amber-500",
                          user.role === 'admin' && "bg-slate-500"
                        )}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(roleColors[user.role])}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.hospital ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {user.hospital}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(statusColors[user.status])}>
                        {user.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {user.status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
                        {user.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {statusLabels[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <span className="text-sm text-gray-600">
                          {formatDistanceToNow(parseISO(user.lastLogin), { addSuffix: true, locale: fr })}
                        </span>
                      ) : (
                        <span className="text-gray-400">Jamais</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.ecgCount !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-gray-400" />
                          <span>{user.ecgCount}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.status === 'active' ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedUser(user);
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
              {isNewUser ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Dr. Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="jean.dupont@hopital.fr"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value as UserRole})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiologue">Cardiologue</SelectItem>
                    <SelectItem value="medecin">Médecin</SelectItem>
                    <SelectItem value="secretaire">Secrétaire</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value as UserStatus})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Établissement</Label>
              <Select 
                value={formData.hospitalId} 
                onValueChange={(value) => setFormData({...formData, hospitalId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un établissement" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="01 23 45 67 89"
              />
            </div>
            {(formData.role === 'cardiologue' || formData.role === 'medecin') && (
              <div className="space-y-2">
                <Label>Spécialité</Label>
                <Input
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  placeholder="Cardiologie générale"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              {isNewUser ? 'Créer' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedUser?.name} ? 
              Cette action est irréversible.
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
