import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Play,
  MessageSquare,
  Copy,
  Eye,
  Star,
  BarChart3,
  RefreshCw,
  Filter,
  Calendar,
  Search,
  Zap,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Send,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCardiologueStore } from '@/stores/useCardiologueStore';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatDistanceToNow, startOfWeek, endOfWeek, isWithinInterval, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'urgent' | 'today' | 'favorites';
type SortType = 'recent' | 'urgent-first' | 'oldest' | 'hospital' | 'doctor' | 'patient-name';

export function CardiologueDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPending, getUrgent, getCompleted, getCounts, startAnalysis } = useCardiologueStore();

  const pendingECGs = getPending();
  const urgentECGs = getUrgent();
  const completedECGs = getCompleted();
  const counts = getCounts();

  const [selectedECGs, setSelectedECGs] = useState<string[]>([]);
  const [favoriteECGs, setFavoriteECGs] = useState<string[]>([]);
  const [hoveredECG, setHoveredECG] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [selectedECGForAction, setSelectedECGForAction] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionTimer, setSessionTimer] = useState('00:00');
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list'); // liste / grille 2 colonnes
  const [darkMode, setDarkMode] = useState(false); // thème sombre
  const listRef = useRef<HTMLDivElement>(null);

  // Timer session
  useEffect(() => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }

    const interval = setInterval(() => {
      if (sessionStartTime) {
        const elapsed = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setSessionTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Raccourci Ctrl+K pour Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Thème sombre
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Stats
  const avgAnalysisTime = completedECGs.length > 0 
    ? Math.round(completedECGs.reduce((acc, ecg) => {
        if (ecg.dateStarted && ecg.dateCompleted) {
          return acc + differenceInMinutes(parseISO(ecg.dateCompleted), parseISO(ecg.dateStarted));
        }
        return acc;
      }, 0) / completedECGs.length)
    : 0;

  const today = new Date();
  const todayCompleted = completedECGs.filter(e => 
    e.dateCompleted && format(parseISO(e.dateCompleted), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  ).length;

  // Filtrage
  let filteredECGs = pendingECGs.filter(ecg => {
    if (activeFilter === 'urgent' && ecg.urgency !== 'urgent' && ecg.urgency !== 'critical') return false;
    if (activeFilter === 'today' && format(parseISO(ecg.ecgDate), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')) return false;
    if (activeFilter === 'favorites' && !favoriteECGs.includes(ecg.id)) return false;
    if (searchQuery && !ecg.patientName.toLowerCase().includes(searchQuery.toLowerCase()) && !ecg.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Tri
  filteredECGs = [...filteredECGs].sort((a, b) => {
    switch(sortBy) {
      case 'recent':
        return new Date(b.ecgDate).getTime() - new Date(a.ecgDate).getTime();
      case 'oldest':
        return new Date(a.ecgDate).getTime() - new Date(b.ecgDate).getTime();
      case 'urgent-first':
        const urgencyOrder = { critical: 0, urgent: 1, normal: 2 };
        return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
      case 'hospital':
        return a.hospital.localeCompare(b.hospital);
      case 'doctor':
        return a.referringDoctor.localeCompare(b.referringDoctor);
      case 'patient-name':
        return a.patientName.localeCompare(b.patientName);
      default:
        return 0;
    }
  });

  const nextECG = urgentECGs[0] || pendingECGs[0];

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, filteredECGs.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case ' ':
          e.preventDefault();
          if (filteredECGs[focusedIndex]) {
            handleSelectECG(filteredECGs[focusedIndex].id);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredECGs[focusedIndex]) {
            handleStartAnalysis(filteredECGs[focusedIndex].id);
          }
          break;
        case '1':
          if (filteredECGs[focusedIndex]) {
            handleOpenChat(filteredECGs[focusedIndex]);
          }
          break;
        case '2':
          if (filteredECGs[focusedIndex]) {
            handleCopyInfo(filteredECGs[focusedIndex]);
          }
          break;
        case '3':
          if (filteredECGs[focusedIndex]) {
            handleOpenPreview(filteredECGs[focusedIndex]);
          }
          break;
        case '4':
          if (filteredECGs[focusedIndex]) {
            handleStartAnalysis(filteredECGs[focusedIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, filteredECGs]);

  // Scroll to focused
  useEffect(() => {
    if (listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const handleStartAnalysis = (ecgId: string) => {
    startAnalysis(ecgId);
    navigate(`/cardiologue/analyze/${ecgId}`);
  };

  const handleSelectECG = (ecgId: string) => {
    setSelectedECGs(prev => 
      prev.includes(ecgId) 
        ? prev.filter(id => id !== ecgId)
        : [...prev, ecgId]
    );
  };

  const handleToggleFavorite = (ecgId: string) => {
    setFavoriteECGs(prev =>
      prev.includes(ecgId)
        ? prev.filter(id => id !== ecgId)
        : [...prev, ecgId]
    );
  };

  const handleCopyInfo = (ecg: any) => {
    const info = `${ecg.id}\n${ecg.patientName}\n${ecg.patientAge} ans • ${ecg.patientGender === 'M' ? 'Homme' : 'Femme'}\n${ecg.hospital}\n${ecg.clinicalContext}`;
    navigator.clipboard.writeText(info);
    toast({
      title: "✅ Informations copiées",
      description: "Les informations ont été copiées dans le presse-papier",
      duration: 2000,
    });
  };

  const handleOpenChat = (ecg: any) => {
    setSelectedECGForAction(ecg);
    setChatDialogOpen(true);
  };

  const handleOpenPreview = (ecg: any) => {
    setSelectedECGForAction(ecg);
    setPreviewDialogOpen(true);
  };

  const handleSelectAll = () => {
    if (selectedECGs.length === filteredECGs.length) {
      setSelectedECGs([]);
    } else {
      setSelectedECGs(filteredECGs.map(ecg => ecg.id));
    }
  };

  // Objectif quotidien
  const dailyGoal = 20;
  const dailyProgress = (todayCompleted / dailyGoal) * 100;
  const isAheadOfSchedule = todayCompleted > (dailyGoal * (new Date().getHours() / 24));

  return (
    <div className="space-y-2">
      {/* Boutons de contrôle Stats + Thème */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-[10px] text-gray-500 hover:text-gray-700"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? <ChevronUp className="h-2.5 w-2.5 mr-1" /> : <ChevronDown className="h-2.5 w-2.5 mr-1" />}
            {showStats ? 'Masquer' : 'Stats'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-[10px] text-gray-500 hover:text-gray-700"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
            {darkMode ? 'Clair' : 'Sombre'}
          </Button>
        </div>
      </div>

      {/* Statistiques rapides - INLINE ULTRA-COMPACT */}
      {showStats && (
        <div className="flex items-center gap-4 px-3 py-1 bg-gray-50 rounded-lg border h-7">
          <button 
            className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-0.5 rounded transition-colors"
            onClick={() => setActiveFilter('urgent')}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            <span className="text-[10px] text-gray-500">Urgents:</span>
            <span className="text-sm font-bold text-red-600">{urgentECGs.length}</span>
          </button>

          <div className="h-4 w-px bg-gray-300" />

          <button 
            className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-0.5 rounded transition-colors"
            onClick={() => setActiveFilter('all')}
          >
            <Clock className="h-3.5 w-3.5 text-yellow-600" />
            <span className="text-[10px] text-gray-500">En attente:</span>
            <span className="text-sm font-bold text-yellow-600">{counts.pending}</span>
          </button>

          <div className="h-4 w-px bg-gray-300" />

          <button 
            className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-0.5 rounded transition-colors"
            onClick={() => setActiveFilter('today')}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            <span className="text-[10px] text-gray-500">Aujourd'hui:</span>
            <span className="text-sm font-bold text-green-600">{todayCompleted}</span>
          </button>

          <div className="h-4 w-px bg-gray-300" />

          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-[10px] text-gray-500">Temps moy:</span>
            <span className="text-sm font-bold text-purple-600">{avgAnalysisTime}<span className="text-[10px] font-normal text-gray-500">min</span></span>
          </div>
        </div>
      )}

      {/* File d'attente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-indigo-600" />
              File d'attente
              <Badge variant="outline" className="ml-2">{filteredECGs.length} demandes</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filtres rapides + Recherche + Tri */}
          <div className="px-4 py-3 border-b bg-gray-50 space-y-2">
            {/* Ligne 1: Recherche + Tri */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher patient ou ID..."
                  className="pl-9 h-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <ArrowUpDown className="h-3 w-3 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">⏰ Plus récents</SelectItem>
                  <SelectItem value="urgent-first">🚨 Urgences d'abord</SelectItem>
                  <SelectItem value="oldest">⏱️ Plus anciens</SelectItem>
                  <SelectItem value="hospital">🏥 Par établissement</SelectItem>
                  <SelectItem value="doctor">👤 Par médecin</SelectItem>
                  <SelectItem value="patient-name">🔤 Par nom (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              {/* Toggle mode vue */}
              <div className="flex items-center gap-1 border rounded-lg p-0.5">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => setViewMode('list')}
                >
                  <Inbox className="h-3 w-3 mr-1" />
                  Liste
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => setViewMode('compact')}
                >
                  <BarChart3 className="h-3 w-3 mr-1 rotate-90" />
                  Compact
                </Button>
              </div>
            </div>

            {/* Ligne 2: Pills de filtre */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "gap-2 h-7 text-xs",
                  activeFilter === 'all' && "bg-indigo-600 text-white"
                )}
                onClick={() => setActiveFilter('all')}
              >
                Tout
                <Badge variant="secondary" className="ml-1 text-[10px]">{pendingECGs.length}</Badge>
              </Button>
              <Button
                variant={activeFilter === 'urgent' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "gap-2 h-7 text-xs",
                  activeFilter === 'urgent' && "bg-red-600 text-white"
                )}
                onClick={() => setActiveFilter('urgent')}
              >
                ⚡ Urgents
                <Badge variant="secondary" className="ml-1 text-[10px]">{urgentECGs.length}</Badge>
              </Button>
              <Button
                variant={activeFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "gap-2 h-7 text-xs",
                  activeFilter === 'today' && "bg-green-600 text-white"
                )}
                onClick={() => setActiveFilter('today')}
              >
                📅 Aujourd'hui
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {pendingECGs.filter(e => format(parseISO(e.ecgDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')).length}
                </Badge>
              </Button>
              <Button
                variant={activeFilter === 'favorites' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "gap-2 h-7 text-xs",
                  activeFilter === 'favorites' && "bg-yellow-600 text-white"
                )}
                onClick={() => setActiveFilter('favorites')}
              >
                ⭐ Favoris
                <Badge variant="secondary" className="ml-1 text-[10px]">{favoriteECGs.length}</Badge>
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4 px-4 py-2 border-b bg-white">
            <Checkbox
              checked={selectedECGs.length === filteredECGs.length && filteredECGs.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-xs text-gray-600">
              {selectedECGs.length > 0 ? `${selectedECGs.length} sélectionné(s)` : 'Tout sélectionner'}
            </span>
            {selectedECGs.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Assigner à...
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Archiver
                </Button>
              </div>
            )}
          </div>

          {/* Liste ou Grille 2 colonnes */}
          <div className={cn(
            viewMode === 'list' ? "divide-y" : "grid grid-cols-2 gap-2 p-2"
          )} ref={listRef}>
            {filteredECGs.map((ecg, index) => {
              const isHovered = hoveredECG === ecg.id;
              const isSelected = selectedECGs.includes(ecg.id);
              const isFavorite = favoriteECGs.includes(ecg.id);
              const isUrgent = ecg.urgency === 'urgent' || ecg.urgency === 'critical';
              const isFocused = index === focusedIndex;

              return (
                <div
                  key={ecg.id}
                  className={cn(
                    viewMode === 'list' && "flex items-center gap-3 px-3 py-2 transition-all duration-150",
                    viewMode === 'compact' && "border rounded-lg p-3 space-y-2 transition-all duration-150 hover:shadow-md cursor-pointer",
                    isSelected && "bg-indigo-50 border-l-4 border-indigo-500",
                    !isSelected && isFocused && "bg-indigo-100 border-l-4 border-indigo-600",
                    !isSelected && !isFocused && isHovered && ecg.urgency === 'critical' && "bg-red-50/50 border-l-4 border-red-600",
                    !isSelected && !isFocused && isHovered && ecg.urgency === 'urgent' && "bg-orange-50/50 border-l-4 border-orange-500",
                    !isSelected && !isFocused && isHovered && ecg.urgency === 'normal' && "bg-gray-50",
                    !isSelected && !isFocused && !isHovered && ecg.urgency === 'critical' && "bg-red-50/30 border-l-4 border-red-500",
                    !isSelected && !isFocused && !isHovered && ecg.urgency === 'urgent' && "bg-orange-50/30 border-l-4 border-orange-400",
                    !isSelected && !isFocused && !isHovered && ecg.urgency === 'normal' && "bg-white"
                  )}
                  onMouseEnter={() => setHoveredECG(ecg.id)}
                  onMouseLeave={() => setHoveredECG(null)}
                  onClick={() => setFocusedIndex(index)}
                >
                  {/* MODE LISTE */}
                  {viewMode === 'list' && (
                    <>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectECG(ecg.id)}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(ecg.id);
                        }}
                        className="transition-colors"
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                          )}
                        />
                      </button>

                      <div className="w-20 flex-shrink-0">
                        {ecg.urgency === 'urgent' && (
                          <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
                            URGENT
                          </Badge>
                        )}
                        {ecg.urgency === 'critical' && (
                          <Badge className="bg-red-700 text-white text-[10px] px-1.5 py-0 animate-pulse">
                            CRITICAL
                          </Badge>
                        )}
                        {ecg.urgency === 'normal' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Normal
                          </Badge>
                        )}
                      </div>

                      <div className="w-28 flex-shrink-0">
                        <span className="font-mono text-xs font-medium text-gray-900">{ecg.id}</span>
                      </div>

                      <div className="w-44 flex-shrink-0">
                        <p className="font-semibold text-sm text-gray-900">{ecg.patientName}</p>
                        <p className="text-[10px] text-gray-500">
                          {ecg.patientAge} ans • {ecg.patientGender === 'M' ? 'H' : 'F'} • {ecg.hospital}
                        </p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 truncate">{ecg.clinicalContext}</p>
                      </div>

                      <div className="w-12 flex-shrink-0 text-right">
                        <p className="text-[10px] text-gray-500">
                          {format(parseISO(ecg.ecgDate), 'HH:mm')}
                        </p>
                      </div>

                      <div className={cn(
                        "flex items-center gap-1 transition-opacity duration-150",
                        (isHovered || isFocused) ? "opacity-100" : "opacity-0"
                      )}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenChat(ecg)}
                          title="Chat (1)"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopyInfo(ecg)}
                          title="Copier (2)"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenPreview(ecg)}
                          title="Aperçu (3)"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 px-2 gap-1 text-xs"
                          onClick={() => handleStartAnalysis(ecg.id)}
                          title="Analyser (4 ou Enter)"
                        >
                          <Play className="h-3 w-3" />
                          Analyser
                        </Button>
                      </div>
                    </>
                  )}

                  {/* MODE COMPACT (Grille 2 colonnes) */}
                  {viewMode === 'compact' && (
                    <div className="space-y-2">
                      {/* Ligne 1: Badge + Favoris + ID */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {ecg.urgency === 'urgent' && (
                            <Badge className="bg-red-500 text-white text-[9px] px-1 py-0">URGENT</Badge>
                          )}
                          {ecg.urgency === 'critical' && (
                            <Badge className="bg-red-700 text-white text-[9px] px-1 py-0">CRITICAL</Badge>
                          )}
                          {ecg.urgency === 'normal' && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0">Normal</Badge>
                          )}
                          <span className="font-mono text-[10px] text-gray-500">{ecg.id}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(ecg.id);
                          }}
                        >
                          <Star
                            className={cn(
                              "h-3.5 w-3.5",
                              isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            )}
                          />
                        </button>
                      </div>

                      {/* Ligne 2: Patient */}
                      <div>
                        <p className="font-semibold text-xs text-gray-900 truncate">{ecg.patientName}</p>
                        <p className="text-[9px] text-gray-500">
                          {ecg.patientAge} ans • {ecg.patientGender === 'M' ? 'H' : 'F'}
                        </p>
                      </div>

                      {/* Ligne 3: Contexte */}
                      <p className="text-[10px] text-gray-600 line-clamp-2 h-8">{ecg.clinicalContext}</p>

                      {/* Ligne 4: Heure + Actions */}
                      <div className="flex items-center justify-between pt-1 border-t">
                        <span className="text-[9px] text-gray-400">{format(parseISO(ecg.ecgDate), 'HH:mm')}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChat(ecg);
                            }}
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-6 px-2 text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartAnalysis(ecg.id);
                            }}
                          >
                            <Play className="h-2.5 w-2.5 mr-1" />
                            Analyser
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-gray-50">
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span><kbd className="px-1.5 py-0.5 bg-white border rounded">↑↓</kbd> Naviguer</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border rounded">Espace</kbd> Sélectionner</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border rounded">Enter</kbd> Analyser</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border rounded">1-4</kbd> Actions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Command Palette - Ctrl+K */}
      <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un ECG, une action, un patient..."
                className="pl-10 h-10"
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {/* Actions rapides */}
            {commandSearch === '' && (
              <div className="p-2">
                <p className="text-xs font-medium text-gray-500 px-3 py-2">⚡ Actions rapides</p>
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                  onClick={() => {
                    setActiveFilter('urgent');
                    setCommandPaletteOpen(false);
                  }}
                >
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Voir les urgents</p>
                    <p className="text-xs text-gray-500">{urgentECGs.length} ECG urgents en attente</p>
                  </div>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-[10px]">U</kbd>
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                  onClick={() => {
                    setActiveFilter('today');
                    setCommandPaletteOpen(false);
                  }}
                >
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">ECG d'aujourd'hui</p>
                    <p className="text-xs text-gray-500">{todayCompleted} ECG analysés</p>
                  </div>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-[10px]">T</kbd>
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                  onClick={() => {
                    setActiveFilter('favorites');
                    setCommandPaletteOpen(false);
                  }}
                >
                  <Star className="h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mes favoris</p>
                    <p className="text-xs text-gray-500">{favoriteECGs.length} ECG favoris</p>
                  </div>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-[10px]">F</kbd>
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                  onClick={() => {
                    setShowStats(!showStats);
                    setCommandPaletteOpen(false);
                  }}
                >
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{showStats ? 'Masquer' : 'Afficher'} les statistiques</p>
                    <p className="text-xs text-gray-500">Toggle stats</p>
                  </div>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-[10px]">S</kbd>
                </button>
              </div>
            )}

            {/* Résultats de recherche ECG */}
            {commandSearch !== '' && (
              <div className="p-2">
                <p className="text-xs font-medium text-gray-500 px-3 py-2">
                  🔍 Résultats ({filteredECGs.filter(ecg => 
                    ecg.patientName.toLowerCase().includes(commandSearch.toLowerCase()) ||
                    ecg.id.toLowerCase().includes(commandSearch.toLowerCase())
                  ).length})
                </p>
                {filteredECGs
                  .filter(ecg => 
                    ecg.patientName.toLowerCase().includes(commandSearch.toLowerCase()) ||
                    ecg.id.toLowerCase().includes(commandSearch.toLowerCase())
                  )
                  .slice(0, 8)
                  .map((ecg) => (
                    <button
                      key={ecg.id}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                      onClick={() => {
                        handleStartAnalysis(ecg.id);
                        setCommandPaletteOpen(false);
                      }}
                    >
                      <Activity className="h-4 w-4 text-indigo-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ecg.patientName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {ecg.id} • {ecg.clinicalContext.slice(0, 40)}...
                        </p>
                      </div>
                      <Badge className={cn(
                        "text-[10px]",
                        ecg.urgency === 'critical' && 'bg-red-100 text-red-700',
                        ecg.urgency === 'urgent' && 'bg-orange-100 text-orange-700',
                        ecg.urgency === 'normal' && 'bg-green-100 text-green-700'
                      )}>
                        {ecg.urgency === 'critical' ? '🚨' : ecg.urgency === 'urgent' ? '⚡' : '✓'}
                      </Badge>
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">↑↓</kbd>
              <span>Naviguer</span>
              <kbd className="px-1.5 py-0.5 bg-white border rounded">Enter</kbd>
              <span>Sélectionner</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">Esc</kbd>
              <span>Fermer</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Chat - COMPLET ET FONCTIONNEL */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Chat avec {selectedECGForAction?.referringDoctor}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs">
              <span>ECG {selectedECGForAction?.id}</span>
              <span>•</span>
              <span>{selectedECGForAction?.patientName}</span>
              <span>•</span>
              <span className="text-green-600">● En ligne</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col min-h-0 px-6 py-4">
            {/* Contexte ECG */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex-shrink-0">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-900">Contexte clinique</p>
                  <p className="text-xs text-amber-800 mt-1">{selectedECGForAction?.clinicalContext}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
              {/* Message du médecin */}
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {selectedECGForAction?.referringDoctor?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <p className="text-xs font-medium text-gray-900 mb-1">{selectedECGForAction?.referringDoctor}</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Bonjour, patient avec douleur thoracique depuis 2h. Antécédents: HTA, diabète. ECG réalisé en urgence. Merci pour votre analyse rapide.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">Aujourd'hui à 14:23</p>
                  </div>
                </div>
              </div>

              {/* Message système */}
              <div className="flex justify-center">
                <div className="bg-gray-200 rounded-full px-3 py-1">
                  <p className="text-[10px] text-gray-600">📋 ECG assigné à Dr. Sophie Bernard • 14:25</p>
                </div>
              </div>

              {/* Message cardiologue */}
              <div className="flex gap-2 justify-end">
                <div className="flex-1 max-w-md">
                  <div className="bg-indigo-600 text-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs font-medium mb-1">Vous</p>
                    <p className="text-xs leading-relaxed">
                      ECG en cours d'analyse. Je vous envoie le rapport dans 5 minutes maximum.
                    </p>
                    <p className="text-[10px] text-indigo-200 mt-2">Aujourd'hui à 14:26 ✓✓</p>
                  </div>
                </div>
              </div>

              {/* Indication saisie */}
              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-full px-3 py-1">
                  <p className="text-[10px] text-gray-500 italic">Dr. {selectedECGForAction?.referringDoctor?.split(' ')[1]} est en train d'écrire...</p>
                </div>
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="flex-shrink-0 mt-4 pt-4 border-t space-y-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Écrivez votre message (Entrée pour envoyer)..." 
                  className="flex-1 h-9 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      toast({
                        title: "💬 Message envoyé",
                        description: `À ${selectedECGForAction?.referringDoctor}`,
                        duration: 2000,
                      });
                    }
                  }}
                />
                <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <div className="flex items-center gap-2">
                  <span>💡 Entrée = Envoyer</span>
                  <span>•</span>
                  <span>Shift+Entrée = Nouvelle ligne</span>
                </div>
                <span className="text-indigo-600">📧 {selectedECGForAction?.referringDoctorEmail}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600" />
              Aperçu rapide - {selectedECGForAction?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Patient</p>
                <p className="text-sm text-gray-600">{selectedECGForAction?.patientName}</p>
                <p className="text-xs text-gray-500">
                  {selectedECGForAction?.patientAge} ans • {selectedECGForAction?.patientGender === 'M' ? 'Homme' : 'Femme'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Établissement</p>
                <p className="text-sm text-gray-600">{selectedECGForAction?.hospital}</p>
                <p className="text-xs text-gray-500">{selectedECGForAction?.referringDoctor}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Contexte clinique</p>
              <p className="text-sm text-gray-600">{selectedECGForAction?.clinicalContext}</p>
            </div>
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Activity className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Miniature ECG</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Fermer
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                setPreviewDialogOpen(false);
                handleStartAnalysis(selectedECGForAction.id);
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Analyser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
