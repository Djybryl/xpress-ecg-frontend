import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PanelRightOpen,
  PanelRightClose,
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
import { IMAGES } from '@/lib/constants';

/** Ordre standard des 12 dérivations */
const LEAD_ORDER = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'] as const;
/** 6x2+1 : 6 lignes x 2 colonnes (périph. gauche, précord. droite) + bande DII */
const LEAD_ORDER_6X2: [string, string][] = [
  ['I', 'V1'], ['II', 'V2'], ['III', 'V3'], ['aVR', 'V4'], ['aVL', 'V5'], ['aVF', 'V6'],
];

/** Tracé ECG simulé — complexe PQRST réaliste (courbes lissées, type ECG classique) */
const ECG_PQRST_PATH = "M0,25 Q12,25 20,23 Q28,24 35,25 L45,25 Q55,24 65,26 Q72,27 80,25 Q82,26 84,29 L86,33 Q87,31 88,26 L90,16 Q92,10 96,12 Q99,14 101,20 L103,30 Q105,27 108,25 L140,25 Q170,24 200,25 L260,25 Q275,23 290,25 Q302,27 312,25 L325,25 Q335,26 345,24 Q352,25 358,25 Q361,26 363,28 L365,32 Q366,30 368,26 L370,17 Q372,11 376,13 Q379,15 381,21 L383,30 Q385,27 388,25 L400,25";

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
  const [displayMode, setDisplayMode] = useState<'3x4' | '6x2' | '12x1'>('6x2');
  const [filterLowPass, setFilterLowPass] = useState(false);
  const [filterHighPass, setFilterHighPass] = useState(false);
  const [filterNotch, setFilterNotch] = useState(false);
  const [fcRulerActive, setFcRulerActive] = useState(false);
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
  const [toolsPanelOpen, setToolsPanelOpen] = useState(true);
  
  const [measurements, setMeasurements] = useState<{
    heartRate?: number; prInterval?: number; qrsDuration?: number;
    qtInterval?: number; qtcInterval?: number;
    pAxis: string; qrsAxis: string; tAxis: string; rhythm: string;
    sokolow?: number;
  }>({
    heartRate: ecg?.measurements?.heartRate || undefined,
    prInterval: ecg?.measurements?.prInterval || undefined,
    qrsDuration: ecg?.measurements?.qrsDuration || undefined,
    qtInterval: ecg?.measurements?.qtInterval || undefined,
    qtcInterval: ecg?.measurements?.qtcInterval || undefined,
    pAxis: '',
    qrsAxis: '',
    tAxis: '',
    rhythm: ecg?.measurements?.rhythm || 'Sinusal',
    sokolow: undefined,
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
        setZoomLevel(prev => Math.max(50, Math.min(400, prev + delta)));
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
    ? `calc(100vh - 56px - ${panelHeight}px - 32px)` 
    : 'calc(100vh - 56px - 32px - 40px)';

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

      {/* ZONE ECG + BANDE LATÉRALE OUTILS */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Zone ECG (prend tout l'espace disponible) */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
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
          className={cn("w-full h-full min-h-[400px] relative overflow-auto")}
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
              ? '25px 25px, 25px 25px, 5px 5px, 5px 5px'
              : 'auto',
          }}
        >
          <div className="p-4 w-full h-full">
            {/* ECG : image unique (JPEG/PNG) ou grille 12 dérivations */}
            {ecg?.ecgImageUrl ? (
              <div style={{ transform: 'none' }}>
                {/* Légende des dérivations (au-dessus de l'image) */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 px-3 mb-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium">Dérivations 12:</span>
                  <span className="text-xs font-mono text-slate-700">
                    I · II · III · aVR · aVL · aVF · V1 · V2 · V3 · V4 · V5 · V6
                  </span>
                </div>
                <div 
                  className="rounded border border-gray-200 bg-white overflow-hidden"
                  style={{ contain: 'layout paint', minHeight: 200 }}
                >
                  <img
                    key={ecg.ecgImageUrl}
                    src={ecg.ecgImageUrl}
                    alt="ECG 12 dérivations"
                    loading="eager"
                    decoding="sync"
                    className="block w-full h-auto max-h-[70vh] object-contain bg-white"
                    style={{ imageRendering: 'auto', verticalAlign: 'top' }}
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      if (el.src !== IMAGES.ECG.FALLBACK) el.src = IMAGES.ECG.FALLBACK;
                    }}
                  />
                </div>
                {/* Bande dérivation longue DII — style papier */}
                <div 
                  className="mt-3 flex items-stretch min-h-[56px] bg-[#fafafa] rounded overflow-hidden"
                  style={{
                    backgroundImage: gridVisible ? 'linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px), linear-gradient(to right, #d4d4d4 1px, transparent 1px), linear-gradient(to bottom, #d4d4d4 1px, transparent 1px)' : 'none',
                    backgroundSize: gridVisible ? '5px 5px, 5px 5px, 25px 25px, 25px 25px' : 'auto',
                  }}
                >
                  <span className="w-16 flex-shrink-0 text-[10px] font-medium text-gray-600 pt-0.5 pl-1">DII long</span>
                    <svg viewBox="0 0 800 50" className="flex-1 h-full min-h-[48px]" preserveAspectRatio="none">
                      <path fill="none" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d="M0,25 Q15,25 30,22 Q45,24 60,25 Q75,26 90,25 Q100,27 105,32 Q108,28 112,25 Q130,25 Q160,24 200,25 L260,25 Q280,23 295,25 Q308,27 320,25 Q340,26 355,23 Q368,24 378,25 Q382,26 385,28 L388,32 Q390,30 393,25 L400,25 Q430,24 460,25 L520,25 Q540,23 555,25 Q568,27 580,25 Q600,26 615,23 Q628,24 638,25 Q642,26 645,28 L648,32 Q650,30 653,25 L660,25 Q690,24 720,25 L780,25 Q795,24 800,25" />
                    </svg>
                </div>
              </div>
            ) : (
              <div
                style={{ 
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                }}
              >
                {/* Tracé ECG type papier — sans encadrés, grille continue */}
                <div
                  className={cn(
                    'rounded overflow-hidden',
                    gridVisible && 'bg-[#fafafa]'
                  )}
                  style={{
                    backgroundImage: gridVisible
                      ? 'linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px), linear-gradient(to right, #d4d4d4 1px, transparent 1px), linear-gradient(to bottom, #d4d4d4 1px, transparent 1px)'
                      : 'none',
                    backgroundSize: gridVisible ? '5px 5px, 5px 5px, 25px 25px, 25px 25px' : 'auto',
                  }}
                >
                  {/* Grille 12 dérivations — disposition réaliste sans encadrés */}
                  <div
                    className={cn(
                      'grid gap-0',
                      displayMode === '3x4' && 'grid-cols-3 grid-rows-4',
                      displayMode === '6x2' && 'grid-cols-2 grid-rows-6',
                      displayMode === '12x1' && 'grid-cols-12 grid-rows-1'
                    )}
                    style={{ minHeight: displayMode === '12x1' ? 48 : 140 }}
                  >
                    {displayMode === '6x2' ? (
                      LEAD_ORDER_6X2.flatMap(([left, right]) => [
                        <div key={left} className="flex items-stretch min-h-[52px]">
                          <span className="w-8 flex-shrink-0 text-[10px] font-medium text-gray-600 pt-0.5 pl-1">{left}</span>
                          <svg viewBox="0 0 400 50" className="flex-1 h-full" preserveAspectRatio="none">
                            <path fill="none" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d={ECG_PQRST_PATH} />
                          </svg>
                        </div>,
                        <div key={right} className="flex items-stretch min-h-[52px]">
                          <span className="w-8 flex-shrink-0 text-[10px] font-medium text-gray-600 pt-0.5 pl-1">{right}</span>
                          <svg viewBox="0 0 400 50" className="flex-1 h-full" preserveAspectRatio="none">
                            <path fill="none" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d={ECG_PQRST_PATH} />
                          </svg>
                        </div>,
                      ])
                    ) : (
                      LEAD_ORDER.map((lead) => (
                        <div key={lead} className="flex items-stretch min-h-[48px]">
                          <span className="w-7 flex-shrink-0 text-[10px] font-medium text-gray-600 pt-0.5 pl-0.5">{lead}</span>
                          <svg viewBox="0 0 400 50" className="flex-1 h-full" preserveAspectRatio="none">
                            <path fill="none" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d={ECG_PQRST_PATH} />
                          </svg>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Bande dérivation longue DII — même style papier, sans encadré */}
                  <div className="mt-2 flex items-stretch min-h-[56px]" style={{ borderTop: gridVisible ? '1px solid #d4d4d4' : undefined }}>
                    <span className="w-16 flex-shrink-0 text-[10px] font-medium text-gray-600 pt-0.5 pl-1">DII long</span>
                    <svg viewBox="0 0 800 50" className="flex-1 h-full" preserveAspectRatio="none">
                      <path fill="none" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d="M0,25 Q15,25 30,22 Q45,24 60,25 Q75,26 85,25 Q88,27 90,29 L92,33 Q93,31 95,26 L97,16 Q99,10 103,12 Q106,14 108,20 L110,30 Q112,27 115,25 L180,25 Q220,24 260,25 L330,25 Q345,24 360,25 Q372,26 382,25 Q385,27 387,29 L389,33 Q390,31 392,26 L394,16 Q396,10 400,12 Q403,14 405,20 L407,30 Q409,27 412,25 L480,25 Q520,24 560,25 L630,25 Q645,24 660,25 Q672,26 682,25 Q685,27 687,29 L689,33 Q690,31 692,26 L694,16 Q696,10 700,12 Q703,14 705,20 L707,30 Q709,27 712,25 L780,25 Q795,24 800,25" />
                    </svg>
                  </div>
                </div>
                {(filterLowPass || filterHighPass || filterNotch) && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    Filtres: {[filterLowPass && '40Hz', filterHighPass && '0.05Hz', filterNotch && 'Notch'].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>
            )}
            {fcRulerActive && (
              <div className="mt-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-800 flex items-center gap-2">
                <Heart className="h-4 w-4 flex-shrink-0" />
                <span><strong>Règle FC:</strong> mesurez l’intervalle RR (en mm ou ms), FC = 60 000 / RR(ms) ou 300 / nombre de grands carreaux entre deux R.</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Vitesse: {speed} mm/s • Amplitude: {amplitude} mm/mV • Ctrl+Scroll: zoom • [G]: grille
            </p>
          </div>

          <div className="absolute bottom-4 left-4 flex items-end gap-1">
            <span className="text-xs text-gray-500">1 mV</span>
            <div className="w-4 h-10 border-l-2 border-b-2 border-gray-400" />
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

        </div>

        {/* Bande latérale outils (rétractable) */}
        {toolsPanelOpen ? (
          <div className="w-[220px] flex-shrink-0 bg-white border-l flex flex-col overflow-y-auto">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Outils ECG</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setToolsPanelOpen(false)} title="Rétracter">
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 space-y-4 text-sm">
              <div>
                <span className="text-xs text-gray-500 block mb-1.5">Échelles</span>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-gray-500">Vitesse</span>
                    <div className="flex rounded border overflow-hidden mt-0.5">
                      {([25, 50] as const).map((s) => (
                        <button key={s} className={cn("flex-1 py-1.5 text-xs", speed === s ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-50")} onClick={() => setSpeed(s)}>{s} mm/s</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500">Amplitude</span>
                    <div className="flex rounded border overflow-hidden mt-0.5">
                      {[5, 10, 20].map((amp) => (
                        <button key={amp} className={cn("flex-1 py-1.5 text-xs", amplitude === amp ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-50")} onClick={() => setAmplitude(amp as 5 | 10 | 20)}>{amp}</button>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">mm/mV</span>
                  </div>
                </div>
              </div>
              {!ecg?.ecgImageUrl && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1.5">Disposition</span>
                  <div className="flex flex-wrap gap-1">
                    {(['3x4', '6x2', '12x1'] as const).map((mode) => (
                      <button key={mode} className={cn("px-2 py-1 text-xs rounded border", displayMode === mode ? "bg-indigo-600 text-white border-indigo-600" : "bg-white")} onClick={() => setDisplayMode(mode)}>{mode}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-xs text-gray-500 block mb-1.5">Zoom</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}><ZoomOut className="h-3.5 w-3.5" /></Button>
                  <span className="flex-1 text-center text-xs font-medium">{zoomLevel}%</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(Math.min(400, zoomLevel + 10))}><ZoomIn className="h-3.5 w-3.5" /></Button>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-1 h-7 text-xs" onClick={() => setZoomLevel(100)}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset
                </Button>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1.5">Outils</span>
                <div className="flex gap-1">
                  <Button variant={activeTool === 'move' ? 'default' : 'outline'} size="sm" className="flex-1 h-7 text-xs" onClick={() => setActiveTool('move')}><Move className="h-3 w-3" /></Button>
                  <Button variant={activeTool === 'calipers' ? 'default' : 'outline'} size="sm" className="flex-1 h-7 text-xs" onClick={() => setActiveTool('calipers')}><Ruler className="h-3 w-3" /></Button>
                </div>
              </div>
              <Button variant={gridVisible ? 'default' : 'outline'} size="sm" className="w-full h-7 text-xs" onClick={() => setGridVisible(!gridVisible)}>
                <Grid3X3 className="h-3 w-3 mr-1" /> Grille
              </Button>
              <div>
                <span className="text-xs text-gray-500 block mb-1.5">Filtres</span>
                <div className="flex flex-wrap gap-1">
                  <Button variant={filterLowPass ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setFilterLowPass(!filterLowPass)}>40Hz</Button>
                  <Button variant={filterHighPass ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setFilterHighPass(!filterHighPass)}>0.05Hz</Button>
                  <Button variant={filterNotch ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setFilterNotch(!filterNotch)}>Notch</Button>
                </div>
              </div>
              <Button variant={fcRulerActive ? 'default' : 'outline'} size="sm" className="w-full h-7 text-xs" onClick={() => setFcRulerActive(!fcRulerActive)}>
                <Heart className="h-3 w-3 mr-1" /> Règle FC
              </Button>
            </div>
            {(lastSaved || isAutoSaving) && (
              <div className="p-2 border-t mt-auto text-xs text-gray-500 flex items-center gap-1.5">
                {isAutoSaving ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                {isAutoSaving ? 'Enregistrement...' : `Sauvegardé ${lastSaved ? format(lastSaved, 'HH:mm') : ''}`}
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 flex-shrink-0 bg-white border-l flex flex-col items-center py-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setToolsPanelOpen(true)} title="Ouvrir les outils">
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
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
                      { label: 'QTc', unit: 'ms', current: measurements.qtcInterval, previous: selectedPrevious.measurements.qtc, key: 'qtc' },
                      { label: 'Axe P', unit: '°', current: measurements.pAxis, previous: selectedPrevious.measurements.pAxis, key: 'pAxis' },
                      { label: 'Axe QRS', unit: '°', current: measurements.qrsAxis, previous: selectedPrevious.measurements.qrsAxis, key: 'qrsAxis' },
                      { label: 'Axe T', unit: '°', current: measurements.tAxis, previous: selectedPrevious.measurements.tAxis, key: 'tAxis' },
                      { label: 'Indice Sokolow', unit: 'mm', current: measurements.sokolow, previous: selectedPrevious.measurements.sokolow, key: 'sokolow' },
                    ].map((param) => {
                      const delta = calculateDelta(Number(param.current) || undefined, Number(param.previous) || undefined);
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
