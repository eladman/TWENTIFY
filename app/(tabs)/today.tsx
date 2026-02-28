import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { screenPadding } from '@/theme/spacing';
import { usePlanStore } from '@/stores/usePlanStore';

function getTodayPlan() {
  const { weeklySchedule } = usePlanStore.getState();
  if (weeklySchedule.length === 0) return null;

  const jsDay = new Date().getDay(); // Sun=0 .. Sat=6
  const dayPlanIndex = (jsDay + 6) % 7; // Mon=0 .. Sun=6
  return weeklySchedule.find((d) => d.dayOfWeek === dayPlanIndex) ?? null;
}

export default function TodayScreen() {
  const weeklySchedule = usePlanStore((s) => s.weeklySchedule);
  const todayPlan = weeklySchedule.length > 0 ? getTodayPlan() : null;

  let subtitle: string;
  if (!todayPlan) {
    subtitle = 'No plan yet';
  } else if (todayPlan.activity === 'rest') {
    subtitle = 'Today: Rest Day';
  } else {
    subtitle = `Today: ${todayPlan.label} (${todayPlan.estimatedDurationMin} min)`;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text variant="heading.xl">Today's 20%</Text>
        <Text variant="body.md" color={colors.textSecondary} style={styles.subtitle}>
          {subtitle}
        </Text>
        <Text variant="body.sm" color={colors.textSecondary} style={styles.phase}>
          Full workout experience coming in Phase 3
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: screenPadding.top,
  },
  subtitle: {
    marginTop: 8,
  },
  phase: {
    marginTop: 16,
  },
});
