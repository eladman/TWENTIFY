import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase, isSupabaseConfigured } from './supabase';
import { useUserStore } from '@/stores/useUserStore';
import { ensureUserRecord, resetUserEnsured } from './sync';
import { analytics } from './analytics';
import type { User } from '@supabase/supabase-js';

function updateStoreFromUser(user: User) {
  useUserStore.getState().setAuth(user.id, user.email ?? null);
}

export async function signInWithApple(): Promise<User | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const redirectUri = makeRedirectUri({ scheme: 'twentify', path: 'auth/callback' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      skipBrowserRedirect: true,
      redirectTo: redirectUri,
    },
  });

  if (error || !data.url) throw error ?? new Error('No OAuth URL returned');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

  if (result.type !== 'success') return null;

  const url = new URL(result.url);
  // Tokens may be in hash fragment or query params
  const params = new URLSearchParams(
    url.hash ? url.hash.substring(1) : url.search.substring(1),
  );
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    throw new Error('Missing tokens in OAuth redirect');
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) throw sessionError;

  const user = sessionData.session?.user;
  if (user) {
    updateStoreFromUser(user);
    analytics.track('auth_sign_in', { method: 'apple' });
    analytics.identify(user.id, { email: user.email });
    await ensureUserRecord();
  }
  return user ?? null;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User | null> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Cloud sync is not configured');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const user = data.session?.user;
  if (user) {
    updateStoreFromUser(user);
    analytics.track('auth_sign_in', { method: 'email' });
    analytics.identify(user.id, { email });
    await ensureUserRecord();
  }
  return user ?? null;
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<User | null> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Cloud sync is not configured');
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // When email confirmation is enabled (Supabase default), session is null
  // until the user clicks the confirmation link in their email.
  const session = data.session;
  const user = data.user;

  if (!session && user) {
    // User created in auth.users but needs email confirmation
    throw new Error('Check your email for a confirmation link, then sign in.');
  }

  if (user && session) {
    updateStoreFromUser(user);
    analytics.track('auth_sign_up', { method: 'email' });
    analytics.identify(user.id, { email });
    await ensureUserRecord();
  }
  return user ?? null;
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  analytics.track('auth_sign_out');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  analytics.reset();
  resetUserEnsured();
  useUserStore.getState().clearAuth();
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;

  return data.user ?? null;
}
