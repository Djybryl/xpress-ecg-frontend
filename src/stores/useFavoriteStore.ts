import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

type Favorite = Tables['ecg_favorites']['Row'];

interface FavoriteStore {
  favorites: Favorite[];
  isLoading: boolean;
  error: Error | null;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (ecgId: string) => Promise<void>;
  isFavorite: (ecgId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('ecg_favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      set({ favorites: data, error: null });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (ecgId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const isFavorited = get().isFavorite(ecgId);

      if (isFavorited) {
        const { error } = await supabase
          .from('ecg_favorites')
          .delete()
          .match({ user_id: user.id, ecg_record_id: ecgId });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ecg_favorites')
          .insert({ user_id: user.id, ecg_record_id: ecgId });

        if (error) throw error;
      }

      get().fetchFavorites();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  isFavorite: (ecgId: string) => {
    return get().favorites.some(f => f.ecg_record_id === ecgId);
  }
}));