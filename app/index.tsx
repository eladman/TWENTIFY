import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/useUserStore';

export default function Index() {
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);

  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Redirect href="/(onboarding)/domains" />;
}
