import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  Building2,
  Calendar,
  Save,
  Send,
  ZoomIn,
  ZoomOut,
  Move,
  Ruler,
  Grid3X3,
  RotateCcw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Printer,
  Users,
  Sparkles,
  ChevronDown,
  AlertTriangle
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
} from "@/components/ui/dialog";
import { 
  useCardiologueStore, 
  conclusionTemplates,
  type ECGMeasurements,
  type ECGInterpretation 
} from '@/stores/useCardiologueStore';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function AnalyzeECG() {
  const { ecgId } = useParams<{ ecgId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getById, getPending, saveMeasurements, completeAnalysis, startAnalysis } = useCardiologueStore();

  const [ecg, setEcg] = useState(ecgId ? getById(ecgId) : null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTool, setActiveTool] = useState<'move' | 'caliper'>('move');
  const [showGrid, setShowGrid] = useState(true);
  const [speed, setSpeed] = useState<25 | 50>(25);
  const [amplitude, setAmplitude] = useState<5 | 10 | 20>(10);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Navigation entre ECG
  const pendingECGs = getPending();
  const currentIndex = pendingECGs.findIndex(e => e.id === ecgId);
  const totalECGs = pendingECGs.length;

  // Mesures
  const [measurements, setMeasurements] = useState<ECGMeasurements>({
    heartRate: ecg?.measurements?.heartRate || undefined,
    prInterval: ecg?.measurements?.prInterval || undefined,
    qrsDuration: ecg?.measurements?.qrsDuration || undefined,
    qtInterval: ecg?.measurements?.qtInterval || undefined,
    qtcInterval: ecg?.measurements?.qtcInterval || undefined,
    axis: ecg?.measurements?.axis || '',
    rhythm: ecg?.measurements?.rhythm || 'Sinusal',
  });

  // Interprétation
  const [interpretation, setInterpretation] = useState(ecg?.interpretation?.conclusion || '');
  const [isNormal, setIsNormal] = useState(ecg?.interpretation?.isNormal ?? true);

  useEffect(() => {
    if (ecgId) {
      const foundEcg = getById(ecgId);
      if (foundEcg) {
        setEcg(foundEcg);
        if (foundEcg.status === 'pending') {
          startAnalysis(ecgId);
        }
      } else {
        toast({
          title: "ECG non trouvé",
          description: "L'ECG demandé n'existe pas.",
          variant: "destructive"
        });
        navigate('/cardiologue/pending');
      }
    }
  }, [ecgId]);

  // Calcul automatique du QTc
  useEffect(() => {
    if (measurements.qtInterval && measurements.heartRate) {
      const rr = 60 / measurements.heartRate;
      const qtc = Math.round(measurements.qtInterval / Math.sqrt(rr));
      setMeasurements(prev => ({ ...prev, qtcInterval: qtc }));
    }
  }, [measurements.qtInterval, measurements.heartRate]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < totalECGs) {
      navigate(`/cardiologue/analyze/${pendingECGs[newIndex].id}`);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = conclusionTemplates.find(t => t.id === templateId);
    if (template) {
      setInterpretation(template.text);
      setIsNormal(template.isNormal);
    }
  };

  const handleSave = () => {
    if (ecgId) {
      saveMeasurements(ecgId, measurements);
      toast({
        title: "Sauvegardé",
        description: "Les données ont été enregistrées."
      });
    }
  };

  const handleComplete = () => {
    if (!interpretation.trim()) {
      toast({
        title: "Interprétation requise",
        description: "Veuillez rédiger une interprétation avant de valider.",
        variant: "destructive"
      });
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmComplete = () => {
    if (ecgId) {
      const interp: ECGInterpretation = {
        findings: [],
        conclusion: interpretation,
        isNormal: isNormal,
      };
      completeAnalysis(ecgId, interp);
      toast({
        title: "ECG validé",
        description: "Le rapport a été envoyé."
      });
      // Naviguer vers le prochain ECG ou retour
      if (currentIndex < totalECGs - 1) {
        navigate(`/cardiologue/analyze/${pendingECGs[currentIndex + 1].id}`);
      } else {
        navigate('/cardiologue');
      }
    }
    setConfirmDialogOpen(false);
  };

  // Raccourcis clavier pour l'interprétation
  const handleInterpretationKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleComplete();
    }
  };

  // Insertion de phrases rapides
  const insertQuickPhrase = (phrase: string) => {
    setInterpretation(prev => prev ? `${prev}\n${phrase}` : phrase);
  };

  if (!ecg) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header compact */}
      <header className="bg-white border-b border-border/60 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/cardiologue')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-gray-900">{ecg.id}</h1>
            {ecg.urgency === 'urgent' && (
              <Badge className="bg-red-500 text-white text-[10px]">URGENT</Badge>
            )}
          </div>
          
          <span className="text-sm text-gray-500">
            {ecg.patientName} • {ecg.patientAge} ans • {ecg.patientGender === 'M' ? 'Homme' : 'Femme'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation ECG */}
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => handleNavigate('prev')}
              disabled={currentIndex <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[40px] text-center">
              {currentIndex + 1} / {totalECGs || 1}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => handleNavigate('next')}
              disabled={currentIndex >= totalECGs - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Aperçu
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-1" />
            Second avis
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1" />
            Imprimer
          </Button>
          <Button 
            size="sm" 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleComplete}
          >
            <Send className="h-4 w-4 mr-1" />
            Valider & Envoyer
          </Button>
        </div>
      </header>

      {/* Zone principale - Layout vertical avec ECG en grand */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Zone ECG (70% de hauteur) */}
        <div className="flex-[0.7] flex flex-col min-h-0">
          {/* Barre d'outils ECG */}
          <div className="bg-white border-b border-border/40 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              {/* Zoom */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Zoom:</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs w-10 text-center">{zoomLevel}%</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-gray-200" />

              {/* Outils */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-1">Outils:</span>
                <Button 
                  variant={activeTool === 'move' ? 'default' : 'outline'} 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => setActiveTool('move')}
                >
                  <Move className="h-3 w-3 mr-1" />
                  Déplacer
                </Button>
                <Button 
                  variant={activeTool === 'caliper' ? 'default' : 'outline'} 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => setActiveTool('caliper')}
                >
                  <Ruler className="h-3 w-3 mr-1" />
                  Calipers
                </Button>
              </div>

              <Button 
                variant={showGrid ? 'default' : 'outline'} 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className="h-3 w-3 mr-1" />
                Grille
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {/* Vitesse */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Vitesse:</span>
                <div className="flex rounded-lg border overflow-hidden">
                  <button 
                    className={cn(
                      "px-2 py-1 text-xs",
                      speed === 25 ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
                    )}
                    onClick={() => setSpeed(25)}
                  >
                    25 mm/s
                  </button>
                  <button 
                    className={cn(
                      "px-2 py-1 text-xs",
                      speed === 50 ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
                    )}
                    onClick={() => setSpeed(50)}
                  >
                    50 mm/s
                  </button>
                </div>
              </div>

              {/* Amplitude */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Amplitude:</span>
                <div className="flex rounded-lg border overflow-hidden">
                  {[5, 10, 20].map(val => (
                    <button 
                      key={val}
                      className={cn(
                        "px-2 py-1 text-xs",
                        amplitude === val ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
                      )}
                      onClick={() => setAmplitude(val as 5 | 10 | 20)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-400">mm/mV</span>
              </div>
            </div>
          </div>

          {/* Visualisation ECG - Grand affichage */}
          <div className="flex-1 p-4 overflow-auto bg-gray-100">
            <div 
              className={cn(
                "bg-white rounded-lg border h-full w-full relative overflow-hidden shadow-sm",
                showGrid && "bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M%200%200%20L%2020%200%20L%2020%2020%20L%200%2020%20Z%22%20fill%3D%22none%22%20stroke%3D%22%23fecaca%22%20stroke-width%3D%220.5%22%2F%3E%3C%2Fsvg%3E')] bg-repeat"
              )}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', minHeight: '500px' }}
            >
              {/* Indicateurs */}
              <div className="absolute top-2 left-2 flex items-center gap-2 text-[10px] text-gray-500 bg-white/80 px-2 py-1 rounded">
                <span>{speed} mm/s</span>
                <span>{amplitude} mm/mV</span>
                <span>Zoom: {zoomLevel}%</span>
              </div>

              {/* Boutons de contrôle */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/80">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/80">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Dérivation II (Rhythm) */}
              <div className="absolute top-8 left-4 text-xs text-gray-600">II (Rhythm)</div>
              
              {/* Calibration */}
              <div className="absolute bottom-4 left-4 flex flex-col items-start">
                <div className="w-px h-8 bg-gray-800"></div>
                <div className="w-6 h-px bg-gray-800"></div>
                <span className="text-[9px] text-gray-500 mt-1">1mV</span>
              </div>

              {/* Tracé ECG simulé - Plus visible */}
              <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
                <path
                  d="M 0 200 L 50 200 L 60 200 L 70 190 L 80 200 L 90 200 L 100 200 L 110 130 L 120 230 L 130 200 L 140 200 L 150 195 L 160 200 L 200 200 L 210 200 L 220 190 L 230 200 L 240 200 L 250 200 L 260 130 L 270 230 L 280 200 L 290 200 L 300 195 L 310 200 L 350 200 L 360 200 L 370 190 L 380 200 L 390 200 L 400 200 L 410 130 L 420 230 L 430 200 L 440 200 L 450 195 L 460 200 L 500 200 L 510 200 L 520 190 L 530 200 L 540 200 L 550 200 L 560 130 L 570 230 L 580 200 L 590 200 L 600 195 L 610 200 L 650 200 L 660 200 L 670 190 L 680 200 L 690 200 L 700 200 L 710 130 L 720 230 L 730 200 L 740 200 L 750 195 L 760 200 L 800 200 L 810 200 L 820 190 L 830 200 L 840 200 L 850 200 L 860 130 L 870 230 L 880 200 L 890 200 L 900 195 L 910 200 L 950 200 L 960 200 L 970 190 L 980 200 L 990 200 L 1000 200 L 1010 130 L 1020 230 L 1030 200 L 1040 200 L 1050 195 L 1060 200 L 1100 200 L 1110 200 L 1120 190 L 1130 200 L 1140 200 L 1150 200 L 1160 130 L 1170 230 L 1180 200 L 1190 200 L 1200 195"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Panneaux du bas - 3 cartes compactes (30% de hauteur) */}
      <div className="flex-[0.3] bg-white border-t border-border/60 flex-shrink-0 overflow-y-auto">
        <div className="grid grid-cols-3 divide-x divide-border/40 h-full">
          {/* Informations Patient - Carte compacte */}
          <div className="p-3 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-3.5 w-3.5 text-gray-500" />
              <h3 className="font-medium text-xs">Informations Patient</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                  ecg.patientGender === 'M' ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                )}>
                  {ecg.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-xs">{ecg.patientName}</p>
                  <p className="text-[10px] text-gray-500">{ecg.patientAge} ans • {ecg.patientGender === 'M' ? 'Homme' : 'Femme'}</p>
                </div>
              </div>
              <div className="border-t border-border/40 pt-2 mt-2"></div>
              <div className="text-[10px] text-gray-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-2.5 w-2.5 text-gray-400" />
                  <span>Date: {format(parseISO(ecg.ecgDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-2.5 w-2.5 text-gray-400" />
                  <span>Centre: {ecg.hospital}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-2.5 w-2.5 text-gray-400" />
                  <span>Prescripteur: {ecg.referringDoctor}</span>
                </div>
              </div>
              {ecg.clinicalContext && (
                <div className="mt-2 p-1.5 bg-amber-50 rounded border border-amber-200">
                  <div className="flex items-center gap-1 text-amber-700 text-[10px] font-medium mb-0.5">
                    <span className="text-amber-600">▲</span>
                    Symptômes
                  </div>
                  <p className="text-[10px] text-amber-800">{ecg.clinicalContext}</p>
                </div>
              )}
            </div>
          </div>

          {/* Mesures ECG - Carte compacte */}
          <div className="p-3 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="h-3.5 w-3.5 text-gray-500" />
              <h3 className="font-medium text-xs">Mesures ECG</h3>
            </div>
            <div className="space-y-2">
              {/* Fréquence cardiaque */}
              <div className="p-2 bg-gray-50 rounded">
                <Label className="text-[10px] text-gray-500">Fréquence Cardiaque</Label>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <Input
                    type="number"
                    className="h-7 w-16 text-base font-semibold text-xs"
                    value={measurements.heartRate || ''}
                    onChange={(e) => setMeasurements({...measurements, heartRate: parseInt(e.target.value) || undefined})}
                    placeholder="—"
                  />
                  <span className="text-xs text-gray-600">bpm</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">Normal: 60-100 bpm</p>
              </div>

              {/* Intervalles */}
              <div>
                <p className="text-[10px] font-medium text-gray-500 mb-1.5">INTERVALLES</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <Label className="text-[9px] text-gray-500">PR</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        className="h-6 text-xs"
                        value={measurements.prInterval || ''}
                        onChange={(e) => setMeasurements({...measurements, prInterval: parseInt(e.target.value) || undefined})}
                        placeholder="—"
                      />
                      <span className="text-[10px] text-gray-400">ms</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">QRS</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        className="h-6 text-xs"
                        value={measurements.qrsDuration || ''}
                        onChange={(e) => setMeasurements({...measurements, qrsDuration: parseInt(e.target.value) || undefined})}
                        placeholder="—"
                      />
                      <span className="text-[10px] text-gray-400">ms</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">QT</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        className="h-6 text-xs"
                        value={measurements.qtInterval || ''}
                        onChange={(e) => setMeasurements({...measurements, qtInterval: parseInt(e.target.value) || undefined})}
                        placeholder="—"
                      />
                      <span className="text-[10px] text-gray-400">ms</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500">QTc</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        className="h-6 text-xs bg-gray-100"
                        value={measurements.qtcInterval || ''}
                        readOnly
                        placeholder="Auto"
                      />
                      <span className="text-[10px] text-gray-400">ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interprétation - Carte compacte */}
          <div className="p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gray-500" />
                <h3 className="font-medium text-xs">Interprétation</h3>
              </div>
              <Select onValueChange={handleApplyTemplate}>
                <SelectTrigger className="w-[110px] h-6 text-[10px]">
                  <SelectValue placeholder="Phrases rapides" />
                </SelectTrigger>
                <SelectContent>
                  {conclusionTemplates.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Textarea
                placeholder="Saisissez votre interprétation ici..."
                className="min-h-[80px] text-xs resize-none"
                value={interpretation}
                onChange={(e) => setInterpretation(e.target.value)}
                onKeyDown={handleInterpretationKeyDown}
              />
              <div className="text-[9px] text-gray-400 space-y-0.5">
                <p className="font-medium">Utilisez les raccourcis:</p>
                <p>• /rs → Rythme sinusal régulier</p>
                <p>• /fa → Fibrillation auriculaire</p>
                <p>• /ecgn → ECG normal</p>
                <p>• ...</p>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] text-gray-400">{interpretation.length} caractères</span>
                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={handleSave}>
                  <Save className="h-2.5 w-2.5 mr-1" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmation */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la validation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Vous êtes sur le point de valider et envoyer ce rapport ECG.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
              <p><strong>Patient:</strong> {ecg.patientName}</p>
              <p><strong>ECG:</strong> {ecg.id}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-indigo-800">Interprétation :</p>
              <p className="text-indigo-700 mt-1">{interpretation}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmComplete} className="bg-indigo-600 hover:bg-indigo-700">
              <Send className="h-4 w-4 mr-1" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
