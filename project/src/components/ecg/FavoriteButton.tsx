import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavoriteStore } from '@/stores/useFavoriteStore';
import { useEffect } from 'react';

interface FavoriteButtonProps {
  ecgId: string;
}

export function FavoriteButton({ ecgId }: FavoriteButtonProps) {
  const { favorites, fetchFavorites, toggleFavorite, isFavorite } = useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleClick = async () => {
    await toggleFavorite(ecgId);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 ${isFavorite(ecgId) ? 'text-yellow-500' : 'text-gray-400'}`}
      onClick={handleClick}
    >
      <Star className="h-5 w-5 fill-current" />
    </Button>
  );
}