import { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Search,
  Mail,
  Building2,
  Shield,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Key,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'cardiologue' | 'medecin' | 'secretaire';
  hospital: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

interface AdminUsersPageProps {
  onClose: () => void;
}

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@hopital.fr',
    phone: '06 12 34 56 78',
    role: 'cardiologue',
    hospital: 'CHU Paris',
    isActive: true,
    lastLogin: '2024-12-26T10:30:00',
    createdAt: '2024-01-15T09:00:00',
  },
  {
    id: '2',
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@clinique.fr',
    phone: '06 98 76 54 32',
    role: 'medecin',
    hospital: 'Clinique du Parc',
    isActive: true,
    lastLogin: '2024-12-25T14:20:00',
    createdAt: '2024-03-20T11:30:00',
  },
  {
    id: '3',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@hopital.fr',
    phone: '06 11 22 33 44',
    role: 'secretaire',
    hospital: 'CHU Paris',
    isActive: true,
    lastLogin: '2024-12-26T08:00:00',
    createdAt: '2024-02-10T10:00:00',
  },
  {
    id: '4',
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@xpress-ecg.fr',
    phone: '01 23 45 67 89',
    role: 'admin',
    hospital: 'Tous',
    isActive: true,
    lastLogin: '2024-12-26T11:00:00',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: '5',
    firstName: 'Pierre',
    lastName: 'Lefevre',
    email: 'pierre.lefevre@hopital.fr',
    phone: '06 55 66 77 88',
    role: 'cardiologue',
    hospital: 'Hôpital Saint-Louis',
    isActive: false,
    lastLogin: '2024-11-15T16:45:00',
    createdAt: '2024-04-05T14:00:00',
  },
];

export function AdminUsersPage({ onClose }: AdminUsersPageProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [_selectedUser, _setSelectedUser] = useState<string | null>(null);

  // Filter users
  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter === 'active' && !user.isActive) return false;
    if (statusFilter === 'inactive' && user.isActive) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.hospital.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getRoleBadge = (role: User['role']) => {
    const config = {
      admin: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', label: 'Admin' },
      cardiologue: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300', label: 'Cardiologue' },
      medecin: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Médecin' },
      secretaire: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Secrétaire' },
    };
    const { color, label } = config[role];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Shield className="h-3 w-3" />
        {label}
      </span>
    );
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const deleteUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Gestion des utilisateurs
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {users.length} utilisateurs • {users.filter(u => u.isActive).length} actifs
                  </p>
                </div>
              </div>
            </div>

            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsAddModalOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="cardiologue">Cardiologue</option>
              <option value="medecin">Médecin</option>
              <option value="secretaire">Secrétaire</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Établissement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <Building2 className="h-3 w-3" />
                      {user.hospital}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        <XCircle className="h-3 w-3" />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      {format(new Date(user.lastLogin), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {user.isActive ? (
                          <XCircle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert('Réinitialiser le mot de passe')}
                        title="Réinitialiser le mot de passe"
                      >
                        <Key className="h-4 w-4 text-indigo-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                        title="Supprimer"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun utilisateur trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Modifiez vos filtres ou créez un nouvel utilisateur
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingUser}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="md"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom
              </label>
              <input
                type="text"
                defaultValue={editingUser?.firstName}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom
              </label>
              <input
                type="text"
                defaultValue={editingUser?.lastName}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              defaultValue={editingUser?.email}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              defaultValue={editingUser?.phone}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rôle
              </label>
              <select
                defaultValue={editingUser?.role || 'medecin'}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="admin">Administrateur</option>
                <option value="cardiologue">Cardiologue</option>
                <option value="medecin">Médecin</option>
                <option value="secretaire">Secrétaire</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Établissement
              </label>
              <select
                defaultValue={editingUser?.hospital || ''}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Sélectionner...</option>
                <option value="CHU Paris">CHU Paris</option>
                <option value="Clinique du Parc">Clinique du Parc</option>
                <option value="Hôpital Saint-Louis">Hôpital Saint-Louis</option>
                <option value="Tous">Tous les établissements</option>
              </select>
            </div>
          </div>

          {!editingUser && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                ⚡ Un email avec les identifiants sera envoyé à l'utilisateur.
              </p>
            </div>
          )}
        </form>

        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAddModalOpen(false);
              setEditingUser(null);
            }}
          >
            Annuler
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            {editingUser ? 'Sauvegarder' : 'Créer l\'utilisateur'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
