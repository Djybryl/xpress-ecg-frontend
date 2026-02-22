import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { ECGRecord } from '@/types/ecg';

interface ChatDialogProps {
  record: ECGRecord;
}

export function ChatDialog({ record }: ChatDialogProps) {
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm font-medium">Discussion avec {record.referring_doctor?.full_name}</p>
        <p className="text-xs text-gray-500">Patient: {record.patient_name}</p>
      </div>
      
      <div className="h-[300px] border rounded-lg p-4 bg-white overflow-y-auto">
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="bg-blue-100 rounded-lg p-2 max-w-[80%]">
              <p className="text-sm">Bonjour, j'ai quelques questions concernant l'ECG de {record.patient_name}.</p>
              <span className="text-xs text-gray-500">10:30</span>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
              <p className="text-sm">Bien sûr, je vous écoute.</p>
              <span className="text-xs text-gray-500">10:31</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Votre message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button>Envoyer</Button>
      </div>
    </div>
  );
}