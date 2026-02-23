import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Plus,
  ChevronLeft,
  ChevronRight,
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
  const [page, setPage] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ⌨️ Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N : Nouvel utilisateur
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

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = users.filter(u => u.status === 'active').length;
  const pendingCount = users.filter(u => u.status === 'pending').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;

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

  useEffect(() => { setPage(1); }, [searchTerm, roleFilter, statusFilter]);

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
    <div className="space-y-3">
      {/* En-tête + Pills + Filtres */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Utilisateurs
          </h1>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700">
            <span className="font-bold">{users.length}</span>
            <span className="opacity-75">total</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-xs font-medium text-green-700">
            <span className="font-bold">{activeCount}</span>
            <span className="opacity-75">actifs</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-xs font-medium text-amber-700">
            <span className="font-bold">{pendingCount}</span>
            <span className="opacity-75">attente</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
            <span className="font-bold">{inactiveCount}</span>
            <span className="opacity-75">inactifs</span>
          </span>
        </div>
      </div>

      {/* Table utilisateurs */}
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
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="cardiologue">Cardio</SelectItem>
              <SelectItem value="medecin">Médecin</SelectItem>
              <SelectItem value="secretaire">Secrét.</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="pending">Attente</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-gray-400">{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}</span>
          <Button onClick={handleOpenNew} size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs" title="Ctrl+N">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nouveau
          </Button>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 h-9">
              <TableRow>
                <TableHead className="text-xs">Utilisateur</TableHead>
                <TableHead className="text-xs">Rôle</TableHead>
                <TableHead className="text-xs">Établissement</TableHead>
                <TableHead className="text-xs">Statut</TableHead>
                <TableHead className="text-xs">Connexion</TableHead>
                <TableHead className="text-xs">ECG</TableHead>
                <TableHead className="text-xs text-right w-[100px]">Actions</TableHead>
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
                paginatedUsers.map((user) => (
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
