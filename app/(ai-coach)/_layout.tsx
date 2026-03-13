import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function AiCoachLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    />
  );
}
