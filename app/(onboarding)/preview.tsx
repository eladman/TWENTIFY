import { useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { haptics } from '@/utils/haptics';
import { useUserStore } from '@/stores/useUserStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { requestNotificationPermission, rescheduleReminders } from '@/services/notifications';
import { generatePlan, type GeneratedPlan } from '@/services/planGenerator';
import type { PlanInput, DayPlan } from '@/types/plan';

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ANIM_DURATION = 500;
const ANIM_EASING = Easing.out(Easing.ease);

// ── Step Indicator ──────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={stepStyles.container}>
      <Text variant="overline" style={{ color: colors.textSecondary }}>
        STEP {current} OF {total}
      </Text>
      <View style={stepStyles.dots}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              stepStyles.dot,
              {
                backgroundColor:
                  i < current ? colors.accent : 'transparent',
                borderColor:
                  i < current ? colors.accent : colors.cardBorder,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});

// ── Weekly Schedule Card ────────────────────────────────────────────────

function getShortLabel(day: DayPlan): string {
  if (day.activity === 'rest' || day.activity === 'nutrition_only') return 'Rest';
  const label = day.label;
  if (label.includes('Full Body')) return label.replace('Full Body ', 'Full ');
  if (label.includes('Lower Body')) return label.replace('Lower Body ', 'Lower ');
  if (label.includes('Upper Body')) return label.replace('Upper Body ', 'Upper ');
  if (label.includes(' Run')) return label.replace(' Run', '');
  return label;
}

