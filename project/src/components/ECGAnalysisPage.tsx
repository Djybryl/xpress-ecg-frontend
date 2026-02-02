import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Printer,
  Eye,
  Send,
  ZoomIn,
  ZoomOut,
  RotateCw,
  User,
  UserPlus,
  Activity,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ECGReportPreview } from './ECGReportPreview';
import { Image } from '@/components/ui/image';
import { IMAGES } from '@/lib/constants';

interface ECGRecord {
  id: string;
  patientName: string;
  medicalCenter: string;
  date: string;
  status: 'pending' | 'analyzing' | 'completed';
}

interface ECGAnalysisPageProps {
  record: ECGRecord;
  filteredRecords: ECGRecord[];
  onClose: () => void;
  onValidate: () => void;
  onChangeRecord: (record: ECGRecord) => void;
}

export function ECGAnalysisPage({ 
  record, 
  filteredRecords,
  onClose, 
  onValidate,
  onChangeRecord 
}: ECGAnalysisPageProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [analysis, setAnalysis] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentIndex = filteredRecords.findIndex(r => r.id === record.id);
  const totalECGs = filteredRecords.length;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleNextECG = () => {
    if (currentIndex < totalECGs - 1) {
      const nextRecord = filteredRecords[currentIndex + 1];
      onChangeRecord(nextRecord);
      setIsValidated(false);
      setAnalysis('');
      setZoomLevel(1);
    }
  };

  const handlePreviousECG = () => {
    if (currentIndex > 0) {
      const previousRecord = filteredRecords[currentIndex - 1];
      onChangeRecord(previousRecord);
      setIsValidated(false);
      setAnalysis('');
      setZoomLevel(1);
    }
  };

  const handleValidate = () => {
    setIsValidated(true);
  };

  return (
    <div className="min-h-screen bg-background text-sm">
      <div className="sticky top-0 z-50 bg-white">
        <header className="border-b h-10 flex items-center px-4">
          <div className="flex items-center gap-4">
            <button 
              className="flex items-center gap-2 hover:text-blue-600"
              onClick={onClose}
            >
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">Xpress-ECG</span>
            </button>
            <span className="text-gray-500">
              {record.medicalCenter} - {record.patientName}
            </span>
          </div>

          <div className="flex-1 flex justify-center items-center">
            <div className="flex items-center gap-2">
              <button
                className={`p-1 rounded hover:bg-gray-100 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handlePreviousECG}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-5 w-5 text-black" />
              </button>
              <span className="text-sm font-medium">
                {currentIndex + 1} / {totalECGs}
              </span>
              <button
                className={`p-1 rounded hover:bg-gray-100 ${currentIndex === totalECGs - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleNextECG}
                disabled={currentIndex === totalECGs - 1}
              >
                <ChevronRight className="h-5 w-5 text-black" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <UserPlus className="h-3 w-3 mr-2" />
                  Second Avis
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Demander un second avis</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Note pour l'expert..."
                    className="min-h-[100px]"
                  />
                  <Button className="w-full">Envoyer la demande</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Eye className="h-3 w-3 mr-2" />
                  Aperçu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Aperçu du rapport</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border rounded-lg">
                    <ECGReportPreview
                      record={record}
                      measurements={{
                        heartRate: 72,
                        prInterval: 160,
                        qrsDuration: 84,
                        qtInterval: 373,
                      }}
                      analysis={analysis}
                      doctor={{
                        name: "Dr. Jean Martin",
                        title: "Cardiologue",
                        signature: "/signatures/doctor-signature.png"
                      }}
                    />
                  </div>
                  <Button className="w-full">
                    <Printer className="h-3 w-3 mr-2" />
                    Imprimer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant={isValidated ? "outline" : "default"}
              size="sm" 
              className={`h-8 ${isValidated ? 'text-green-600 hover:text-green-600' : ''}`}
              onClick={handleValidate}
              disabled={isValidated}
            >
              {isValidated ? (
                <>
                  <Check className="h-3 w-3 mr-2" />
                  Validé
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-2" />
                  Valider & Envoyer
                </>
              )}
            </Button>
          </div>
        </header>
      </div>

      <div className="container mx-auto px-4 py-2 flex flex-col h-[calc(100vh-2.5rem)] max-w-[1400px]">
        <div className="flex-1 relative bg-white rounded-lg shadow-sm mb-2">
          <div className="h-[calc(100%-40px)] overflow-auto p-4">
            <div className="max-w-[800px] mx-auto relative">
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-1 flex gap-1 z-10">
                <button className="p-1 hover:bg-white/50 rounded" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button className="p-1 hover:bg-white/50 rounded" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button className="p-1 hover:bg-white/50 rounded">
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>

              <Image
                ref={imageRef}
                src={IMAGES.ECG.DEFAULT}
                fallbackSrc={IMAGES.ECG.FALLBACK}
                alt="ECG"
                className="w-full object-contain transition-transform"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-xs">Information Patient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <Label>Nom:</Label>
                <span>{record.patientName}</span>
                <Label>ID:</Label>
                <span>{record.id}</span>
                <Label>Date:</Label>
                <span>{record.date}</span>
                <Label>Centre:</Label>
                <span>{record.medicalCenter}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-xs">Mesures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <Label>Fréquence cardiaque:</Label>
                <Input size={4} className="h-6" />
                <Label>Durée PR:</Label>
                <Input size={4} className="h-6" />
                <Label>Durée QRS:</Label>
                <Input size={4} className="h-6" />
                <Label>QT/QTc:</Label>
                <Input size={4} className="h-6" />
                <Label>Axes ondes P:</Label>
                <Input size={4} className="h-6" />
                <Label>Axes ondes R:</Label>
                <Input size={4} className="h-6" />
                <Label>Axes ondes T:</Label>
                <Input size={4} className="h-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-xs">Analyse</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="min-h-[120px] text-xs"
                placeholder="Entrez votre analyse ici..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}