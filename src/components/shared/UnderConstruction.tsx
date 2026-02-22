import { Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface UnderConstructionProps {
  title: string;
  description?: string;
  expectedDate?: string;
}

export function UnderConstruction({
  title,
  description = 'Cette fonctionnalité est en cours de développement.',
  expectedDate,
}: UnderConstructionProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] text-center p-8">
      <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Construction className="w-10 h-10 text-indigo-400" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 max-w-sm leading-relaxed mb-2">{description}</p>

      {expectedDate && (
        <p className="text-sm text-indigo-500 font-medium mb-6">
          Disponible à partir du {expectedDate}
        </p>
      )}

      <div className="flex items-center gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
    </div>
  );
}
