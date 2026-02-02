import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

type Tag = Tables['ecg_tags']['Row'];

interface TagStore {
  tags: Tag[];
  isLoading: boolean;
  error: Error | null;
  fetchTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addTagToECG: (ecgId: string, tagId: string) => Promise<void>;
  removeTagFromECG: (ecgId: string, tagId: string) => Promise<void>;
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('ecg_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      set({ tags: data, error: null });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  createTag: async (name: string, color: string) => {
    try {
      const { error } = await supabase
        .from('ecg_tags')
        .insert({ name, color });

      if (error) throw error;
      get().fetchTags();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  deleteTag: async (id: string) => {
    try {
      const { error } = await supabase
        .from('ecg_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      get().fetchTags();
    } catch (error) {
      set({ error: error as Error });
    }
  },

  addTagToECG: async (ecgId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('ecg_tag_relations')
        .insert({ ecg_record_id: ecgId, tag_id: tagId });

      if (error) throw error;
    } catch (error) {
      set({ error: error as Error });
    }
  },

  removeTagFromECG: async (ecgId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('ecg_tag_relations')
        .delete()
        .match({ ecg_record_id: ecgId, tag_id: tagId });

      if (error) throw error;
    } catch (error) {
      set({ error: error as Error });
    }
  }
}));