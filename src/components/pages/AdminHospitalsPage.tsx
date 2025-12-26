import { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  MapPin,
  Phone,
  Mail,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { useECGStore } from '@/stores/ecgStore';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  isActive: boolean;
  usersCount: number;
  ecgCount: number;
  monthlyEcg: number;
}

interface AdminHospitalsPageProps {
  onClose: () => void;
}

export function AdminHospitalsPage({ onClose }: AdminHospitalsPageProps) {
  const { hospitals: storeHospitals } = useECGStore();
  
  // Extend store hospitals with more data
  const [hospitals, setHospitals] = useState<Hospital[]>(
    storeHospitals.map(h => ({
      ...h,
      address: '123 Rue de la Santé',
      city: 'Paris',
      phone: '01 23 45 67 89',
      email: `contact@${h.name.toLowerCase().replace(/\s/g, '-')}.fr`,
      isActive: true,
      usersCount: Math.floor(Math.random() * 20) + 5,
      ecgCount: Math.floor(Math.random() * 500) + 100,
      monthlyEcg: Math.floor(Math.random() * 100) + 20,
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [_selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Filter hospitals
  const filteredHospitals = hospitals.filter(hospital => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        hospital.name.toLowerCase().includes(query) ||
        hospital.city.toLowerCase().includes(query) ||
        hospital.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Stats
  const totalStats = {
    hospitals: hospitals.length,
    activeHospitals: hospitals.filter(h => h.isActive).length,
    totalUsers: hospitals.reduce((sum, h) => sum + h.usersCount, 0),
    totalEcg: hospitals.reduce((sum, h) => sum + h.ecgCount, 0),
  };

  const toggleHospitalStatus = (hospitalId: string) => {
    setHospitals(hospitals.map(h => 
      h.id === hospitalId ? { ...h, isActive: !h.isActive } : h
    ));
  };

  const deleteHospital = (hospitalId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
      setHospitals(hospitals.filter(h => h.id !== hospitalId));
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
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Gestion des établissements
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalStats.hospitals} établissements • {totalStats.activeHospitals} actifs
                  </p>
                </div>
              </div>
            </div>

            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel établissement
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Établissements</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStats.hospitals}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{totalStats.activeHospitals}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Utilisateurs</p>
                <p className="text-2xl font-bold text-indigo-600">{totalStats.totalUsers}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ECG Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStats.totalEcg}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                <Activity className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un établissement..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {hospital.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {hospital.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hospital.city}
                      </p>
                    </div>
                  </div>
                  {hospital.isActive ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Actif
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      Inactif
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 grid grid-cols-3 gap-4 border-b dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{hospital.usersCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Utilisateurs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{hospital.ecgCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ECG Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{hospital.monthlyEcg}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ce mois</p>
                </div>
              </div>

              {/* Contact */}
              <div className="p-4 space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {hospital.phone}
                </p>
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {hospital.email}
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/30">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingHospital(hospital)}
                    title="Modifier"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedHospital(hospital)}
                    title="Statistiques"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Paramètres"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHospitalStatus(hospital.id)}
                    title={hospital.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {hospital.isActive ? (
                      <XCircle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHospital(hospital.id)}
                    title="Supprimer"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun établissement trouvé</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Modifiez votre recherche ou créez un nouvel établissement
            </p>
          </div>
        )}
      </main>

      {/* Add/Edit Hospital Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingHospital}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHospital(null);
        }}
        title={editingHospital ? 'Modifier l\'établissement' : 'Nouvel établissement'}
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de l'établissement
            </label>
            <input
              type="text"
              defaultValue={editingHospital?.name}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="CHU Paris"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse
            </label>
            <input
              type="text"
              defaultValue={editingHospital?.address}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="123 Rue de la Santé"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ville
              </label>
              <input
                type="text"
                defaultValue={editingHospital?.city}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                defaultValue={editingHospital?.phone}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="01 23 45 67 89"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              defaultValue={editingHospital?.email}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="contact@hopital.fr"
            />
          </div>
        </form>

        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAddModalOpen(false);
              setEditingHospital(null);
            }}
          >
            Annuler
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            {editingHospital ? 'Sauvegarder' : 'Créer l\'établissement'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
