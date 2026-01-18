import { useState } from 'react';
import { StickyNote, Send, Clock, User } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useECGStore } from '@/stores/ecgStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  ecgId: string;
  ecgReference: string;
}

export function NotesModal({ isOpen, onClose, ecgId, ecgReference }: NotesModalProps) {
  const { records, addNote } = useECGStore();
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const ecg = records.find(r => r.id === ecgId);
  const notes = ecg?.notes || [];

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addNote(ecgId, {
      content: newNote.trim(),
      createdBy: 'current-user',
      createdByName: 'Dr. Sophie Bernard', // Would come from auth context
    });
    
    setNewNote('');
    setIsSaving(false);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notes internes"
      description={`ECG ${ecgReference}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Notes list */}
        <div className="max-h-[300px] overflow-y-auto space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <StickyNote className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="font-medium">Aucune note</p>
              <p className="text-sm mt-1">Ajoutez une note interne pour cet ECG</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3"
              >
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {note.createdByName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(note.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New note input */}
        <div className="border-t dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ajouter une note
          </label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Écrivez votre note ici... (visible uniquement par l'équipe)"
            className="w-full h-24 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            💡 Ces notes sont internes et ne seront pas incluses dans le rapport envoyé.
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button
          onClick={handleAddNote}
          disabled={!newNote.trim() || isSaving}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Ajouter la note
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
