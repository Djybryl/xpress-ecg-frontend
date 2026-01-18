import { Button } from '@/components/ui/button';

interface SecondOpinionsDialogProps {
  pendingSecondOpinions: Array<{
    id: number;
    ecgId: string;
    doctor: string;
    date: string;
  }>;
  onExamine: (ecgId: string) => void;
}

export function SecondOpinionsDialog({ pendingSecondOpinions, onExamine }: SecondOpinionsDialogProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Liste des demandes</h3>
        <div className="space-y-2">
          {pendingSecondOpinions.map((opinion) => (
            <div key={opinion.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{opinion.ecgId}</p>
                <p className="text-sm text-gray-500">{opinion.doctor} - {opinion.date}</p>
              </div>
              <Button size="sm" onClick={() => onExamine(opinion.ecgId)}>
                Examiner
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}