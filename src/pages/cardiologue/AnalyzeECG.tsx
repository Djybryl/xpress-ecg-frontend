import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Building2,
  Calendar,
  Stethoscope,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Move,
  Ruler,
  Grid3X3,
  Heart,
  Activity,
  FileText,
  CheckCircle2,
  Eye,
  Users,
  Printer,
  Send,
  GripHorizontal,
  Sparkles,
  RotateCcw,
  Maximize2,
  Lightbulb,
  Zap,
  Clock,
  Mail,
  GitCompare,
  Save
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useCardiologueStore, 
  type ECGMeasurements,
  type ECGInterpretation 
} from '@/stores/useCardiologueStore';
import { useAuthContext } from '@/providers/AuthProvider';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const quickPhrases = [
  { shortcut: '/rs', text: 'Rythme sinusal régulier' },
  { shortcut: '/fa', text: 'Fibrillation auriculaire' },
  { shortcut: '/n', text: 'ECG normal, pas d\'anomalie significative' },
  { shortcut: '/bav1', text: 'BAV du premier degré' },
  { shortcut: '/bbg', text: 'Bloc de branche gauche complet' },
  { shortcut: '/bbd', text: 'Bloc de branche droit complet' },
  { shortcut: '/hvg', text: 'Hypertrophie ventriculaire gauche' },
];

// Simulation IA - Génère des mesures réalistes
const generateAIMeasurements = () => {
  const isNormal = Math.random() > 0.3; // 70% normal
  return {
    heartRate: isNormal ? 60 + Math.floor(Math.random() * 40) : 45 + Math.floor(Math.random() * 100),
    prInterval: isNormal ? 120 + Math.floor(Math.random() * 80) : 100 + Math.floor(Math.random() * 150),
    qrsDuration: isNormal ? 80 + Math.floor(Math.random() * 40) : 70 + Math.floor(Math.random() * 80),
    qtInterval: isNormal ? 350 + Math.floor(Math.random() * 90) : 320 + Math.floor(Math.random() * 150),
    pAxis: '+' + (30 + Math.floor(Math.random() * 60)),
    qrsAxis: '+' + (0 + Math.floor(Math.random() * 90)),
    tAxis: '+' + (20 + Math.floor(Math.random() * 60)),
    rhythm: isNormal ? 'Sinusal' : ['FA', 'Flutter', 'Jonctionnel'][Math.floor(Math.random() * 3)],
    confidence: 85 + Math.floor(Math.random() * 15),
    isNormal,
    suggestion: isNormal 
      ? 'Rythme sinusal régulier. Intervalles dans les limites de la normale. Pas d\'anomalie significative.'
      : 'Anomalie détectée. Révision manuelle recommandée.',
  };
};

