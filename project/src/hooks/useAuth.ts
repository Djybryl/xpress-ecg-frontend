import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/supabase';

export type UserWithProfile = User & {
  profile?: Tables['users']['Row'];
  hospital?: Tables['hospitals']['Row'];
};

export function useAuth() {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(authUser: User) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select(`
          *,
          hospital_users (
            hospital:hospitals (*)
          )
        `)
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({
          ...authUser,
          profile,
          hospital: profile.hospital_users?.[0]?.hospital
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    loading,
  };
}