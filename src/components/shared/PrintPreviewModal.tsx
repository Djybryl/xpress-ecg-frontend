import { useState } from 'react';
import { Printer, Download, Mail, FileText, Check } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ecgData: {
    referenceNumber: string;
    patientName: string;
    patientAge: number;
    patientGender: 'M' | 'F';
    medicalCenter: string;
    referringDoctor: string;
    acquisitionDate: string;
    interpretation?: string;
    measurements?: {
      heartRate: number | null;
      prInterval: number | null;
      qrsDuration: number | null;
      qtInterval: number | null;
      qtcInterval: number | null;
    };
    validatedBy?: string;
    validatedAt?: string;
  };
}

export function PrintPreviewModal({ isOpen, onClose, ecgData }: PrintPreviewModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.print();
    setIsPrinting(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Would generate and download PDF here
    console.log('Downloading PDF...');
    setIsDownloading(false);
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSendSuccess(true);
    setIsSending(false);
    
    setTimeout(() => {
      setSendSuccess(false);
    }, 3000);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aperçu du rapport"
      size="xl"
    >
      <div className="space-y-4">
        {/* Actions bar */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Imprimer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Télécharger PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEmail}
            disabled={isSending || sendSuccess}
            className={sendSuccess ? 'bg-green-50 text-green-700 border-green-200' : ''}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
            ) : sendSuccess ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {sendSuccess ? 'Envoyé !' : 'Envoyer par email'}
          </Button>
        </div>

        {/* Report Preview */}
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Rapport d'interprétation ECG</h2>
                  <p className="text-indigo-100 text-sm">{ecgData.referenceNumber}</p>
                </div>
              </div>
              <div className="text-right text-sm text-indigo-100">
                <p>Xpress-ECG</p>
                <p>Plateforme de télé-interprétation</p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Informations Patient
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nom du patient</p>
                <p className="font-semibold text-gray-900 dark:text-white">{ecgData.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Âge / Sexe</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {ecgData.patientAge} ans / {ecgData.patientGender === 'M' ? 'Masculin' : 'Féminin'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Centre médical</p>
                <p className="font-semibold text-gray-900 dark:text-white">{ecgData.medicalCenter}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Médecin prescripteur</p>
                <p className="font-semibold text-gray-900 dark:text-white">{ecgData.referringDoctor}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Date d'acquisition</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(ecgData.acquisitionDate)}</p>
              </div>
            </div>
          </div>

          {/* Measurements */}
          {ecgData.measurements && (
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Mesures
              </h3>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">{ecgData.measurements.heartRate || '—'}</p>
                  <p className="text-xs text-gray-500">FC (bpm)</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{ecgData.measurements.prInterval || '—'}</p>
                  <p className="text-xs text-gray-500">PR (ms)</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{ecgData.measurements.qrsDuration || '—'}</p>
                  <p className="text-xs text-gray-500">QRS (ms)</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{ecgData.measurements.qtInterval || '—'}</p>
                  <p className="text-xs text-gray-500">QT (ms)</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{ecgData.measurements.qtcInterval || '—'}</p>
                  <p className="text-xs text-gray-500">QTc (ms)</p>
                </div>
              </div>
            </div>
          )}

          {/* Interpretation */}
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Interprétation
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {ecgData.interpretation || 'Aucune interprétation disponible.'}
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Validé par</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {ecgData.validatedBy || 'Dr. Sophie Bernard'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cardiologue - N° RPPS: 10101010101
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Date de validation</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {ecgData.validatedAt ? formatDate(ecgData.validatedAt) : format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  );
}

