import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
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
  const { getById, getPending, saveMeasurements, completeAnalysis } = useCardiologueStore();

  const [ecg, setEcg] = useState(ecgId ? getById(ecgId) : null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [gridVisible, setGridVisible] = useState(true);
  const [activeTool, setActiveTool] = useState<'move' | 'calipers'>('move');
  const [speed, setSpeed] = useState<25 | 50>(25);
  const [amplitude, setAmplitude] = useState<5 | 10 | 20>(10);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
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

  // Auto-save toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (ecgId && (measurements.heartRate || interpretation)) {
        setIsAutoSaving(true);
        setTimeout(() => {
          setLastSaved(new Date());
          setIsAutoSaving(false);
        }, 500);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [ecgId, measurements, interpretation]);

  // Navigation
  const pendingECGs = getPending();
  const currentIndex = pendingECGs.findIndex(e => e.id === ecgId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < pendingECGs.length - 1;
  const totalECGs = pendingECGs.length;

  const handlePrevious = () => {
    if (hasPrevious) navigate(`/cardiologue/analyze/${pendingECGs[currentIndex - 1].id}`);
  };

  const handleNext = () => {
    if (hasNext) navigate(`/cardiologue/analyze/${pendingECGs[currentIndex + 1].id}`);
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
          navigate(`/cardiologue/analyze/${pendingECGs[currentIndex + 1].id}`);
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
      <div className={cn(
        "bg-white border-b flex flex-col z-20 shadow-sm transition-all duration-200",
        !isPanelOpen ? "h-24" : "h-14"
      )}>
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
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {currentIndex + 1} / {totalECGs}
            </span>
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
            <Button variant="outline" size="sm" className="gap-2">
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

        {/* Ligne 2 - Sticky info (visible uniquement quand panel fermé) */}
        {!isPanelOpen && (
          <div className="h-10 bg-gradient-to-r from-amber-50 to-orange-50 border-t flex items-center px-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-gray-500" />
              <span className="font-medium text-gray-700">{ecg.patientName}, {ecg.patientAge}ans ({ecg.patientGender === 'M' ? 'H' : 'F'})</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-600">{ecg.hospital}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-gray-700 font-medium">{ecg.clinicalContext}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-600">{ecg.referringDoctorEmail}</span>
            </div>
          </div>
        )}
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Phrases rapides
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

      {/* DIALOG COMPARAISON */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-indigo-600" />
              Comparaison avec ECG antérieur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">ECG Actuel - {format(parseISO(ecg.ecgDate), 'd MMM yyyy', { locale: fr })}</p>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                  <Activity className="h-12 w-12 text-gray-400" />
                </div>
                <div className="mt-2 text-xs space-y-1">
                  <p>FC: {measurements.heartRate} bpm</p>
                  <p>PR: {measurements.prInterval} ms</p>
                  <p>QRS: {measurements.qrsDuration} ms</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">ECG Antérieur - 15 Juin 2025</p>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                  <Activity className="h-12 w-12 text-gray-400" />
                </div>
                <div className="mt-2 text-xs space-y-1">
                  <p>FC: 68 bpm</p>
                  <p>PR: 155 ms</p>
                  <p>QRS: 88 ms</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm font-medium text-amber-900 mb-2">📊 Différences détectées :</p>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• FC: {measurements.heartRate && (measurements.heartRate - 68 > 0 ? '+' : '')}{measurements.heartRate && measurements.heartRate - 68} bpm (non significatif)</li>
                <li>• Morphologie ST: Stable</li>
                <li>• Axe QRS: Stable</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
