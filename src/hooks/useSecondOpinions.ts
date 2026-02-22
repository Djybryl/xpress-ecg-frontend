import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/supabase';

export type SecondOpinion = Tables['second_opinions']['Row'] & {
  ecg_record?: Tables['ecg_records']['Row'] & {
    files?: Tables['ecg_files']['Row'][];
  };
  requesting_doctor?: Pick<Tables['users']['Row'], 'full_name'>;
  consultant?: Pick<Tables['users']['Row'], 'full_name'>;
};

export function useSecondOpinions() {
  const [opinions, setOpinions] = useState<SecondOpinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOpinions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
          .from('second_opinions')
          .select(`
            *,
            ecg_record:ecg_records (
              *,
              files:ecg_files(*)
            ),
            requesting_doctor:users!requesting_doctor_id (
              full_name
            ),
            consultant:users!consultant_id (
              full_name
            )
          `)
          .or(`requesting_doctor_id.eq.${user.id},consultant_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOpinions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch second opinions'));
      } finally {
        setLoading(false);
      }
    };

    fetchOpinions();

    // Subscribe to changes
    const subscription = supabase
      .channel('second_opinions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'second_opinions'
        },
        () => {
          fetchOpinions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { opinions, loading, error };
}