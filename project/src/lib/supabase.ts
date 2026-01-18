import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Note: L'app fonctionne en mode démo si les variables ne sont pas configurées
// Les appels API échoueront silencieusement jusqu'à la connexion du backend
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];