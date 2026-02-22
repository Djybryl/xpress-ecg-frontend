import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import type { UserRole } from '@/config/roles';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  hospitalName?: string;
  hospitalAddress?: string;
}

export async function signUp({
  email,
  password,
  fullName,
  role,
  hospitalName,
  hospitalAddress
}: SignUpData) {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from sign up');

    // 2. Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role
      });

    if (profileError) throw profileError;

    // 3. If medecin, create hospital and link user
    if (role === 'medecin' && hospitalName) {
      // Create hospital
      const { data: hospitalData, error: hospitalError } = await supabase
        .from('hospitals')
        .insert({
          name: hospitalName,
          address: hospitalAddress
        })
        .select()
        .single();

      if (hospitalError) throw hospitalError;

      // Link user to hospital
      const { error: linkError } = await supabase
        .from('hospital_users')
        .insert({
          user_id: authData.user.id,
          hospital_id: hospitalData.id
        });

      if (linkError) throw linkError;
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        hospital_users (
          hospital:hospitals (
            id,
            name,
            address
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (error) {
    return { profile: null, error };
  }
}