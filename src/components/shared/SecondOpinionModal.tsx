import { useState } from 'react';
import { Send, AlertTriangle, User } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SecondOpinionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ecgId: string;
  ecgReference: string;
  patientName: string;
}

// Mock list of experts
const experts = [
  { id: 'e1', name: 'Dr. Jean-Pierre Fontaine', specialty: 'Rythmologie', hospital: 'Hôpital Lariboisière' },
  { id: 'e2', name: 'Dr. Marie-Claude Dupré', specialty: 'Cardiologie interventionnelle', hospital: 'Pitié-Salpêtrière' },
  { id: 'e3', name: 'Dr. Philippe Garnier', specialty: 'Insuffisance cardiaque', hospital: 'Hôpital Bichat' },
  { id: 'e4', name: 'Dr. Isabelle Moreau', specialty: 'Imagerie cardiaque', hospital: 'Cochin' },
];

export function SecondOpinionModal({ isOpen, onClose, ecgId, ecgReference, patientName }: SecondOpinionModalProps) {
  const [selectedExpert, setSelectedExpert] = useState<string>('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!selectedExpert || !message.trim()) return;

    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Would update ECG record with second opinion request
    console.log('Second opinion requested:', {
      ecgId,
      expertId: selectedExpert,
      urgency,
      message,
    });
    
    setIsSending(false);
    onClose();
  };

  const selectedExpertData = experts.find(e => e.id === selectedExpert);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Demander un second avis"
      description={`ECG ${ecgReference} - ${patientName}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Urgency selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Niveau d'urgence
          </Label>
          <div className="flex gap-3">
            <button
              onClick={() => setUrgency('normal')}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                urgency === 'normal'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-white">Normal</p>
              <p className="text-xs text-gray-500 mt-1">Réponse sous 24-48h</p>
            </button>
            <button
              onClick={() => setUrgency('urgent')}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                urgency === 'urgent'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <p className="font-medium text-gray-900 dark:text-white">Urgent</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Réponse prioritaire</p>
            </button>
          </div>
        </div>

        {/* Expert selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Sélectionner un expert
          </Label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {experts.map((expert) => (
              <button
                key={expert.id}
                onClick={() => setSelectedExpert(expert.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedExpert === expert.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{expert.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {expert.specialty} • {expert.hospital}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Message pour l'expert
          </Label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez le contexte clinique et les questions spécifiques pour lesquelles vous souhaitez un avis..."
            className="w-full h-32 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Summary */}
        {selectedExpertData && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              L'ECG sera envoyé à <span className="font-semibold text-gray-900 dark:text-white">{selectedExpertData.name}</span> pour avis.
              Vous recevrez une notification dès que l'expert aura répondu.
            </p>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button
          onClick={handleSend}
          disabled={!selectedExpert || !message.trim() || isSending}
          className={urgency === 'urgent' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Envoi...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Envoyer la demande
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
