import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  MessageSquare,
  AlertCircle,
  Activity,
  Clock,
  User,
  FileText,
  Heart,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Send,
  X
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useReportStore, type ECGReport } from '@/stores/useReportStore';
import { cn } from '@/lib/utils';
import { IMAGES } from '@/lib/constants';

export function ReportViewPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getReport, markAsRead } = useReportStore();
  
  const [report, setReport] = useState<ECGReport | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    if (reportId) {
      const foundReport = getReport(reportId);
      if (foundReport) {
        setReport(foundReport);
        markAsRead(reportId);
      }
    }
  }, [reportId, getReport, markAsRead]);

  if (!report) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Rapport non trouvé</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/medecin/reports')}>
          Retour aux rapports
        </Button>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    toast({
      title: "Téléchargement en cours",
      description: "Le rapport PDF est en cours de génération..."
    });
    // TODO: Implémenter le vrai téléchargement PDF
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    toast({
      title: "Email envoyé",
      description: "Le rapport a été envoyé par email."
    });
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) return;
    
    setIsSendingMessage(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Message envoyé",
      description: `Votre message a été transmis à ${report.cardiologist}.`
    });
    
    setIsSendingMessage(false);
    setShowContactDialog(false);
    setContactMessage('');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre d'outils sticky */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/medecin/reports')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <p className="font-semibold">{report.patientName}</p>
                <p className="text-sm text-gray-500">{report.ecgId}</p>
              </div>
              {report.isUrgent && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  URGENT
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowContactDialog(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contacter le cardiologue
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerte urgente */}
      {report.isUrgent && (
        <div className="bg-red-600 text-white py-3 print:hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">
                RAPPORT URGENT - Action requise
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* En-tête du rapport */}
        <Card className={cn(
          report.isUrgent && 'border-red-300 border-2'
        )}>
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Rapport d'interprétation ECG</CardTitle>
                  <p className="text-gray-500">{report.ecgId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-indigo-600">{report.cardiologist}</p>
                <p className="text-sm text-gray-500">Cardiologue interprétant</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Patient</span>
                </div>
                <p className="font-semibold">{report.patientName}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">ID Patient</span>
                </div>
                <p className="font-semibold">{report.patientId}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Date ECG</span>
                </div>
                <p className="font-semibold">{formatDate(report.dateEcg)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Date réception</span>
                </div>
                <p className="font-semibold">{formatDate(report.dateReceived)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card className={cn(
          'border-2',
          report.isUrgent ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              'flex items-center gap-2',
              report.isUrgent ? 'text-red-800' : 'text-green-800'
            )}>
              {report.isUrgent ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <Heart className="h-5 w-5" />
              )}
              Conclusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              'text-lg font-medium',
              report.isUrgent ? 'text-red-900' : 'text-green-900'
            )}>
              {report.conclusion}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mesures */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                Mesures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Fréquence cardiaque</span>
                  <span className="font-semibold">{report.measurements.heartRate} bpm</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Intervalle PR</span>
                  <span className="font-semibold">
                    {report.measurements.prInterval > 0 ? `${report.measurements.prInterval} ms` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Durée QRS</span>
                  <span className="font-semibold">{report.measurements.qrsDuration} ms</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Intervalle QT</span>
                  <span className="font-semibold">{report.measurements.qtInterval} ms</span>
                </div>
                {report.measurements.qrsAxis && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Axe QRS</span>
                    <span className="font-semibold">{report.measurements.qrsAxis}°</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interprétation */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Interprétation détaillée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line text-gray-700">
                  {report.interpretation}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image ECG */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                Tracé ECG
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500 w-16 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoomLevel(z => Math.min(2, z + 0.25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoomLevel(1)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-gray-100 overflow-auto">
            <div className="max-h-[500px] overflow-auto">
              <img
                src={IMAGES.ECG.DEFAULT}
                alt="Tracé ECG"
                className="w-full transition-transform origin-top-left"
                style={{ transform: `scale(${zoomLevel})` }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = IMAGES.ECG.FALLBACK;
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Signature */}
        <Card className="print:break-inside-avoid">
          <CardContent className="py-6">
            <div className="flex justify-between items-end">
              <div className="text-sm text-gray-500">
                <p>Rapport généré par Xpress-ECG</p>
                <p>Date d'interprétation : {formatDate(report.dateReceived)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-indigo-600">{report.cardiologist}</p>
                <p className="text-sm text-gray-500">Cardiologue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de contact */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contacter {report.cardiologist}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Concernant le rapport <strong>{report.ecgId}</strong> pour <strong>{report.patientName}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Votre message</label>
              <Textarea
                placeholder="Posez votre question ou demandez des précisions..."
                className="min-h-[150px]"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={!contactMessage.trim() || isSendingMessage}
            >
              {isSendingMessage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
