import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

import type { Database } from '@/types/database';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL as string | undefined;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY as string | undefined;

/**
 * Returns true when both SUPABASE_URL and SUPABASE_ANON_KEY are set.
 * Guard every supabase.* call with this check.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Typed Supabase client — null when env vars are missing.
 * The app works 100% offline via Zustand + MMKV without Supabase.
 */
export const supabase: SupabaseClient<Database> | null =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
