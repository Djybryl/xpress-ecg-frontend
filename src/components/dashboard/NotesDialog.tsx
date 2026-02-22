import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';
import { useState } from 'react';
import type { ECGRecord } from '@/types/ecg';

interface NotesDialogProps {
  record: ECGRecord;
  onSave: (notes: string) => void;
}

export function NotesDialog({ record, onSave }: NotesDialogProps) {
  const [notes, setNotes] = useState(record.notes || '');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Notes essentielles pour l'ECG de {record.patient_name}</Label>
        <Textarea
          placeholder="Entrez vos notes ici..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[150px]"
        />
      </div>
      <Button onClick={() => onSave(notes)} className="w-full">
        <StickyNote className="h-4 w-4 mr-2" />
        Enregistrer les notes
      </Button>
    </div>
  );
}