export function AnalyzeECG() {
  const { ecgId } = useParams<{ ecgId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getById, getAvailable, getUrgent, saveMeasurements, saveDraft, completeAnalysis, startAnalysis } = useCardiologueStore();
  const { user } = useAuthContext();

  const [ecg, setEcg] = useState(ecgId ? getById(ecgId) : null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [gridVisible, setGridVisible] = useState(true);
  const [activeTool, setActiveTool] = useState<'move' | 'calipers'>('move');
  const [speed, setSpeed] = useState<25 | 50>(25);
  const [amplitude, setAmplitude] = useState<5 | 10 | 20>(10);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [secondOpinionDialogOpen, setSecondOpinionDialogOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedPreviousECG, setSelectedPreviousECG] = useState<string | null>(null);
  const [compareViewMode, setCompareViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const [selectedAnnotation, setSelectedAnnotation] = useState<{point: string; current: number; previous: number} | null>(null);
  const [panelHeight, setPanelHeight] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(280);
  const [expressMode, setExpressMode] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  const [measurements, setMeasurements] = useState({
    heartRate: ecg?.measurements?.heartRate || undefined as number | undefined,
    prInterval: ecg?.measurements?.prInterval || undefined as number | undefined,
    qrsDuration: ecg?.measurements?.qrsDuration || undefined as number | undefined,
    qtInterval: ecg?.measurements?.qtInterval || undefined as number | undefined,
    qtcInterval: ecg?.measurements?.qtcInterval || undefined as number | undefined,
    pAxis: '' as string,
    qrsAxis: '' as string,
    tAxis: '' as string,
    rhythm: ecg?.measurements?.rhythm || 'Sinusal',
  });

  const [interpretation, setInterpretation] = useState(ecg?.interpretation?.conclusion || '');
  const [charCount, setCharCount] = useState(0);

  // Simulation IA au chargement
  useEffect(() => {
    if (ecg) {
      setTimeout(() => {
        const aiResult = generateAIMeasurements();
        setAiAnalysis(aiResult);
        
        // Pré-remplir les mesures
        setMeasurements({
          heartRate: aiResult.heartRate,
          prInterval: aiResult.prInterval,
          qrsDuration: aiResult.qrsDuration,
          qtInterval: aiResult.qtInterval,
          qtcInterval: undefined,
          pAxis: aiResult.pAxis,
          qrsAxis: aiResult.qrsAxis,
          tAxis: aiResult.tAxis,
          rhythm: aiResult.rhythm,
        });

        setInterpretation(aiResult.suggestion);

        // Proposer Express Mode si ECG normal avec haute confiance
        if (aiResult.isNormal && aiResult.confidence > 90) {
          setExpressMode(true);
        }
      }, 800);
    }
  }, [ecg?.id]);

  // Calcul QTc
  useEffect(() => {
    if (measurements.qtInterval && measurements.heartRate) {
      const rr = 60000 / measurements.heartRate;
      const qtc = Math.round(measurements.qtInterval / Math.sqrt(rr / 1000));
      setMeasurements(prev => ({ ...prev, qtcInterval: qtc }));
    }
  }, [measurements.qtInterval, measurements.heartRate]);

  // Compteur caractères
  useEffect(() => {
    setCharCount(interpretation.length);
  }, [interpretation]);

  // Auto-save brouillon toutes les 15 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (ecgId && interpretation.trim()) {
        setIsAutoSaving(true);
        saveDraft(ecgId, {
          findings: [],
          conclusion: interpretation,
          recommendations: '',
          savedAt: new Date().toISOString(),
        });
        setTimeout(() => {
          setLastSaved(new Date());
          setIsAutoSaving(false);
        }, 400);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [ecgId, interpretation, saveDraft]);

  // Restaurer le brouillon au chargement si disponible
  useEffect(() => {
    if (ecg?.draft?.conclusion && !ecg.interpretation) {
      setInterpretation(ecg.draft.conclusion);
      setLastSaved(new Date(ecg.draft.savedAt));
    }
  }, [ecg?.id]);

  // Navigation — on navigue dans les ECG disponibles + mes en cours
  const availableECGs = getAvailable(user?.email);
  const currentIndex = availableECGs.findIndex(e => e.id === ecgId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < availableECGs.length - 1;
  const totalECGs = availableECGs.length;

  const handlePrevious = () => {
    if (hasPrevious) navigate(`/cardiologue/analyze/${availableECGs[currentIndex - 1].id}`);
  };

  const handleNext = () => {
    if (hasNext) navigate(`/cardiologue/analyze/${availableECGs[currentIndex + 1].id}`);
  };

  // Zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoomLevel(prev => Math.max(50, Math.min(300, prev + delta)));
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartHeight(panelHeight);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaY = dragStartY - e.clientY;
        const newHeight = Math.max(100, Math.min(500, dragStartHeight + deltaY));
        setPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStartY, dragStartHeight]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsPanelOpen(prev => !prev);
      }
      if (e.key === 'q' && !e.ctrlKey && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handlePrevious();
      }
      if (e.key === 'e' && !e.ctrlKey && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleNext();
      }
      if (e.key === 'g' && !e.ctrlKey && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setGridVisible(prev => !prev);
      }
      // Ctrl+Enter = Valider & Suivant
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleComplete(true); // true = aller au suivant
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrevious, hasNext]);

  const handleInterpretationChange = (value: string) => {
    let newValue = value;
    quickPhrases.forEach(phrase => {
      if (newValue.includes(phrase.shortcut)) {
        newValue = newValue.replace(phrase.shortcut, phrase.text);
      }
    });
    setInterpretation(newValue);
  };

  // ECG antérieurs simulés pour comparaison
  const previousECGs = [
    {
      id: 'ECG-2025-0642',
      date: '2025-06-15',
      diagnosis: 'Normal',
      doctor: 'Dr. Martin',
      measurements: { heartRate: 68, prInterval: 155, qrsDuration: 88, qtInterval: 365, qtc: 405, pAxis: 42, qrsAxis: 58, tAxis: 48, sokolow: 28 }
    },
    {
      id: 'ECG-2025-0089',
      date: '2025-01-03',
      diagnosis: 'Fibrillation auriculaire',
      doctor: 'Dr. Rousseau',
      measurements: { heartRate: 110, prInterval: 0, qrsDuration: 92, qtInterval: 320, qtc: 450, pAxis: 0, qrsAxis: 62, tAxis: 50, sokolow: 26 }
    },
    {
      id: 'ECG-2024-1204',
      date: '2024-09-22',
      diagnosis: 'Normal',
      doctor: 'Dr. Bernard',
      measurements: { heartRate: 72, prInterval: 160, qrsDuration: 85, qtInterval: 370, qtc: 410, pAxis: 45, qrsAxis: 55, tAxis: 52, sokolow: 25 }
    },
    {
      id: 'ECG-2024-0318',
      date: '2024-03-10',
      diagnosis: 'Hypertrophie VG',
      doctor: 'Dr. Martin',
      measurements: { heartRate: 65, prInterval: 150, qrsDuration: 90, qtInterval: 380, qtc: 400, pAxis: 40, qrsAxis: -15, tAxis: 45, sokolow: 42 }
    },
  ];

  const selectedPrevious = previousECGs.find(e => e.id === selectedPreviousECG) || previousECGs[0];

  // Calcul des deltas pour comparaison
  const calculateDelta = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return { value: 0, percent: 0, status: 'normal' as const };
    const delta = current - previous;
    const percent = Math.round((delta / previous) * 100);
    let status: 'normal' | 'attention' | 'alert' = 'normal';
    if (Math.abs(percent) > 20) status = 'alert';
    else if (Math.abs(percent) > 10) status = 'attention';
    return { value: delta, percent, status };
  };

  // Analyse IA automatique des différences
  const generateAIComparison = () => {
    const deltas = {
      heartRate: calculateDelta(measurements.heartRate, selectedPrevious.measurements.heartRate),
      prInterval: calculateDelta(measurements.prInterval, selectedPrevious.measurements.prInterval),
      qrsDuration: calculateDelta(measurements.qrsDuration, selectedPrevious.measurements.qrsDuration),
      sokolow: calculateDelta(measurements.sokolow, selectedPrevious.measurements.sokolow),
    };

    const stable = Object.entries(deltas).filter(([_, d]) => d.status === 'normal');
    const minor = Object.entries(deltas).filter(([_, d]) => d.status === 'attention');
    const major = Object.entries(deltas).filter(([_, d]) => d.status === 'alert');

    return { stable, minor, major, deltas };
  };

  const comparisonAnalysis = generateAIComparison();

  const handleComplete = (goToNext = false) => {
    if (expressMode && aiAnalysis?.isNormal) {
      handleConfirmComplete(goToNext);
    } else {
      setConfirmDialogOpen(true);
    }
  };

  const handleConfirmComplete = (goToNext = false) => {
    if (ecgId) {
      const fullMeasurements: ECGMeasurements = {
        heartRate: measurements.heartRate,
        prInterval: measurements.prInterval,
        qrsDuration: measurements.qrsDuration,
        qtInterval: measurements.qtInterval,
        qtcInterval: measurements.qtcInterval,
        axis: `P: ${measurements.pAxis}° | QRS: ${measurements.qrsAxis}° | T: ${measurements.tAxis}°`,
        rhythm: measurements.rhythm,
      };

      const fullInterpretation: ECGInterpretation = {
        findings: [],
        conclusion: interpretation,
        recommendations: '',
        isNormal: aiAnalysis?.isNormal ?? true,
      };

      completeAnalysis(ecgId, fullMeasurements, fullInterpretation);

      toast({
        title: "✅ Analyse validée",
        description: "Le rapport a été généré et envoyé",
        duration: 3000,
      });

      if (goToNext && hasNext) {
        setTimeout(() => {
          navigate(`/cardiologue/analyze/${availableECGs[currentIndex + 1].id}`);
        }, 500);
      } else {
        navigate('/cardiologue');
      }
    }
    setConfirmDialogOpen(false);
  };

  const handleAcceptAISuggestion = () => {
    if (aiAnalysis) {
      setInterpretation(aiAnalysis.suggestion);
      toast({
        title: "✅ Suggestion IA acceptée",
        duration: 2000,
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!ecg) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-pulse" />
          <p className="text-gray-500 text-lg">Chargement de l'ECG...</p>
        </div>
      </div>
    );
  }

  const ecgHeight = isPanelOpen 
    ? `calc(100vh - 56px - 44px - ${panelHeight}px - 32px)` 
    : 'calc(100vh - 56px - 44px - 32px - 40px)';

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="h-14 bg-white border-b flex flex-col z-20 shadow-sm">
        {/* Ligne 1 - Toujours visible */}
        <div className="h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/cardiologue')}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{ecg.id}</span>
                  {ecg.urgency === 'urgent' && (
                    <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 animate-pulse">
                      URGENT
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {ecg.patientName} • {ecg.patientAge} ans • {ecg.patientGender === 'M' ? 'Homme' : 'Femme'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={!hasPrevious}
              onClick={handlePrevious}
              title="ECG précédent (Q)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[80px] h-8 text-xs gap-1">
                  {currentIndex + 1} / {totalECGs}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                {getUrgent().length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-red-600 bg-red-50">
                      ⚡ {getUrgent().length} URGENTS RESTANTS
                    </div>
                    {getUrgent().slice(0, 5).map((urgentECG) => (
                      <DropdownMenuItem 
                        key={urgentECG.id}
                        onClick={() => navigate(`/cardiologue/analyze/${urgentECG.id}`)}
                        className="text-xs"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono">{urgentECG.id}</span>
                          <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">URGENT</Badge>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{urgentECG.patientName}</p>
                      </DropdownMenuItem>
                    ))}
                    {getUrgent().length > 5 && (
                      <div className="px-2 py-1.5 text-[10px] text-gray-500 text-center">
                        + {getUrgent().length - 5} autres urgents
                      </div>
                    )}
                    <div className="h-px bg-gray-200 my-1" />
                  </>
                )}
                <div className="px-2 py-1.5 text-xs font-medium text-gray-700">
                  📋 Tous les ECG ({totalECGs})
                </div>
                {getAvailable(user?.email).slice(0, 8).map((allECG, idx) => (
                  <DropdownMenuItem 
                    key={allECG.id}
                    onClick={() => navigate(`/cardiologue/analyze/${allECG.id}`)}
                    className={cn(
                      "text-xs",
                      allECG.id === ecgId && "bg-indigo-50"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[10px]">{idx + 1}. {allECG.id}</span>
                      {allECG.urgency === 'urgent' && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                {getAvailable(user?.email).length > 8 && (
                  <div className="px-2 py-1.5 text-[10px] text-gray-500 text-center">
                    + {getAvailable(user?.email).length - 8} autres ECG
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={!hasNext}
              onClick={handleNext}
              title="ECG suivant (E)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setCompareDialogOpen(true)}>
              <GitCompare className="h-4 w-4" />
              Comparer
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setSecondOpinionDialogOpen(true)}>
              <Users className="h-4 w-4" />
              Second avis
            </Button>
            <Button 
              onClick={() => handleComplete(false)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="h-4 w-4" />
              Valider & Envoyer
            </Button>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="h-11 bg-white border-b flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-1">Zoom:</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-medium w-14 text-center">{zoomLevel}%</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setZoomLevel(Math.min(300, zoomLevel + 10))}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-1">Outils:</span>
            <Button 
              variant={activeTool === 'move' ? 'default' : 'outline'}
              size="sm" 
              className={cn(
                "gap-1.5 h-7",
                activeTool === 'move' && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              )}
              onClick={() => setActiveTool('move')}
            >
              <Move className="h-3.5 w-3.5" />
              Déplacer
            </Button>
            <Button 
              variant={activeTool === 'calipers' ? 'default' : 'outline'}
              size="sm" 
              className={cn(
                "gap-1.5 h-7",
                activeTool === 'calipers' && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              )}
              onClick={() => setActiveTool('calipers')}
            >
              <Ruler className="h-3.5 w-3.5" />
              Calipers
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          <Button 
            variant={gridVisible ? 'default' : 'outline'}
            size="sm" 
            className={cn(
              "gap-1.5 h-7",
              gridVisible && "bg-indigo-600 text-white hover:bg-indigo-700"
            )}
            onClick={() => setGridVisible(!gridVisible)}
            title="Toggle grille (G)"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            Grille
          </Button>

          <div className="h-6 w-px bg-gray-300" />

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-1">Vitesse:</span>
            <div className="flex rounded-md overflow-hidden border">
              <button 
                className={cn(
                  "px-3 py-1 text-xs transition-colors",
                  speed === 25 ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                )}
                onClick={() => setSpeed(25)}
              >
                25 mm/s
              </button>
              <button 
                className={cn(
                  "px-3 py-1 text-xs transition-colors border-l",
                  speed === 50 ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                )}
                onClick={() => setSpeed(50)}
              >
                50 mm/s
              </button>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-1">Amplitude:</span>
            <div className="flex rounded-md overflow-hidden border">
              {[5, 10, 20].map((amp) => (
                <button 
                  key={amp}
                  className={cn(
                    "px-2.5 py-1 text-xs transition-colors",
                    amp !== 5 && "border-l",
                    amplitude === amp ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => setAmplitude(amp as 5 | 10 | 20)}
                >
                  {amp}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">mm/mV</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-2">
              {isAutoSaving ? (
                <>
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span>Sauvegardé {format(lastSaved, 'HH:mm')}</span>
                </>
              )}
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(100)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* MODE EXPRESS (affiché en overlay si actif) */}
      {expressMode && aiAnalysis && (
        <div className="absolute top-[110px] left-1/2 -translate-x-1/2 z-30 w-[600px]">
          <Card className="border-2 border-green-500 shadow-2xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Mode Express</h3>
                    <p className="text-sm text-gray-600">IA Analyse - Confiance: {aiAnalysis.confidence}%</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setExpressMode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Mode complet
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>ECG NORMAL</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">FC:</span> <span className="font-medium">{measurements.heartRate} bpm</span>
                  </div>
                  <div>
                    <span className="text-gray-500">PR:</span> <span className="font-medium">{measurements.prInterval} ms</span>
                  </div>
                  <div>
                    <span className="text-gray-500">QRS:</span> <span className="font-medium">{measurements.qrsDuration} ms</span>
                  </div>
                  <div>
                    <span className="text-gray-500">QTc:</span> <span className="font-medium">{measurements.qtcInterval} ms</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
                  {interpretation}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                    onClick={() => handleComplete(true)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Valider & Suivant
                    <kbd className="ml-2 px-2 py-0.5 bg-green-700 rounded text-xs">Ctrl+Enter</kbd>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setExpressMode(false)}
                  >
                    Mode complet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ZONE ECG */}
      <div 
        className="overflow-auto relative bg-white"
        style={{ height: ecgHeight }}
      >
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
            {speed} mm/s
          </Badge>
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
            {amplitude} mm/mV
          </Badge>
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
            Zoom: {zoomLevel}%
          </Badge>
          {aiAnalysis && (
            <Badge className="bg-purple-100 text-purple-700 backdrop-blur-sm">
              🤖 IA: {aiAnalysis.confidence}%
            </Badge>
          )}
        </div>

        <div 
          className={cn("w-full h-full min-h-[400px] relative")}
          style={{
            background: gridVisible 
              ? `
                  linear-gradient(to right, #fecaca 1px, transparent 1px),
                  linear-gradient(to bottom, #fecaca 1px, transparent 1px),
                  linear-gradient(to right, #fee2e2 1px, transparent 1px),
                  linear-gradient(to bottom, #fee2e2 1px, transparent 1px),
                  #fff
                `
              : '#fff',
            backgroundSize: gridVisible 
              ? '25mm 25mm, 25mm 25mm, 5mm 5mm, 5mm 5mm'
              : 'auto',
          }}
        >
          <div 
            className="absolute inset-4 flex items-center justify-center"
            style={{ 
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'center center'
            }}
          >
            <div className="text-center text-gray-400">
              <Activity className="h-20 w-20 mx-auto mb-4 text-blue-400" />
              <p className="text-lg font-medium text-gray-600">Tracé ECG 12 dérivations</p>
              <p className="text-sm mt-2">I, II, III, aVR, aVL, aVF, V1-V6</p>
              <p className="text-xs mt-4 text-gray-400">
                Vitesse: {speed} mm/s • Amplitude: {amplitude} mm/mV
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Ctrl + Scroll: zoom • [G]: grille • [Tab]: panel • [C]: comparer
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 flex items-end gap-1">
            <span className="text-xs text-gray-500">1mV</span>
            <div className="w-4 h-10 border-l-2 border-b-2 border-gray-400"></div>
          </div>
        </div>
      </div>

      {/* BARRE DE DRAG */}
      <div 
        className={cn(
          "h-8 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 border-t border-b",
          "flex items-center justify-center cursor-ns-resize",
          "hover:from-indigo-50 hover:via-indigo-100 hover:to-indigo-50 transition-all",
          isDragging && "from-indigo-100 via-indigo-200 to-indigo-100"
        )}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (!isDragging && e.detail === 1) {
            setIsPanelOpen(!isPanelOpen);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className={cn(
            "h-5 w-5 text-gray-400 transition-colors",
            isDragging && "text-indigo-600"
          )} />
          <span className="text-xs text-gray-500 select-none">
            {isPanelOpen 
              ? "Glissez pour redimensionner • Cliquez pour fermer" 
              : "Cliquez pour ouvrir le panel d'analyse • [Tab]"
            }
          </span>
        </div>
      </div>

      {/* PANEL RÉTRACTABLE */}
      <div 
        className={cn(
          "bg-white border-t overflow-hidden transition-all duration-300",
          !isPanelOpen && "h-0"
        )}
        style={{ height: isPanelOpen ? panelHeight : 0 }}
      >
        <div className="h-full p-4 overflow-y-auto">
          <div className="grid grid-cols-[250px_280px_500px] gap-4 h-full">
            
            {/* PATIENT */}
            <Card className="h-fit">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-700 text-sm">Informations Patient</h3>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                    ecg.patientGender === 'M' ? "bg-blue-500" : "bg-pink-500"
                  )}>
                    {getInitials(ecg.patientName)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{ecg.patientName}</p>
                    <p className="text-xs text-gray-500">
                      {ecg.patientAge} ans • {ecg.patientGender === 'M' ? 'Homme' : 'Femme'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">Date:</span>
                    <span>{format(parseISO(ecg.ecgDate), "d MMM yyyy 'à' HH:mm", { locale: fr })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">Centre:</span>
                    <span className="truncate">{ecg.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Stethoscope className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">Prescripteur:</span>
                    <span className="truncate">{ecg.referringDoctor}</span>
                  </div>
                </div>

                {ecg.clinicalContext && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-medium text-gray-700">Symptômes</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                      <p className="text-xs text-amber-800 leading-relaxed">{ecg.clinicalContext}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MESURES - ULTRA COMPACT */}
            <Card className="h-fit">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-indigo-500" />
                    <h3 className="font-semibold text-gray-700 text-xs">Mesures</h3>
                  </div>
                  {aiAnalysis && (
                    <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0">
                      🤖 IA
                    </Badge>
                  )}
                </div>

                {/* FC */}
                <div>
                  <Label className="text-[10px] text-gray-500 mb-1 block">FC</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      value={measurements.heartRate || ''}
                      onChange={(e) => setMeasurements({...measurements, heartRate: parseInt(e.target.value) || undefined})}
                      className="h-8 text-sm text-center font-semibold"
                      placeholder="—"
                    />
                    <span className="text-xs text-gray-400 w-10">bpm</span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5">Normal: 60-100</p>
                </div>

                {/* INTERVALLES 2x2 */}
                <div>
                  <Label className="text-[10px] text-gray-600 mb-1.5 block font-medium">INTERVALLES</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[9px] text-gray-500">PR</Label>
                      <div className="flex items-center gap-0.5">
                        <Input
                          type="number"
                          value={measurements.prInterval || ''}
                          onChange={(e) => setMeasurements({...measurements, prInterval: parseInt(e.target.value) || undefined})}
                          className="h-7 text-xs"
                          placeholder="—"
                        />
                        <span className="text-[10px] text-gray-400 w-6">ms</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[9px] text-gray-500">QRS</Label>
                      <div className="flex items-center gap-0.5">
                        <Input
                          type="number"
                          value={measurements.qrsDuration || ''}
                          onChange={(e) => setMeasurements({...measurements, qrsDuration: parseInt(e.target.value) || undefined})}
                          className="h-7 text-xs"
                          placeholder="—"
                        />
                        <span className="text-[10px] text-gray-400 w-6">ms</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[9px] text-gray-500">QT</Label>
                      <div className="flex items-center gap-0.5">
                        <Input
                          type="number"
                          value={measurements.qtInterval || ''}
                          onChange={(e) => setMeasurements({...measurements, qtInterval: parseInt(e.target.value) || undefined})}
                          className="h-7 text-xs"
                          placeholder="—"
                        />
                        <span className="text-[10px] text-gray-400 w-6">ms</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[9px] text-gray-500">QTc</Label>
                      <div className="flex items-center gap-0.5">
                        <Input
                          type="number"
                          value={measurements.qtcInterval || ''}
                          readOnly
                          className="h-7 text-xs bg-gray-50"
                          placeholder="—"
                        />
                        <span className="text-[10px] text-gray-400 w-6">ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AXES - INLINE (1 seule ligne) */}
                <div>
                  <Label className="text-[10px] text-gray-600 mb-1.5 block font-medium">AXES</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <span className="text-[9px] text-purple-600 font-medium w-8">P:</span>
                      <Input
                        type="text"
                        value={measurements.pAxis}
                        onChange={(e) => setMeasurements({...measurements, pAxis: e.target.value})}
                        className="h-7 w-14 text-xs text-center font-mono px-1"
                        placeholder="—"
                      />
                      <span className="text-[10px] text-gray-400">°</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="text-[9px] text-purple-600 font-medium w-10">QRS:</span>
                      <Input
                        type="text"
                        value={measurements.qrsAxis}
                        onChange={(e) => setMeasurements({...measurements, qrsAxis: e.target.value})}
                        className="h-7 w-14 text-xs text-center font-mono px-1"
                        placeholder="—"
                      />
                      <span className="text-[10px] text-gray-400">°</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="text-[9px] text-purple-600 font-medium w-6">T:</span>
                      <Input
                        type="text"
                        value={measurements.tAxis}
                        onChange={(e) => setMeasurements({...measurements, tAxis: e.target.value})}
                        className="h-7 w-14 text-xs text-center font-mono px-1"
                        placeholder="—"
                      />
                      <span className="text-[10px] text-gray-400">°</span>
                    </div>
                  </div>
                </div>

                {/* SOKOLOW - NOUVEAU */}
                <div className="pt-2 border-t">
                  <Label className="text-[10px] text-gray-600 mb-1.5 block font-medium">INDICE SOKOLOW-LYON</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      value={measurements.sokolow || ''}
                      onChange={(e) => setMeasurements({...measurements, sokolow: parseFloat(e.target.value) || undefined})}
                      className="h-7 text-xs"
                      placeholder="—"
                    />
                    <span className="text-xs text-gray-400 w-10">mm</span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5">HVG si &gt; 35 mm</p>
                </div>

                {/* RYTHME */}
                <div>
                  <Label className="text-[10px] text-gray-600 mb-1 block">Rythme</Label>
                  <Select 
                    value={measurements.rhythm} 
                    onValueChange={(value) => setMeasurements({...measurements, rhythm: value})}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sinusal">Sinusal</SelectItem>
                      <SelectItem value="FA">Fibrillation auriculaire</SelectItem>
                      <SelectItem value="Flutter">Flutter auriculaire</SelectItem>
                      <SelectItem value="Jonctionnel">Jonctionnel</SelectItem>
                      <SelectItem value="Ventriculaire">Ventriculaire</SelectItem>
                      <SelectItem value="Pacemaker">Rythme électro-entraîné</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* INTERPRÉTATION */}
            <Card className="flex flex-col h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <h3 className="font-semibold text-gray-700 text-sm">Interprétation</h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5 h-7 text-xs"
                      onClick={() => setTemplateDialogOpen(true)}
                    >
                      <FileText className="h-3 w-3 text-indigo-500" />
                      Templates
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          Phrases
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-72">
                        {quickPhrases.map((phrase) => (
                          <DropdownMenuItem 
                            key={phrase.shortcut}
                            onClick={() => setInterpretation(prev => prev + (prev ? ' ' : '') + phrase.text)}
                            className="flex justify-between text-xs"
                          >
                            <span>{phrase.text}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{phrase.shortcut}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Textarea
                  value={interpretation}
                  onChange={(e) => handleInterpretationChange(e.target.value)}
                  placeholder="Saisissez votre interprétation ici...

Utilisez les raccourcis:
• /rs → Rythme sinusal régulier
• /fa → Fibrillation auriculaire
• /n → ECG normal
..."
                  className="flex-1 resize-none text-xs leading-relaxed min-h-[100px]"
                />

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-[10px] text-gray-400">{charCount} caractères</span>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleComplete(true)}
                      size="sm"
                      className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
                      title="Ctrl+Enter"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                      Valider & Suivant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* DIALOG CONFIRMATION */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Confirmer la validation
            </DialogTitle>
            <DialogDescription className="pt-2">
              Cette action va :
              <ul className="list-disc list-inside mt-3 space-y-1.5 text-gray-600">
                <li>Valider définitivement votre analyse</li>
                <li>Générer un rapport PDF avec signature électronique</li>
                <li>Envoyer automatiquement le rapport à <strong className="text-gray-900">{ecg.referringDoctorEmail}</strong></li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => handleConfirmComplete(false)} className="bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              Confirmer & Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG COMPARAISON - VERSION AVANCÉE */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-indigo-600" />
              Comparaison avec ECG antérieur
            </DialogTitle>
            <DialogDescription className="text-xs">
              Patient: {ecg.patientName} • {ecg.patientAge} ans • {previousECGs.length} ECG disponibles
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-[calc(95vh-120px)] overflow-y-auto">
            {/* P1: SÉLECTION ECG ANTÉRIEUR */}
            <div className="px-6 py-4 bg-gray-50 border-b space-y-3">
              <Label className="text-sm font-medium text-gray-700">📅 Sélectionner un ECG antérieur</Label>
              <Select value={selectedPreviousECG || previousECGs[0].id} onValueChange={setSelectedPreviousECG}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {previousECGs.map((prevECG) => (
                    <SelectItem key={prevECG.id} value={prevECG.id}>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{format(parseISO(prevECG.date), 'd MMM yyyy', { locale: fr })}</p>
                          <p className="text-xs text-gray-500">{prevECG.diagnosis} • {prevECG.doctor} • {prevECG.id}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* P4: SPLIT-VIEW ECG RÉEL */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-700">🖼️ Vue comparative</Label>
                <div className="flex items-center gap-1 border rounded-lg p-0.5">
                  <Button
                    variant={compareViewMode === 'side-by-side' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setCompareViewMode('side-by-side')}
                  >
                    Côte-à-côte
                  </Button>
                  <Button
                    variant={compareViewMode === 'overlay' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setCompareViewMode('overlay')}
                  >
                    Superposé
                  </Button>
                </div>
              </div>

              {compareViewMode === 'side-by-side' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-900">ACTUEL - {format(parseISO(ecg.ecgDate), 'd MMM yyyy', { locale: fr })}</p>
                      <Badge className="bg-indigo-600 text-white text-[10px]">Nouveau</Badge>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-indigo-200 relative overflow-hidden">
                      <Activity className="h-16 w-16 text-indigo-300" />
                      <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
                        ECG {ecg.id}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-900">ANTÉRIEUR - {format(parseISO(selectedPrevious.date), 'd MMM yyyy', { locale: fr })}</p>
                      <Badge variant="outline" className="text-[10px]">{selectedPrevious.diagnosis}</Badge>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-gray-300 relative overflow-hidden">
                      <Activity className="h-16 w-16 text-gray-300" />
                      <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
                        ECG {selectedPrevious.id}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    <span className="inline-block w-12 h-0.5 bg-red-500 mr-2"></span> Actuel ({format(parseISO(ecg.ecgDate), 'd MMM', { locale: fr })})
                    <span className="inline-block w-12 h-0.5 bg-blue-400 border-blue-400 border-dashed mr-2 ml-4"></span> Antérieur ({format(parseISO(selectedPrevious.date), 'd MMM', { locale: fr })})
                  </p>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-purple-200 relative">
                    <div className="text-center">
                      <Activity className="h-16 w-16 text-purple-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Vue superposée (simulation)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* P2: TABLEAU COMPARATIF AVANCÉ */}
            <div className="px-6 py-4 border-b">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">📊 Tableau comparatif détaillé</Label>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 font-semibold text-gray-700">PARAMÈTRE</th>
                      <th className="text-center p-2 font-semibold text-indigo-700">ACTUEL</th>
                      <th className="text-center p-2 font-semibold text-gray-700">ANTÉRIEUR</th>
                      <th className="text-center p-2 font-semibold text-gray-700">DELTA</th>
                      <th className="text-center p-2 font-semibold text-gray-700">SIGNIFICATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { label: 'Fréquence Cardiaque', unit: 'bpm', current: measurements.heartRate, previous: selectedPrevious.measurements.heartRate, key: 'heartRate' },
                      { label: 'Intervalle PR', unit: 'ms', current: measurements.prInterval, previous: selectedPrevious.measurements.prInterval, key: 'prInterval' },
                      { label: 'Durée QRS', unit: 'ms', current: measurements.qrsDuration, previous: selectedPrevious.measurements.qrsDuration, key: 'qrsDuration' },
                      { label: 'Intervalle QT', unit: 'ms', current: measurements.qtInterval, previous: selectedPrevious.measurements.qtInterval, key: 'qtInterval' },
                      { label: 'QTc', unit: 'ms', current: measurements.qtc, previous: selectedPrevious.measurements.qtc, key: 'qtc' },
                      { label: 'Axe P', unit: '°', current: measurements.pAxis, previous: selectedPrevious.measurements.pAxis, key: 'pAxis' },
                      { label: 'Axe QRS', unit: '°', current: measurements.qrsAxis, previous: selectedPrevious.measurements.qrsAxis, key: 'qrsAxis' },
                      { label: 'Axe T', unit: '°', current: measurements.tAxis, previous: selectedPrevious.measurements.tAxis, key: 'tAxis' },
                      { label: 'Indice Sokolow', unit: 'mm', current: measurements.sokolow, previous: selectedPrevious.measurements.sokolow, key: 'sokolow' },
                    ].map((param) => {
                      const delta = calculateDelta(param.current, param.previous);
                      const statusColor = delta.status === 'alert' ? 'text-red-600' : delta.status === 'attention' ? 'text-amber-600' : 'text-green-600';
                      const statusIcon = delta.status === 'alert' ? '🔴' : delta.status === 'attention' ? '🟡' : '🟢';
                      const statusText = delta.status === 'alert' ? 'Significatif' : delta.status === 'attention' ? 'À surveiller' : 'Stable';

                      return (
                        <tr key={param.label} className="hover:bg-gray-50">
                          <td className="p-2 font-medium text-gray-700">{param.label}</td>
                          <td className="p-2 text-center font-semibold text-indigo-700">{param.current || '-'} {param.unit}</td>
                          <td className="p-2 text-center text-gray-600">{param.previous || '-'} {param.unit}</td>
                          <td className={cn("p-2 text-center font-semibold", statusColor)}>
                            {delta.value > 0 ? '+' : ''}{delta.value} {param.unit} ({delta.percent > 0 ? '+' : ''}{delta.percent}%)
                          </td>
                          <td className="p-2 text-center">
                            <span className="text-xs">{statusIcon} {statusText}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* P5: ANNOTATIONS SYNCHRONISÉES */}
            {selectedAnnotation && (
              <div className="px-6 py-3 bg-blue-50 border-b">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Annotation sélectionnée: {selectedAnnotation.point}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-4">
                    <span className="text-gray-700">Actuel: <strong className="text-indigo-700">{selectedAnnotation.current}</strong></span>
                    <span className="text-gray-700">Antérieur: <strong>{selectedAnnotation.previous}</strong></span>
                    <span className="text-gray-700">Delta: <strong className="text-amber-700">{selectedAnnotation.current - selectedAnnotation.previous > 0 ? '+' : ''}{selectedAnnotation.current - selectedAnnotation.previous}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* P3: ANALYSE IA DES DIFFÉRENCES */}
            <div className="px-6 py-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">🤖 Analyse IA des différences</Label>
              <div className="space-y-3">
                {/* Stables */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-900 mb-2">✅ STABLES ({comparisonAnalysis.stable.length} paramètres)</p>
                  <ul className="text-xs text-green-800 space-y-1">
                    {comparisonAnalysis.stable.slice(0, 3).map(([key]) => (
                      <li key={key}>• {key === 'heartRate' ? 'Fréquence cardiaque' : key === 'prInterval' ? 'Intervalle PR' : key === 'qrsDuration' ? 'Durée QRS' : 'Sokolow'} maintenu dans les normes</li>
                    ))}
                  </ul>
                </div>

                {/* Modifications mineures */}
                {comparisonAnalysis.minor.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ MODIFICATIONS MINEURES ({comparisonAnalysis.minor.length})</p>
                    <ul className="text-xs text-amber-800 space-y-1">
                      {comparisonAnalysis.minor.map(([key, delta]) => (
                        <li key={key}>
                          • {key === 'heartRate' ? 'Fréquence cardiaque' : key === 'prInterval' ? 'Intervalle PR' : key === 'qrsDuration' ? 'Durée QRS' : 'Sokolow'}: 
                          {delta.value > 0 ? ' augmentation' : ' diminution'} de {Math.abs(delta.percent)}% - À surveiller
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modifications majeures */}
                {comparisonAnalysis.major.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-red-900 mb-2">🔴 MODIFICATIONS MAJEURES ({comparisonAnalysis.major.length})</p>
                    <ul className="text-xs text-red-800 space-y-1">
                      {comparisonAnalysis.major.map(([key, delta]) => (
                        <li key={key}>
                          • {key === 'heartRate' ? 'Fréquence cardiaque' : key === 'prInterval' ? 'Intervalle PR' : key === 'qrsDuration' ? 'Durée QRS' : 'Sokolow'}: 
                          {delta.value > 0 ? ' augmentation' : ' diminution'} significative de {Math.abs(delta.percent)}% - Attention requise
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommandations */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-900 mb-2">💡 RECOMMANDATIONS</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    {comparisonAnalysis.major.length > 0 && (
                      <li>• Examen clinique approfondi recommandé</li>
                    )}
                    {comparisonAnalysis.minor.length > 0 && (
                      <li>• Surveillance évolutive conseillée</li>
                    )}
                    <li>• Comparer avec examens complémentaires si disponibles</li>
                    <li>• Prochain ECG de contrôle dans {comparisonAnalysis.major.length > 0 ? '1-3 mois' : '6 mois'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* P6: RAPPORT EXPORTABLE */}
          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    toast({
                      title: "📄 Rapport généré",
                      description: "Le rapport comparatif PDF a été généré avec succès",
                      duration: 3000,
                    });
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Générer rapport PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setSelectedAnnotation({ point: 'Onde R (DII)', current: 12, previous: 10 });
                  }}
                >
                  <Ruler className="h-4 w-4" />
                  Annoter
                </Button>
              </div>
              <Button variant="default" onClick={() => setCompareDialogOpen(false)}>
                Fermer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Templates Contextuels */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Templates d'Interprétation
            </DialogTitle>
            <DialogDescription>
              Choisissez un template pour pré-remplir l'interprétation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* ECG Normal */}
            <button
              onClick={() => {
                setInterpretation("Rythme sinusal régulier. Fréquence cardiaque normale. Axe normal. Pas d'anomalie de la repolarisation. Pas de signe d'hypertrophie ventriculaire. ECG normal.");
                setTemplateDialogOpen(false);
              }}
              className="w-full p-3 text-left border-2 border-green-200 hover:border-green-400 rounded-lg transition-colors bg-green-50/50"
            >
              <p className="font-semibold text-sm text-gray-900">✅ ECG Normal</p>
              <p className="text-xs text-gray-600 mt-1">Rythme sinusal, sans anomalie</p>
            </button>

            {/* Fibrillation Auriculaire */}
            <button
              onClick={() => {
                setInterpretation("Fibrillation auriculaire. Absence d'ondes P. Intervalles RR irréguliers. Réponse ventriculaire [COMPLÉTER: rapide/contrôlée]. [COMPLÉTER: Signes d'instabilité hémodynamique / Patient stable]. [COMPLÉTER: Traitement anticoagulant recommandé].");
                setTemplateDialogOpen(false);
              }}
              className="w-full p-3 text-left border-2 border-red-200 hover:border-red-400 rounded-lg transition-colors bg-red-50/50"
            >
              <p className="font-semibold text-sm text-gray-900">🫀 Fibrillation Auriculaire</p>
              <p className="text-xs text-gray-600 mt-1">Absence d'ondes P, RR irréguliers</p>
            </button>

            {/* Infarctus */}
            <button
              onClick={() => {
                setInterpretation("Sus-décalage du segment ST en [COMPLÉTER: territoire]. Ondes Q pathologiques en [COMPLÉTER: dérivations]. Aspect évocateur d'un syndrome coronarien aigu avec sus-décalage du segment ST (STEMI) en territoire [COMPLÉTER: antérieur/inférieur/latéral]. [COMPLÉTER: Contexte clinique compatible]. URGENCE : Contact immédiat du SAMU/cardiologue de garde recommandé.");
                setTemplateDialogOpen(false);
              }}
              className="w-full p-3 text-left border-2 border-red-500 hover:border-red-700 rounded-lg transition-colors bg-red-100"
            >
              <p className="font-semibold text-sm text-gray-900">🚨 STEMI / Infarctus</p>
              <p className="text-xs text-gray-600 mt-1">Sus-décalage ST, ondes Q pathologiques</p>
            </button>

            {/* Bloc de Branche */}
            <button
              onClick={() => {
                setInterpretation("Bloc de branche [COMPLÉTER: gauche/droite] complet. QRS élargi > 120 ms. [COMPLÉTER: Aspect rSR' en V1-V2 (BBD) / Aspect QS ou rS en V1 (BBG)]. Pas d'autre anomalie associée significative.");
                setTemplateDialogOpen(false);
              }}
              className="w-full p-3 text-left border-2 border-purple-200 hover:border-purple-400 rounded-lg transition-colors bg-purple-50/50"
            >
              <p className="font-semibold text-sm text-gray-900">⚡ Bloc de Branche</p>
              <p className="text-xs text-gray-600 mt-1">QRS élargi, BBG ou BBD</p>
            </button>

            {/* HVG */}
            <button
              onClick={() => {
                setInterpretation("Signes d'hypertrophie ventriculaire gauche. Indice de Sokolow-Lyon > 35 mm. [COMPLÉTER: Surcharge systolique de type strain pattern présente/absente]. Axe [COMPLÉTER]. Recommandation: Échocardiographie pour confirmation et évaluation de la fonction VG.");
                setTemplateDialogOpen(false);
              }}
              className="w-full p-3 text-left border-2 border-amber-200 hover:border-amber-400 rounded-lg transition-colors bg-amber-50/50"
            >
              <p className="font-semibold text-sm text-gray-900">💪 Hypertrophie VG</p>
              <p className="text-xs text-gray-600 mt-1">Sokolow positif, surcharge VG</p>
            </button>

            {/* BAV */}
            <button
              onClick={() => {
                setInterpretation("Bloc auriculo-ventriculaire du [COMPLÉTER: 1er/2ème/3ème] degré. PR [COMPLÉTER: allongé > 200ms / variable avec périodes de Wenckebach / dissociation AV complète]. [COMPLÉTER: Patient symptomatique/asymptomatique]. [COMPLÉTER: Surveillance cardiologique / Indication de pacemaker à discuter].");
                setTemplateDialogOpen(false);
              }}
              className="w-full p-3 text-left border-2 border-orange-200 hover:border-orange-400 rounded-lg transition-colors bg-orange-50/50"
            >
              <p className="font-semibold text-sm text-gray-900">🔄 Bloc AV</p>
              <p className="text-xs text-gray-600 mt-1">PR allongé, troubles de conduction AV</p>
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Second Avis - COMPLET */}
      <Dialog open={secondOpinionDialogOpen} onOpenChange={setSecondOpinionDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Demander un Second Avis
            </DialogTitle>
            <DialogDescription>
              ECG {ecg.id} • {ecg.patientName} • {ecg.patientAge} ans
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Contexte ECG */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-900 mb-2">📋 Contexte de la demande</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-blue-700">Patient:</span>
                  <span className="font-medium text-blue-900 ml-2">{ecg.patientName}, {ecg.patientAge} ans</span>
                </div>
                <div>
                  <span className="text-blue-700">Médecin référent:</span>
                  <span className="font-medium text-blue-900 ml-2">{ecg.referringDoctor}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-blue-700">Contexte:</span>
                  <span className="font-medium text-blue-900 ml-2">{ecg.clinicalContext}</span>
                </div>
              </div>
            </div>

            {/* Sélection cardiologue senior */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Cardiologue senior à consulter
              </Label>
              <Select defaultValue="dr-martin">
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-martin">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">PM</div>
                      <div>
                        <p className="font-medium text-sm">Dr. Pierre Martin</p>
                        <p className="text-xs text-gray-500">Spécialiste rythmologie • Disponible ✓</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="dr-rousseau">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">AR</div>
                      <div>
                        <p className="font-medium text-sm">Dr. Anne Rousseau</p>
                        <p className="text-xs text-gray-500">Spécialiste coronarien • En ligne ✓</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="dr-laurent">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">JL</div>
                      <div>
                        <p className="font-medium text-sm">Dr. Jean Laurent</p>
                        <p className="text-xs text-gray-500">Chef de service • Occupé ⏰</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgence de la demande */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Niveau d'urgence
              </Label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10 text-xs border-red-300 hover:bg-red-50">
                  🚨 URGENT (&lt; 15 min)
                </Button>
                <Button variant="outline" className="flex-1 h-10 text-xs border-amber-300 hover:bg-amber-50">
                  ⚡ Rapide (&lt; 1h)
                </Button>
                <Button variant="outline" className="flex-1 h-10 text-xs border-blue-300 hover:bg-blue-50">
                  📅 Standard (&lt; 24h)
                </Button>
              </div>
            </div>

            {/* Votre analyse préliminaire */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Votre analyse préliminaire
              </Label>
              <Textarea 
                placeholder="Décrivez vos observations et vos doutes...

Exemple:
• J'observe un sus-décalage du segment ST en V2-V4
• Hésitation entre STEMI antérieur ou repolarisation précoce
• Patient jeune, pas d'ATCD cardiovasculaire
• Demande confirmation avant activation SAMU"
                className="min-h-[120px] text-sm"
                defaultValue={interpretation}
              />
            </div>

            {/* Questions spécifiques */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Questions spécifiques (optionnel)
              </Label>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Checkbox />
                  <span>Confirmation diagnostic</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox />
                  <span>Conduite à tenir immédiate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox />
                  <span>Examens complémentaires suggérés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox />
                  <span>Hospitalisation nécessaire ?</span>
                </div>
              </div>
            </div>

            {/* Pièces jointes */}
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-xs font-medium text-gray-700 mb-2">📎 Pièces jointes</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                  <span>ECG complet (12 dérivations)</span>
                  <Badge className="ml-auto text-[10px]">Auto</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <FileText className="h-3.5 w-3.5 text-green-500" />
                  <span>Vos mesures + interprétation</span>
                  <Badge className="ml-auto text-[10px]">Auto</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <FileText className="h-3.5 w-3.5 text-amber-500" />
                  <span>Contexte clinique</span>
                  <Badge className="ml-auto text-[10px]">Auto</Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSecondOpinionDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 gap-2"
              onClick={() => {
                setSecondOpinionDialogOpen(false);
                toast({
                  title: "📨 Demande envoyée",
                  description: "Dr. Pierre Martin a été notifié par email et SMS",
                  duration: 3000,
                });
              }}
            >
              <Send className="h-4 w-4" />
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