function WeeklyScheduleCard({ schedule }: { schedule: DayPlan[] }) {
  return (
    <Card variant="workout">
      <View style={scheduleStyles.row}>
        {schedule.map((day) => {
          const isGym = day.activity === 'gym';
          const isRun = day.activity === 'run';
          const isRest = day.activity === 'rest' || day.activity === 'nutrition_only';

          const iconColor = isGym
            ? colors.accent
            : isRun
              ? colors.success
              : colors.textMuted;

          const durationText =
            day.estimatedDurationMin > 0
              ? `${day.estimatedDurationMin}min`
              : '\u2013';

          return (
            <View key={day.dayOfWeek} style={scheduleStyles.column}>
              <Text variant="caption" color={colors.textSecondary}>
                {DAY_ABBR[day.dayOfWeek]}
              </Text>
              <Text style={[scheduleStyles.icon, { color: iconColor }]}>
                {isGym ? '\u{1F3CB}\uFE0F' : isRun ? '\u{1F3C3}' : '\u2013'}
              </Text>
              <Text
                variant="caption"
                color={isRest ? colors.textMuted : colors.textPrimary}
                style={scheduleStyles.label}
                numberOfLines={1}
              >
                {getShortLabel(day)}
              </Text>
              <Text
                variant="data.sm"
                color={isRest ? colors.textMuted : colors.textSecondary}
              >
                {durationText}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const scheduleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  icon: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  label: {
    textAlign: 'center',
  },
});

// ── Nutrition Card ──────────────────────────────────────────────────────

function NutritionRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={nutritionStyles.row}>
      <Text variant="caption" color={colors.textSecondary} style={nutritionStyles.rowLabel}>
        {label}
      </Text>
      <Text variant="body.sm" style={nutritionStyles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

function NutritionCard({
  nutritionPlan,
}: {
  nutritionPlan: GeneratedPlan['nutritionPlan'];
}) {
  if (!nutritionPlan) return null;

  const topRule = nutritionPlan.rules.length > 0
    ? nutritionPlan.rules[0].rule
    : null;

  return (
    <Card variant="info">
      <Text variant="heading.sm">Daily Nutrition Targets</Text>
      <View style={nutritionStyles.rows}>
        {nutritionPlan.hasFullStats && nutritionPlan.calorieTarget > 0 && (
          <NutritionRow
            label="Calories"
            value={`${nutritionPlan.calorieTarget.toLocaleString()} kcal`}
          />
        )}
        <NutritionRow
          label="Protein"
          value={
            nutritionPlan.hasFullStats && nutritionPlan.proteinTargetG > 0
              ? `${nutritionPlan.proteinTargetG}g (${nutritionPlan.proteinPortions} palm portions)`
              : `${nutritionPlan.proteinPortions} palm portions`
          }
        />
        {topRule && (
          <NutritionRow label="Top Rule" value={topRule} />
        )}
      </View>
    </Card>
  );
}

const nutritionStyles = StyleSheet.create({
  rows: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  rowLabel: {
    width: 70,
    flexShrink: 0,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
  },
});

// ── Preview Screen ──────────────────────────────────────────────────────

export default function PreviewScreen() {
  const router = useRouter();

  // Store selectors
  const domains = useUserStore((s) => s.domains);
  const goal = useUserStore((s) => s.goal);
  const fitnessLevel = useUserStore((s) => s.fitnessLevel);
  const profile = useUserStore((s) => s.profile);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const setPlan = usePlanStore((s) => s.setPlan);

  // Generate plan once
  const plan = useMemo<GeneratedPlan>(() => {
    const input: PlanInput = {
      domains,
      goal: goal!,
      fitnessLevel: fitnessLevel!,
      gymDaysPerWeek: profile?.gymDaysPerWeek,
      trainingDaysPerWeek: profile?.trainingDaysPerWeek,
      equipmentAccess: profile?.equipmentAccess,
      runningLevel: profile?.runningLevel,
      hasHrMonitor: profile?.hasHrMonitor,
      age: profile?.age,
      weightKg: profile?.weightKg,
      heightCm: profile?.heightCm,
      sex: profile?.sex,
    };
    return generatePlan(input);
  }, [domains, goal, fitnessLevel, profile]);

  // Entrance animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: ANIM_DURATION, easing: ANIM_EASING });
    translateY.value = withTiming(0, { duration: ANIM_DURATION, easing: ANIM_EASING });
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Handle "Start My Plan"
  const handleStartPlan = async () => {
    haptics.success();
    setPlan({
      weeklySchedule: plan.weeklySchedule,
      gymPlan: plan.gymPlan,
      runPlan: plan.runPlan,
      nutritionPlan: plan.nutritionPlan,
    });
    completeOnboarding();
    const granted = await requestNotificationPermission();
    if (granted) {
      await rescheduleReminders();
    }
    router.replace('/(tabs)/today');
  };

  const hasNutrition = domains.includes('nutrition');

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator current={3} total={3} />

        <Animated.View style={contentAnimatedStyle}>
          <Text variant="heading.xl">Your 20% Plan</Text>
          <Text
            variant="body.md"
            color={colors.textSecondary}
            style={styles.subtitle}
          >
            Here&apos;s what the science says you need. Nothing more.
          </Text>

          <View style={styles.scheduleSection}>
            <WeeklyScheduleCard schedule={plan.weeklySchedule} />
          </View>

          {hasNutrition && plan.nutritionPlan && (
            <View style={styles.nutritionSection}>
              <NutritionCard nutritionPlan={plan.nutritionPlan} />
            </View>
          )}

          {plan.totalCitations > 0 && (
            <Text
              variant="caption"
              color={colors.textMuted}
              align="center"
              style={styles.citations}
            >
              Backed by {plan.totalCitations} peer-reviewed studies. Tap any exercise to see the research.
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.bottom}>
        <Button
          variant="primary"
          label="Start My Plan"
          onPress={handleStartPlan}
          fullWidth
          style={styles.startButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  scheduleSection: {
    marginTop: spacing['2xl'],
  },
  nutritionSection: {
    marginTop: spacing.lg,
  },
  citations: {
    marginTop: spacing.xl,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  startButton: {
    height: 56,
    paddingVertical: 18,
  },
});
