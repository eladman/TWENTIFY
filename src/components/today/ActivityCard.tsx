import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getExercise, getAllExercisesMap } from '@/data/exerciseBank';
import { usePlanStore } from '@/stores/usePlanStore';
import { useUserStore } from '@/stores/useUserStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { getWeeklyVolumeSummary } from '@/utils/weeklyVolume';
import { formatDuration, formatReps } from '@/utils/formatters';
import type { TodayState } from './useToday';
import type { DayPlan } from '@/types/plan';
import type { CompletedWorkout } from '@/types/workout';
import type { CompletedRun } from '@/types/run';

interface ActivityCardProps {
  state: TodayState;
  todayPlan: DayPlan | null;
  completedWorkout: CompletedWorkout | null;
  completedRun: CompletedRun | null;
}

const REST_QUOTES = [
  { text: 'The magic happens between workouts, not during them.', author: 'Dr. Andy Galpin' },
  { text: 'Rest is not the absence of training — it is part of training.', author: 'Tudor Bompa' },
  { text: 'Recovery is where adaptation happens.', author: 'Dr. Mike Israetel' },
];

export function ActivityCard({ state, todayPlan, completedWorkout, completedRun }: ActivityCardProps) {
  const router = useRouter();
  const currentWeek = usePlanStore((s) => s.currentWeek);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const goal = useUserStore((s) => s.goal);
  const workoutHistory = useWorkoutStore((s) => s.history);

  const volumeSummary = useMemo(() => {
    if (goal !== 'muscle_build') return null;
    return getWeeklyVolumeSummary(workoutHistory, getAllExercisesMap());
  }, [goal, workoutHistory]);

  if (state === 'no_plan') {
    return (
      <Card variant="workout">
        <Badge label="GET STARTED" variant="muted" />
        <Text variant="heading.md" style={styles.title}>
          No Plan Yet
        </Text>
        <Text variant="body.md" color={colors.textSecondary} style={styles.subtitle}>
          Complete the onboarding to get your personalized training plan.
        </Text>
        <Button
          label="Start Setup →"
          onPress={() => router.push('/(onboarding)/domains')}
          fullWidth
          style={styles.startButton}
        />
      </Card>
    );
  }

  if (state === 'completed_today') {
    const duration = completedWorkout?.durationSeconds ?? completedRun?.durationSeconds ?? 0;
    const exerciseCount = completedWorkout?.exercises.length;

    return (
      <Card variant="workout">
        <Badge label="COMPLETED" variant="success" />
        <Text variant="heading.md" style={styles.title}>
          Done for today
        </Text>
        <View style={styles.summaryRow}>
          {duration > 0 && (
            <Text variant="body.md" color={colors.textSecondary}>
              {formatDuration(duration)}
            </Text>
          )}
          {exerciseCount && (
            <Text variant="body.md" color={colors.textSecondary}>
              {exerciseCount} exercises
            </Text>
          )}
        </View>
        <Text variant="body.sm" color={colors.textMuted} style={styles.encouragement}>
          Rest up — see you tomorrow.
        </Text>
      </Card>
    );
  }

  if (state === 'scheduled_workout' && todayPlan?.workoutTemplate) {
    const template = todayPlan.workoutTemplate;
    const exerciseCount = template.exercises.length;

    const handleStart = () => {
      router.push(`/workout/${template.id}`);
    };

    return (
      <Card variant="workout">
        <Badge label="READY" variant="accent" />
        <Text variant="heading.md" style={styles.title}>
          {template.name}
        </Text>
        <Text variant="body.sm" color={colors.textSecondary} style={styles.subtitle}>
          {exerciseCount} exercises · {todayPlan.estimatedDurationMin} min
        </Text>

        <View style={styles.exerciseList}>
          {template.exercises.slice(0, 5).map((ex, i) => {
            const exData = getExercise(ex.exerciseId);
            const name = exData?.name ?? ex.exerciseId;
            const sets = ex.sets.length;
            const reps = ex.sets[0]
              ? formatReps(ex.sets[0].targetReps[0], ex.sets[0].targetReps[1])
              : '';

            return (
              <View key={ex.exerciseId} style={styles.exerciseRow}>
                <Text variant="body.sm" color={colors.textSecondary} style={styles.exerciseIndex}>
                  {i + 1}
                </Text>
                <Pressable
                  onPress={() => setSelectedExerciseId(ex.exerciseId)}
                  style={styles.exerciseNameBtn}
                >
                  <Text
                    variant="body.sm"
                    color={colors.accent}
                    style={styles.exerciseName}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                </Pressable>
                <Text variant="body.sm" color={colors.textMuted}>
                  {sets}×{reps}
                </Text>
              </View>
            );
          })}
          {exerciseCount > 5 && (
            <Text variant="body.sm" color={colors.textMuted} style={styles.moreText}>
              +{exerciseCount - 5} more
            </Text>
          )}
        </View>

        {volumeSummary && volumeSummary.totalSets > 0 && (
          <Text variant="caption" color={colors.textMuted} style={styles.volumeContext}>
            ~{volumeSummary.totalSets} sets this week · {volumeSummary.muscleGroups} muscle groups
          </Text>
        )}

        <StartButtonPulse>
          <Button
            label="Start Workout →"
            onPress={handleStart}
            fullWidth
            style={styles.startButton}
          />
        </StartButtonPulse>

        <ExerciseDetailSheet
          exerciseId={selectedExerciseId}
          visible={selectedExerciseId !== null}
          onDismiss={() => setSelectedExerciseId(null)}
        />
      </Card>
    );
  }

  if (state === 'scheduled_run' && todayPlan?.runTemplate) {
    const template = todayPlan.runTemplate;
    const isWalkRun = template.type === 'walk_run';

    const handleStart = () => {
      router.push({
        pathname: '/run/active',
        params: {
          sessionType: template.type,
          weekNumber: String(currentWeek),
          sessionIndex: '0',
        },
      });
    };

    return (
      <Card variant="workout">
        <Badge
          label={template.type.toUpperCase().replace('_', ' ')}
          variant={isWalkRun ? 'warning' : 'accent'}
        />
        <Text variant="heading.md" style={styles.title}>
          {template.name}
        </Text>
        <Text variant="body.sm" color={colors.textSecondary} style={styles.subtitle}>
          {todayPlan.estimatedDurationMin} min
          {template.targetZone ? ` · ${template.targetZone}` : ''}
        </Text>

        <StartButtonPulse>
          <Button
            label="Start Run →"
            onPress={handleStart}
            fullWidth
            style={styles.startButton}
          />
        </StartButtonPulse>
      </Card>
    );
  }

  if (state === 'rest_day') {
    const quote = REST_QUOTES[new Date().getDay() % REST_QUOTES.length];

    return (
      <Card variant="workout">
        <Badge label="REST DAY" variant="muted" />
        <Text variant="heading.md" style={styles.title}>
          Recovery Day
        </Text>
        <Text variant="body.md" color={colors.textSecondary} style={styles.quoteText}>
          "{quote.text}"
        </Text>
        <Text variant="caption" color={colors.textMuted} style={styles.quoteAuthor}>
          — {quote.author}
        </Text>
      </Card>
    );
  }

  return null;
}

function StartButtonPulse({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    scale.value = withSequence(
      withTiming(1.02, { duration: 1000 }),
      withTiming(1.0, { duration: 1000 }),
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  exerciseList: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIndex: {
    width: 20,
  },
  exerciseNameBtn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  exerciseName: {
    flex: 1,
  },
  moreText: {
    marginTop: spacing.xs,
    marginLeft: 20,
  },
  volumeContext: {
    marginTop: spacing.md,
  },
  startButton: {
    marginTop: spacing.xl,
  },
  encouragement: {
    marginTop: spacing.md,
  },
  quoteText: {
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    marginTop: spacing.sm,
  },
});
