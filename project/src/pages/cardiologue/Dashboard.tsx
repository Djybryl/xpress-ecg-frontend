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
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowUpDown
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
  const [selectedECGForAction, setSelectedECGForAction] = useState<any>(null);
  const [showStats, setShowStats] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

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
    <div className="space-y-3">
      {/* Bouton de contrôle Stats */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
          Stats
        </Button>
      </div>

      {/* Statistiques rapides - ULTRA-COMPACTES (hauteur réduite de moitié) */}
      {showStats && (
        <div className="grid grid-cols-4 gap-2">
        <Card className="border-l-4 border-red-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveFilter('urgent')}>
          <CardContent className="p-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-gray-500">Urgents</p>
                <p className="text-lg font-bold text-gray-900">{urgentECGs.length}</p>
              </div>
              <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveFilter('all')}>
          <CardContent className="p-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-gray-500">En attente</p>
                <p className="text-lg font-bold text-gray-900">{counts.pending}</p>
              </div>
              <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveFilter('today')}>
          <CardContent className="p-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-gray-500">Aujourd'hui</p>
                <p className="text-lg font-bold text-gray-900">{todayCompleted}</p>
              </div>
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-gray-500">Temps moyen</p>
                <p className="text-lg font-bold text-gray-900">{avgAnalysisTime}</p>
                <p className="text-[8px] text-gray-400">min/ECG</p>
              </div>
              <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-3 w-3 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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

          {/* Liste */}
          <div className="divide-y" ref={listRef}>
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
                    "flex items-center gap-3 px-3 py-2 transition-all duration-150",
                    isSelected && "bg-indigo-50 border-l-4 border-indigo-500",
                    !isSelected && isFocused && "bg-indigo-100 border-l-4 border-indigo-600",
                    !isSelected && !isFocused && isHovered && "bg-gray-50",
                    !isSelected && !isFocused && !isHovered && "bg-white",
                    isUrgent && !isSelected && !isFocused && "border-l-4 border-red-500"
                  )}
                  onMouseEnter={() => setHoveredECG(ecg.id)}
                  onMouseLeave={() => setHoveredECG(null)}
                  onClick={() => setFocusedIndex(index)}
                >
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

      {/* Dialogs */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Chat avec {selectedECGForAction?.referringDoctor}
            </DialogTitle>
            <DialogDescription>
              Concernant l'ECG de {selectedECGForAction?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-900 mb-1">{selectedECGForAction?.patientName}</p>
              <p className="text-xs text-gray-500">{selectedECGForAction?.id} • {selectedECGForAction?.clinicalContext}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Cette fonctionnalité permettra de communiquer directement avec le médecin référent.</p>
              <p className="text-xs text-gray-400">🔧 En cours de développement</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChatDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
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
