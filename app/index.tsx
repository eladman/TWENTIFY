import { Redirect } from 'expo-router';
import { useUserStore, useUserStoreHydrated } from '@/stores/useUserStore';

export default function Index() {
  const hydrated = useUserStoreHydrated();
  const authUserId = useUserStore((s) => s.authUserId);
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);

  if (!hydrated) {
    return null; // Wait for persisted state to load before routing
  }

  if (!authUserId) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Redirect href="/(onboarding)/domains" />;
}
