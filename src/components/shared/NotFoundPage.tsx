import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-12 h-12 text-indigo-300" />
        </div>

        <p className="text-7xl font-extrabold text-gray-200 mb-2 tracking-tight">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h1>
        <p className="text-gray-500 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Button onClick={() => navigate('/')}>
            Tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}
