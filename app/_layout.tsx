import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { setupNotificationHandler, rescheduleReminders } from '@/services/notifications';
import { useUserStore } from '@/stores/useUserStore';
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

  // Notification setup on mount
  useEffect(() => {
    setupNotificationHandler();
    const { onboardingCompleted, settings } = useUserStore.getState();
    if (onboardingCompleted && settings.notifications) {
      rescheduleReminders();
    }
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
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="workout/[id]"
          options={{ presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen
          name="workout/summary"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="run/active"
          options={{ presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen
          name="run/summary"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="exercise/[id]"
          options={{ presentation: 'transparentModal' }}
        />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal' }}
        />
      </Stack>
      <ToastRoot />
    </>
  );
}
