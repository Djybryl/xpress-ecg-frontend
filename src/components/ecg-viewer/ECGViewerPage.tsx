import { useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Send,
  Eye,
  UserPlus,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ECGCanvas } from './ECGCanvas';
import { PatientInfoPanel } from './PatientInfoPanel';
import { MeasurementsPanel } from './MeasurementsPanel';
import { InterpretationPanel } from './InterpretationPanel';
import { ECGToolbar } from './ECGToolbar';

// Types
export interface ECGRecord {
  id: string;
  referenceNumber: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  patientBirthDate: string;
  medicalCenter: string;
  referringDoctor: string;
  acquisitionDate: string;
  clinicalContext?: string;
  symptoms?: string;
  medications?: string;
  status: 'pending' | 'in_progress' | 'validated' | 'sent';
  priority: 'normal' | 'urgent' | 'critical';
}

export interface ECGMeasurements {
  heartRate: number | null;
  prInterval: number | null;
  qrsDuration: number | null;
  qtInterval: number | null;
  qtcInterval: number | null;
  axisP: number | null;
  axisQRS: number | null;
  axisT: number | null;
}

interface ECGViewerPageProps {
  record: ECGRecord;
  records: ECGRecord[];
  onClose: () => void;
  onValidate: (record: ECGRecord, measurements: ECGMeasurements, interpretation: string) => void;
  onNavigate: (record: ECGRecord) => void;
}

export function ECGViewerPage({ 
  record, 
  records, 
  onClose, 
  onValidate,
  onNavigate 
}: ECGViewerPageProps) {
  // État des mesures
  const [measurements, setMeasurements] = useState<ECGMeasurements>({
    heartRate: null,
    prInterval: null,
    qrsDuration: null,
    qtInterval: null,
    qtcInterval: null,
    axisP: null,
    axisQRS: null,
    axisT: null,
  });

  // État de l'interprétation
  const [interpretation, setInterpretation] = useState('');
  
  // État du zoom et des outils
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTool, setActiveTool] = useState<'pan' | 'caliper' | 'marker'>('pan');
  const [showGrid, setShowGrid] = useState(true);
  const [speed, setSpeed] = useState<25 | 50>(25);
  const [amplitude, setAmplitude] = useState<5 | 10 | 20>(10);
  
  // État de validation
  const [isValidated, setIsValidated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Navigation
  const currentIndex = records.findIndex(r => r.id === record.id);
  const totalRecords = records.length;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalRecords - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onNavigate(records[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onNavigate(records[currentIndex + 1]);
    }
  };

  // Gestion des mesures
  const handleMeasurementChange = useCallback((key: keyof ECGMeasurements, value: number | null) => {
    setMeasurements(prev => {
      const updated = { ...prev, [key]: value };
      
      // Calcul automatique du QTc (formule de Bazett)
      if (key === 'qtInterval' || key === 'heartRate') {
        const qt = key === 'qtInterval' ? value : prev.qtInterval;
        const hr = key === 'heartRate' ? value : prev.heartRate;
        
        if (qt && hr && hr > 0) {
          const rr = 60 / hr; // Intervalle RR en secondes
          const qtc = Math.round(qt / Math.sqrt(rr));
          updated.qtcInterval = qtc;
        }
      }
      
      return updated;
    });
  }, []);

  // Validation
  const handleValidate = async () => {
    setIsSaving(true);
    
    // Simulation de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsValidated(true);
    setIsSaving(false);
    onValidate(record, measurements, interpretation);
  };

  // Raccourcis clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && canGoPrevious) {
      handlePrevious();
    } else if (e.key === 'ArrowRight' && canGoNext) {
      handleNext();
    } else if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (!isValidated) handleValidate();
    }
  }, [canGoPrevious, canGoNext, isValidated]);

  // Effet pour les raccourcis clavier
  useState(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Gauche - Retour et titre */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <div className="h-6 w-px bg-gray-200" />
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{record.referenceNumber}</span>
                {record.priority === 'urgent' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    URGENT
                  </span>
                )}
                {record.priority === 'critical' && (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded-full animate-pulse">
                    CRITIQUE
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {record.patientName} • {record.patientAge} ans • {record.patientGender === 'M' ? 'Homme' : 'Femme'}
              </p>
            </div>
          </div>

          {/* Centre - Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
              {currentIndex + 1} / {totalRecords}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={!canGoNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Droite - Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-gray-600">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            
            <Button variant="outline" size="sm" className="text-gray-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Second avis
            </Button>
            
            <Button variant="outline" size="sm" className="text-gray-600">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>

            <div className="h-6 w-px bg-gray-200 mx-1" />

            <Button
              onClick={handleValidate}
              disabled={isValidated || isSaving}
              className={`min-w-[160px] ${
                isValidated 
                  ? 'bg-green-600 hover:bg-green-600' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Validation...
                </>
              ) : isValidated ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Validé ✓
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Valider & Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Toolbar ECG */}
      <ECGToolbar
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        speed={speed}
        onSpeedChange={setSpeed}
        amplitude={amplitude}
        onAmplitudeChange={setAmplitude}
      />

      {/* Contenu principal */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex flex-col gap-4">
          {/* Zone ECG */}
          <div className="flex-1 min-h-0">
            <ECGCanvas
              zoomLevel={zoomLevel}
              showGrid={showGrid}
              speed={speed}
              amplitude={amplitude}
              activeTool={activeTool}
            />
          </div>

          {/* Panneaux inférieurs */}
          <div className="grid grid-cols-3 gap-4 h-[280px]">
            {/* Panneau Patient */}
            <PatientInfoPanel record={record} />

            {/* Panneau Mesures */}
            <MeasurementsPanel
              measurements={measurements}
              onMeasurementChange={handleMeasurementChange}
            />

            {/* Panneau Interprétation */}
            <InterpretationPanel
              interpretation={interpretation}
              onInterpretationChange={setInterpretation}
              isValidated={isValidated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

