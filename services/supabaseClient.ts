/**
 * Supabase Client Configuration
 * This module initializes and exports the Supabase client for database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { loadFromLocalStorage } from '../utils/storage';

const getSupabaseConfig = (): { url: string; key: string } => {
  // First, try to get from localStorage (user settings)
  const savedUrl = loadFromLocalStorage<string | null>('ppcGeniusApiSettings.supabaseUrl', null);
  const savedKey = loadFromLocalStorage<string | null>('ppcGeniusApiSettings.supabaseAnonKey', null);
  
  if (savedUrl && savedKey) {
    return { url: savedUrl, key: savedKey };
  }
  
  // Fall back to environment variables
  return {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  };
};

let supabaseInstance: SupabaseClient<Database> | null = null;

const initializeSupabase = () => {
  const { url, key } = getSupabaseConfig();
  
  if (!url || !key) {
    console.warn('Supabase environment variables are not set. Database features will be disabled.');
    return;
  }
  
  supabaseInstance = createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

// Initialize on module load
initializeSupabase();

// Export the client getter
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get: (_target, prop: keyof SupabaseClient<Database>) => {
    if (!supabaseInstance) {
      initializeSupabase();
    }
    return supabaseInstance ? supabaseInstance[prop] : undefined;
  }
});

// Export function to reinitialize when settings change
export const reinitializeSupabaseClient = () => {
  initializeSupabase();
};

// Export database-related types for convenience
export type { Database } from './database.types';

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return !!(url && key);
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
  return user;
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string, displayName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });
  if (error) throw error;
  return data;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Reset password for a user
 */
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return data;
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
};
