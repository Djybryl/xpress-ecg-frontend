import { useState, useEffect } from 'react';
import { 
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
  Heart,
  Zap,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ECGViewerPage, type ECGRecord as ViewerECGRecord, type ECGMeasurements } from '@/components/ecg-viewer';
import { 
  NotificationsPanel, 
  NotesModal, 
  StatisticsDrawer, 
  SearchPalette,
  ThemeToggle,
  ConnectionStatus
} from '@/components/shared';
import { useAppStore } from '@/stores/appStore';
import { useECGStore } from '@/stores/ecgStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { UserSession } from '@/App';

interface DashboardProps {
  user: UserSession;
  onLogout: () => void;
  onNavigate: (page: 'profile' | 'settings' | 'reports' | 'statistics') => void;
}

export function Dashboard({ user, onLogout, onNavigate }: DashboardProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);
  const [showSearchPalette, setShowSearchPalette] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNoteECG, setSelectedNoteECG] = useState<{ id: string; ref: string } | null>(null);
  
  // État pour le visualiseur ECG
  const [selectedECGId, setSelectedECGId] = useState<string | null>(null);

  // Stores
  const { lockSession, addNotification } = useAppStore();
  const { 
    records, 
    hospitals, 
    filters, 
    setFilters,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    paginatedRecords,
    filteredRecords,
    totalPages,
    getStats,
    isRefreshing,
    setIsRefreshing
  } = useECGStore();

  const [statsTimeframe, setStatsTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const stats = getStats(statsTimeframe);
  const displayedRecords = paginatedRecords();
  const totalFiltered = filteredRecords().length;

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setShowSearchPalette(true),
    onEscape: () => {
      setShowSearchPalette(false);
      setShowUserMenu(false);
      setShowNotifications(false);
    },
  });

  // Simulate receiving notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'ecg_urgent',
        title: 'Nouvel ECG urgent',
        message: 'Un ECG prioritaire vient d\'arriver de l\'Hôpital Saint-Louis',
        ecgId: 'ecg-new',
      });
    }, 10000);
    return () => clearTimeout(timer);
  }, [addNotification]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
      validated: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    };
    const labels: Record<string, string> = {
      pending: 'En attente',
      in_progress: 'En cours',
      validated: 'Validé',
      sent: 'Envoyé'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityIndicator = (priority: string) => {
    if (priority === 'normal') return null;
    const styles: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
      critical: 'bg-red-600 text-white animate-pulse'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles[priority] || ''}`}>
        <Zap className="h-3 w-3 mr-0.5" />
        {priority}
      </span>
    );
  };

  const totalPending = hospitals.reduce((sum, h) => sum + h.pendingCount, 0);

  // Handler pour ouvrir le visualiseur
  const handleOpenViewer = (ecgId: string) => {
    setSelectedECGId(ecgId);
  };

  // Handler pour fermer le visualiseur
  const handleCloseViewer = () => {
    setSelectedECGId(null);
  };

  // Handler pour ouvrir les notes
  const handleOpenNotes = (ecgId: string, ref: string) => {
    setSelectedNoteECG({ id: ecgId, ref });
    setShowNotesModal(true);
  };

  // Handler pour valider un ECG
  const handleValidateECG = (record: ViewerECGRecord, measurements: ECGMeasurements, interpretation: string) => {
    console.log('ECG validé:', { record, measurements, interpretation });
  };

  // Handler pour naviguer entre les ECG
  const handleNavigateECG = (record: ViewerECGRecord) => {
    setSelectedECGId(record.id);
  };

  // Handler pour rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  // Convertir record vers format Viewer
  const toViewerRecord = (record: typeof records[0]): ViewerECGRecord => ({
    id: record.id,
    referenceNumber: record.referenceNumber,
    patientName: `${record.patient.firstName} ${record.patient.lastName}`,
    patientAge: new Date().getFullYear() - new Date(record.patient.birthDate).getFullYear(),
    patientGender: record.patient.gender,
    patientBirthDate: record.patient.birthDate,
    medicalCenter: record.medicalCenter,
    referringDoctor: record.referringDoctor,
    acquisitionDate: record.acquisitionDate,
    clinicalContext: record.clinicalContext,
    symptoms: record.symptoms,
    medications: record.medications,
    status: record.status,
    priority: record.priority,
  });

  // Si un ECG est sélectionné, afficher le visualiseur
  const selectedRecord = records.find(r => r.id === selectedECGId);
  if (selectedRecord) {
    const viewerRecords = records.map(toViewerRecord);
    const currentViewerRecord = toViewerRecord(selectedRecord);
    
    return (
      <ECGViewerPage
        record={currentViewerRecord}
        records={viewerRecords}
        onClose={handleCloseViewer}
        onValidate={handleValidateECG}
        onNavigate={handleNavigateECG}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 h-14">
        <div className="w-full px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
                <Heart className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                Xpress-ECG
              </h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30">
                Tableau de bord
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                onClick={() => onNavigate('reports')}
              >
                Rapports
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                onClick={() => onNavigate('statistics')}
              >
                Statistiques
              </Button>
            </nav>

            {/* Recherche */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher... (Ctrl+K)"
                className="pl-9 h-9 w-[280px] bg-gray-50/80 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 cursor-pointer"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                onClick={() => setShowSearchPalette(true)}
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection status */}
            <ConnectionStatus />

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <NotificationsPanel 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />
            </div>

            {/* Menu utilisateur */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="text-sm font-medium dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { setShowUserMenu(false); onNavigate('profile'); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profil
                  </button>
                  <button 
                    onClick={() => { setShowUserMenu(false); onNavigate('settings'); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </button>
                  <button 
                    onClick={() => { setShowUserMenu(false); lockSession(); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Verrouiller
                  </button>
                  <div className="border-t dark:border-gray-700 my-1"></div>
                  <button 
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
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
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select 
              className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.hospitalId || ''}
              onChange={(e) => setFilters({ hospitalId: e.target.value || null })}
            >
              <option value="">Tous les établissements</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-9"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => setShowStatsDrawer(true)}
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Statistiques
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-64 border-r dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto">
          <div className="p-4 space-y-2">
            <button
              onClick={() => setFilters({ onlyUrgent: false, onlySecondOpinion: false, hospitalId: null })}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                !filters.onlyUrgent && !filters.onlySecondOpinion && !filters.hospitalId
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <InboxIcon className="h-4 w-4" />
              <span>Nouveaux ECG</span>
              <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                {totalPending}
              </span>
            </button>

            <button
              onClick={() => setFilters({ onlyUrgent: true, onlySecondOpinion: false })}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                filters.onlyUrgent 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>ECG urgents</span>
              <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-semibold">
                {records.filter(r => r.priority !== 'normal').length}
              </span>
            </button>

            <button
              onClick={() => setFilters({ onlySecondOpinion: true, onlyUrgent: false })}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                filters.onlySecondOpinion
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Second Avis</span>
              <span className="ml-auto text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                {records.filter(r => r.secondOpinionRequested).length}
              </span>
            </button>
          </div>
          
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Building2 className="h-3.5 w-3.5" />
              <span>Établissements</span>
            </div>
            <div className="space-y-1">
              {hospitals.map(hospital => (
                <button
                  key={hospital.id}
                  onClick={() => setFilters({ hospitalId: hospital.id, onlyUrgent: false, onlySecondOpinion: false })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    filters.hospitalId === hospital.id 
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="truncate">{hospital.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
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
          <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700 shadow-sm">
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats.received}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reçus</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.analyzed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Analysés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Envoyés</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select 
                value={statsTimeframe}
                onChange={(e) => setStatsTimeframe(e.target.value as 'today' | 'week' | 'month')}
                className="text-sm border dark:border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>

          {/* Tableau des ECG */}
          <Card className="border dark:border-gray-700 shadow-sm">
            <CardHeader className="py-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  📥 {filters.onlyUrgent ? 'ECG urgents' : filters.onlySecondOpinion ? 'Demandes de second avis' : 'Nouveaux ECG en attente'}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {totalFiltered} résultat{totalFiltered > 1 ? 's' : ''}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b dark:border-gray-700">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Établissement</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Date / Heure</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Statut</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRecords.map((record) => (
                    <tr 
                      key={record.id} 
                      className={`border-b dark:border-gray-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors ${
                        record.priority === 'critical' ? 'bg-red-50/50 dark:bg-red-900/20' : 
                        record.priority === 'urgent' ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''
                      }`}
                      onClick={() => handleOpenViewer(record.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
                            {record.referenceNumber}
                          </span>
                          {getPriorityIndicator(record.priority)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                            record.patient.gender === 'M' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300'
                          }`}>
                            {record.patient.gender}
                          </span>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                              {record.patient.firstName} {record.patient.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date().getFullYear() - new Date(record.patient.birthDate).getFullYear()} ans
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{record.medicalCenter}</p>
                          <p className="text-xs text-gray-400">{record.referringDoctor}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(record.acquisitionDate)}</p>
                          <p className="text-xs text-gray-400">{formatTime(record.acquisitionDate)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                            title="Ouvrir l'ECG"
                            onClick={() => handleOpenViewer(record.id)}
                          >
                            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
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
                            className="h-8 w-8 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                            title="Notes"
                            onClick={() => handleOpenNotes(record.id, record.referenceNumber)}
                          >
                            <StickyNote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <select 
                    className="h-8 px-2 text-sm border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  >
                    <option value={5}>5 par page</option>
                    <option value={10}>10 par page</option>
                    <option value={20}>20 par page</option>
                    <option value={50}>50 par page</option>
                  </select>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalFiltered)} sur {totalFiltered}
                  </span>
                </div>

                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages(), 5) }, (_, i) => i + 1).map((page) => (
                    <Button 
                      key={page}
                      variant={currentPage === page ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 w-8 px-0 ${currentPage === page ? 'bg-indigo-600' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    disabled={currentPage >= totalPages()}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals & Drawers */}
      <StatisticsDrawer 
        isOpen={showStatsDrawer} 
        onClose={() => setShowStatsDrawer(false)} 
      />

      <SearchPalette 
        isOpen={showSearchPalette} 
        onClose={() => setShowSearchPalette(false)}
        onSelectECG={handleOpenViewer}
      />

      {selectedNoteECG && (
        <NotesModal
          isOpen={showNotesModal}
          onClose={() => { setShowNotesModal(false); setSelectedNoteECG(null); }}
          ecgId={selectedNoteECG.id}
          ecgReference={selectedNoteECG.ref}
        />
      )}
    </div>
  );
}
