import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { setupNotificationHandler, rescheduleReminders } from '@/services/notifications';
import { initAnalytics, analytics } from '@/services/analytics';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/stores/useUserStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useRunStore } from '@/stores/useRunStore';
import { syncAllPending, syncUserProfile, pullFromCloud, ensureUserRecord } from '@/services/sync';
import * as SplashScreen from 'expo-splash-screen';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import { colors } from '@/theme/colors';
import { ToastRoot } from '@/components/ui/Toast';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  // Analytics init (fire-and-forget)
  useEffect(() => {
    initAnalytics();
  }, []);

  // Notification setup on mount
  useEffect(() => {
    setupNotificationHandler();
    const { onboardingCompleted, settings } = useUserStore.getState();
    if (onboardingCompleted && settings.notifications) {
      rescheduleReminders();
    }
  }, []);

  // Reactive auth listener — fires immediately with current session and on all auth events
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user = session.user;
          useUserStore.getState().setAuth(user.id, user.email ?? null);
          analytics.identify(user.id, { email: user.email });
          await ensureUserRecord();

          const workouts = useWorkoutStore.getState().history;
          const runs = useRunStore.getState().history;
          if (workouts.length === 0 && runs.length === 0) {
            void pullFromCloud();
          } else {
            void syncAllPending();
            void syncUserProfile();
          }
        } else {
          useUserStore.getState().clearAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Re-sync pending items whenever the app comes back to the foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncAllPending();
    });
    return () => sub.remove();
  }, []);

  // Navigate to Today when user taps a notification
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.replace('/(tabs)/today');
    });
    return () => subscription.remove();
  }, [router]);

  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="workout/[id]"
          options={{ presentation: 'modal', gestureEnabled: false, animation: 'slide_from_bottom', animationDuration: 350 }}
        />
        <Stack.Screen
          name="workout/summary"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', animationDuration: 350 }}
        />
        <Stack.Screen
          name="run/active"
          options={{ presentation: 'modal', gestureEnabled: false, animation: 'slide_from_bottom', animationDuration: 350 }}
        />
        <Stack.Screen
          name="run/summary"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', animationDuration: 350 }}
        />
        <Stack.Screen
          name="exercise/[id]"
          options={{ presentation: 'transparentModal' }}
        />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', animationDuration: 350 }}
        />
        <Stack.Screen
          name="nutrition/index"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', animationDuration: 350 }}
        />
      </Stack>
      <ToastRoot />
    </>
  );
}
