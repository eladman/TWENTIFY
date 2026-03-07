import { useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useUserStore } from '@/stores/useUserStore';
import { exercises } from '@/data/exercises';
import { citations } from '@/data/citations';
import { formatVolume, formatWeight } from '@/utils/formatters';
import { getWeeklyVolumeSets } from '@/utils/weeklyVolume';
import type { SetData, CompletedWorkout } from '@/types/workout';

// ── Helpers ─────────────────────────────────────────────────────────────

function formatSummaryDuration(seconds: number): string {
  if (seconds < 60) return '< 1 min';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m} min`;
  return `${m} min`;
}

function getWorkingWeight(sets: SetData[]): number {
  const completed = sets.filter((s) => s.completed);
  if (completed.length === 0) return 0;
  const counts = new Map<number, number>();
  for (const s of completed) {
    counts.set(s.weightKg, (counts.get(s.weightKg) ?? 0) + 1);
  }
  let mode = 0;
  let maxCount = 0;
  for (const [weight, count] of counts) {
    if (count > maxCount || (count === maxCount && weight > mode)) {
      mode = weight;
      maxCount = count;
    }
  }
  return mode;
}

function getPreviousSessionSets(
  exerciseId: string,
  history: CompletedWorkout[],
): SetData[] | null {
  // Search history[0..length-2] backward (exclude last entry which is the current workout)
  for (let i = history.length - 2; i >= 0; i--) {
    const ex = history[i].exercises.find((e) => e.exerciseId === exerciseId);
    if (ex) return ex.sets;
  }
  return null;
}

// ── Fade-in hook ────────────────────────────────────────────────────────

function useFadeIn(delay: number) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const config = { duration: 350, easing: Easing.out(Easing.ease) };
    opacity.value = withDelay(delay, withTiming(1, config));
    scale.value = withDelay(delay, withTiming(1, config));
  }, [delay, opacity, scale]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
}

// ── StatCell ────────────────────────────────────────────────────────────

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="data.lg" style={styles.statValue}>
        {value}
      </Text>
    </View>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const history = useWorkoutStore((s) => s.history);
  const units = useUserStore((s) => s.settings.units);
  const goal = useUserStore((s) => s.goal);

  const workout = history[history.length - 1];

  const headingAnim = useFadeIn(0);
  const gridAnim = useFadeIn(100);
  const bottomAnim = useFadeIn(500);

  const handleDone = () => {
    router.dismissAll();
  };

  // ── Computed stats (must be before early return for Rules of Hooks) ──

  const duration = useMemo(
    () => workout ? formatSummaryDuration(workout.durationSeconds) : '',
    [workout],
  );

  const exerciseCount = workout?.exercises.length ?? 0;

  const workingSets = useMemo(
    () =>
      workout
        ? workout.exercises.reduce(
            (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
            0,
          )
        : 0,
    [workout],
  );

  const totalVolume = useMemo(() => {
    if (!workout) return '';
    const total = workout.exercises.reduce(
      (sum, ex) =>
        sum +
        ex.sets
          .filter((s) => s.completed)
          .reduce((s, set) => s + set.weightKg * set.reps, 0),
      0,
    );
    return formatVolume(total, units);
  }, [workout, units]);

  // ── Progress items ────────────────────────────────────────────────

  const progressItems = useMemo(() => {
    if (!workout) return [];
    return workout.exercises
      .map((ex) => {
        const currentWeight = getWorkingWeight(ex.sets);
        if (currentWeight === 0) return null;

        const previousSets = getPreviousSessionSets(ex.exerciseId, history);
        if (!previousSets) return null;

        const previousWeight = getWorkingWeight(previousSets);
        if (previousWeight === 0) return null;

        const exerciseData = exercises[ex.exerciseId];
        return {
          name: exerciseData?.name ?? ex.exerciseId,
          currentWeightKg: currentWeight,
          previousWeightKg: previousWeight,
          increased: currentWeight > previousWeight,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [workout, history]);

  const hasIncreases = progressItems.some((p) => p.increased);

  // ── Citation selection ────────────────────────────────────────────

  const citation = useMemo(() => {
    if (!workout) return null;
    if (progressItems.some((p) => p.increased)) {
      return citations['kraemer_2004'];
    }
    const allCompleted = workout.exercises.every((ex) =>
      ex.sets.every((s) => s.completed),
    );
    if (allCompleted) {
      return citations['schoenfeld_2016_frequency'];
    }
    if (workingSets > 15) {
      return citations['schoenfeld_2017_volume'];
    }
    return citations['iversen_2021'];
  }, [progressItems, workout, workingSets]);

  // ── Weekly volume for muscle_build ──────────────────────────────
  const weeklyVolume = useMemo(() => {
    if (goal !== 'muscle_build') return null;
    return getWeeklyVolumeSets(history, exercises);
  }, [goal, history]);

  const VOLUME_TARGET = 16; // sets per major muscle group per week
  const majorMuscles = ['quadriceps', 'glutes', 'chest', 'lats', 'shoulders', 'hamstrings'];

  // Edge case: no workout in history
  if (!workout) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.fallback}>
          <Text variant="heading.lg" align="center">
            No Workout Data
          </Text>
          <Text
            variant="body.md"
            color={colors.textSecondary}
            align="center"
            style={styles.fallbackSub}
          >
            Complete a workout to see your summary.
          </Text>
          <Button variant="primary" label="Done" onPress={handleDone} fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Animated.View style={[styles.headingSection, headingAnim]}>
          <Text variant="heading.lg" align="center">
            Session Complete
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View style={gridAnim}>
          <Card variant="info">
            <View style={styles.gridRow}>
              <StatCell label="Duration" value={duration} />
              <StatCell label="Exercises" value={String(exerciseCount)} />
            </View>
            <View style={styles.gridRow}>
              <StatCell label="Working Sets" value={String(workingSets)} />
              <StatCell label="Total Volume" value={totalVolume} />
            </View>
          </Card>
        </Animated.View>

        {/* Weekly Volume (muscle_build only) */}
        {weeklyVolume && (
          <Animated.View style={[styles.progressSection, gridAnim]}>
            <View style={styles.divider} />
            <Text variant="heading.sm" style={styles.progressHeading}>
              Weekly Volume
            </Text>
            {majorMuscles.map((muscle) => {
              const current = weeklyVolume[muscle] ?? 0;
              const ratio = VOLUME_TARGET > 0 ? current / VOLUME_TARGET : 0;
              const volumeColor =
                ratio >= 0.8 && ratio <= 1.2 ? colors.success : colors.warning;
              return (
                <View key={muscle} style={styles.progressRow}>
                  <Text variant="body.sm">
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1).replace('_', ' ')}:{' '}
                    <Text variant="body.sm" color={volumeColor}>
                      {current}/{VOLUME_TARGET} sets
                    </Text>
                  </Text>
                </View>
              );
            })}
          </Animated.View>
        )}

        {/* Progress section */}
        {hasIncreases && (
          <Animated.View style={[styles.progressSection, gridAnim]}>
            <View style={styles.divider} />
            <Text variant="heading.sm" style={styles.progressHeading}>
              Progress
            </Text>
            {progressItems.map((item, index) => (
              <Animated.View key={item.name} entering={FadeIn.delay(200 + index * 100).duration(250)} style={styles.progressRow}>
                {item.increased ? (
                  <Text variant="body.md">
                    <Text variant="body.md" color={colors.success}>
                      {'\u2191 '}
                    </Text>
                    {item.name}{' '}
                    <Text variant="body.md" color={colors.textSecondary}>
                      {formatWeight(item.previousWeightKg, units)}
                    </Text>
                    {' \u2192 '}
                    {formatWeight(item.currentWeightKg, units)}
                  </Text>
                ) : (
                  <Text variant="body.sm" color={colors.textSecondary}>
                    {item.name} — {formatWeight(item.currentWeightKg, units)}
                  </Text>
                )}
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Citation */}
        {citation && (
          <Animated.View style={[styles.citationSection, bottomAnim]}>
            <Text
              variant="body.md"
              color={colors.textSecondary}
              align="center"
              style={styles.citationText}
            >
              {`\u201C${citation.finding}\u201D`}
            </Text>
            <Text variant="caption" color={colors.textMuted} align="center">
              {citation.authors.split(',')[0]} et al., {citation.year}
            </Text>
          </Animated.View>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Done button */}
      <Animated.View style={[styles.bottom, bottomAnim]}>
        <Button
          variant="primary"
          label="Done →"
          onPress={handleDone}
          fullWidth
        />
      </Animated.View>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing['4xl'],
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  gridRow: {
    flexDirection: 'row',
  },
  statCell: {
    width: '50%',
    paddingVertical: spacing.sm,
  },
  statValue: {
    marginTop: spacing.xs,
  },
  progressSection: {
    marginTop: spacing['2xl'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginBottom: spacing.lg,
  },
  progressHeading: {
    marginBottom: spacing.md,
  },
  progressRow: {
    marginBottom: spacing.xs,
  },
  citationSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
  },
  citationText: {
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  spacer: {
    flex: 1,
    minHeight: spacing['3xl'],
  },
  bottom: {
    paddingHorizontal: screenPadding.horizontal,
    paddingBottom: spacing.xl,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: screenPadding.horizontal,
  },
  fallbackSub: {
    marginTop: spacing.sm,
    marginBottom: spacing['3xl'],
  },
});
