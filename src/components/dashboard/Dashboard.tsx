import { useState } from 'react';
import { 
  Activity, 
  Search, 
  FileText, 
  Eye,
  RefreshCw,
  Building2,
  ChevronRight,
  InboxIcon,
  BarChart2,
  AlertCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Calendar,
  StickyNote,
  UserPlus,
  LogOut,
  User,
  Settings,
  Bell,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserSession } from '@/App';

interface DashboardProps {
  user: UserSession;
  onLogout: () => void;
}

// Types
interface ECGRecord {
  id: string;
  patientName: string;
  gender: 'M' | 'F';
  medicalCenter: string;
  date: string;
  status: 'pending' | 'analyzing' | 'completed';
  viewed: boolean;
  referringDoctor: string;
}

interface Hospital {
  id: string;
  name: string;
  pendingCount: number;
}

// Données de démonstration
const mockRecords: ECGRecord[] = [
  {
    id: 'ECG-2024-0409',
    patientName: 'Pierre Dupont',
    gender: 'M',
    medicalCenter: 'Hôpital Saint-Louis',
    date: '2024-12-25',
    status: 'pending',
    viewed: false,
    referringDoctor: 'Dr. Jean Martin'
  },
  {
    id: 'ECG-2024-0408',
    patientName: 'Marie Laurent',
    gender: 'F',
    medicalCenter: 'Clinique du Sport',
    date: '2024-12-25',
    status: 'analyzing',
    viewed: true,
    referringDoctor: 'Dr. Sophie Bernard'
  },
  {
    id: 'ECG-2024-0407',
    patientName: 'Jean-Paul Mercier',
    gender: 'M',
    medicalCenter: 'Centre Cardio Paris',
    date: '2024-12-24',
    status: 'completed',
    viewed: true,
    referringDoctor: 'Dr. François Dubois'
  },
  {
    id: 'ECG-2024-0406',
    patientName: 'Élise Moreau',
    gender: 'F',
    medicalCenter: 'Hôpital Saint-Louis',
    date: '2024-12-24',
    status: 'pending',
    viewed: false,
    referringDoctor: 'Dr. Jean Martin'
  },
  {
    id: 'ECG-2024-0405',
    patientName: 'Robert Petit',
    gender: 'M',
    medicalCenter: 'Institut Cœur Paris',
    date: '2024-12-23',
    status: 'completed',
    viewed: true,
    referringDoctor: 'Dr. Claire Leroy'
  }
];

const mockHospitals: Hospital[] = [
  { id: '1', name: 'Hôpital Saint-Louis', pendingCount: 12 },
  { id: '2', name: 'Clinique du Sport', pendingCount: 5 },
  { id: '3', name: 'Centre Cardio Paris', pendingCount: 8 },
  { id: '4', name: 'Hôpital Américain', pendingCount: 3 },
  { id: '5', name: 'Institut Cœur Paris', pendingCount: 6 }
];

const stats = {
  today: { received: 45, analyzed: 42, sent: 40 },
  week: { received: 312, analyzed: 298, sent: 285 },
  month: { received: 1234, analyzed: 1200, sent: 1180 }
};

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [statsTimeframe, setStatsTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: ECGRecord['status']) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      analyzing: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800'
    };
    const labels = {
      pending: 'En attente',
      analyzing: 'En cours',
      completed: 'Terminé'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredRecords = mockRecords.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = mockHospitals.reduce((sum, h) => sum + h.pendingCount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 h-14">
        <div className="w-full px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                <Heart className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                Xpress-ECG
              </h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-indigo-600 bg-indigo-50">
                Tableau de bord
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
                Rapports
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
                Statistiques
              </Button>
            </nav>

            {/* Recherche */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher un patient, ECG..."
                className="pl-9 h-9 w-[280px] bg-gray-50/80 border-gray-200 focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Menu utilisateur */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </button>
                  <div className="border-t my-1"></div>
                  <button 
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Barre secondaire */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Tous les établissements</option>
              {mockHospitals.map(h => (
                <option key={h.id}>{h.name}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" className="h-9">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          <Button variant="outline" size="sm" className="h-9">
            <BarChart2 className="h-4 w-4 mr-2" />
            Statistiques
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50/50 overflow-y-auto">
          <div className="p-4 space-y-2">
            <button
              onClick={() => setSelectedHospital(null)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                selectedHospital === null 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <InboxIcon className="h-4 w-4" />
              <span>Nouveaux ECG</span>
              <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                {totalPending}
              </span>
            </button>

            <button
              onClick={() => setSelectedHospital('urgent')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                selectedHospital === 'urgent' 
                  ? 'bg-red-100 text-red-700' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>ECG urgents</span>
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                3
              </span>
            </button>

            <button
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors hover:bg-gray-100 text-gray-700"
            >
              <UserPlus className="h-4 w-4" />
              <span>Second Avis</span>
              <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                2
              </span>
            </button>
          </div>
          
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <Building2 className="h-3.5 w-3.5" />
              <span>Établissements</span>
            </div>
            <div className="space-y-1">
              {mockHospitals.map(hospital => (
                <button
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    selectedHospital === hospital.id 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="truncate">{hospital.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {hospital.pendingCount}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone principale */}
        <div className="flex-1 overflow-auto p-6">
          {/* Statistiques rapides */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats[statsTimeframe].received}</p>
                <p className="text-xs text-gray-500">Reçus</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats[statsTimeframe].analyzed}</p>
                <p className="text-xs text-gray-500">Analysés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats[statsTimeframe].sent}</p>
                <p className="text-xs text-gray-500">Envoyés</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select 
                value={statsTimeframe}
                onChange={(e) => setStatsTimeframe(e.target.value as 'today' | 'week' | 'month')}
                className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>

          {/* Tableau des ECG */}
          <Card className="border shadow-sm">
            <CardHeader className="py-4 border-b bg-gray-50/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold text-gray-900">
                  📥 Nouveaux ECG en attente
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {filteredRecords.length} résultat{filteredRecords.length > 1 ? 's' : ''}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Sexe</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Établissement</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Statut</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr 
                      key={record.id} 
                      className="border-b hover:bg-indigo-50/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-indigo-600 font-medium text-sm hover:underline">
                          {record.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-sm text-gray-900">
                        {record.patientName}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                          record.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {record.gender}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.medicalCenter}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-indigo-100"
                            title="Ouvrir l'ECG"
                          >
                            <FileText className="h-4 w-4 text-indigo-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${record.viewed ? 'text-green-600' : 'text-gray-400'}`}
                            title={record.viewed ? 'Vu' : 'Non vu'}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-amber-100"
                            title="Notes"
                          >
                            <StickyNote className="h-4 w-4 text-amber-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <select className="h-8 px-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>5 par page</option>
                    <option>10 par page</option>
                    <option>20 par page</option>
                  </select>
                  <span className="text-sm text-gray-500">
                    1-5 sur {filteredRecords.length}
                  </span>
                </div>

                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm" className="h-8 w-8 px-0 bg-indigo-600">
                    1
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

