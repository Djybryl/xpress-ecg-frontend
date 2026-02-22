import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/supabase';

export type ECGRecord = Tables['ecg_records']['Row'] & {
  files?: Tables['ecg_files']['Row'][];
  referring_doctor?: Tables['users']['Row'];
  second_opinions?: Tables['second_opinions']['Row'][];
};

export function useECGRecords(hospitalId?: string) {
  const [records, setRecords] = useState<ECGRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!hospitalId) return;

    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('ecg_records')
          .select(`
            *,
            files:ecg_files(*),
            referring_doctor:users!referring_doctor_id(
              full_name
            ),
            second_opinions(*)
          `)
          .eq('hospital_id', hospitalId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecords(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch ECG records'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();

    // Subscribe to changes
    const subscription = supabase
      .channel('ecg_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ecg_records',
          filter: `hospital_id=eq.${hospitalId}`
        },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [hospitalId]);

  return { records, loading, error };
}