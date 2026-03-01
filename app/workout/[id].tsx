import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ExerciseView } from '@/components/workout/ExerciseView';
import { ExerciseTransition } from '@/components/workout/ExerciseTransition';
import { SetCompletionFlash } from '@/components/workout/SetCompletionFlash';
import { RestTimer } from '@/components/workout/RestTimer';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useKeepAwake();

  const w = useActiveWorkout(id ?? '');

  // Auto-finish when phase is complete
  useEffect(() => {
    if (w.phase === 'complete') {
      w.handleFinish();
    }
  }, [w.phase, w.handleFinish]);

  if (w.phase === 'error') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text variant="heading.lg" align="center">
            Workout not found
          </Text>
          <Text
            variant="body.md"
            color={colors.textSecondary}
            align="center"
            style={styles.errorSubtitle}
          >
            Could not load this workout template.
          </Text>
          <Button variant="secondary" label="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (w.phase === 'complete') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.completeContainer}>
          <Text variant="heading.xl" align="center">
            Workout Complete!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={w.handleExit} hitSlop={12}>
          <Text variant="body.md" color={colors.accent}>
            {'\u2190'} Exit
          </Text>
        </Pressable>
        <Text variant="body.sm" color={colors.textSecondary}>
          {w.exerciseIndex + 1}/{w.totalExercises} exercises
        </Text>
      </View>

      {/* Content */}
      {w.phase === 'rest' ? (
        <RestTimer
          totalSeconds={w.restSeconds}
          onComplete={w.handleRestComplete}
          onSkip={w.handleSkipRest}
          nextSetInfo={w.nextSetInfo}
        />
      ) : w.currentExercise && w.currentProgression ? (
        <ExerciseTransition exerciseKey={w.exerciseIndex}>
          <ExerciseView
            exercise={w.currentExercise}
            progression={w.currentProgression}
            exerciseIndex={w.exerciseIndex}
            setIndex={w.setIndex}
            totalSets={w.totalSets}
            displayWeight={w.displayWeight}
            displayReps={w.displayReps}
            unitLabel={w.unitLabel}
            isBodyweight={w.isBodyweight}
            previousRef={w.previousRef}
            onIncrementWeight={w.handleIncrementWeight}
            onDecrementWeight={w.handleDecrementWeight}
            onIncrementReps={w.handleIncrementReps}
            onDecrementReps={w.handleDecrementReps}
            onCompleteSet={w.handleCompleteSet}
          />
        </ExerciseTransition>
      ) : null}

      {/* Flash overlay */}
      <SetCompletionFlash visible={w.showFlash} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenPadding.horizontal,
    gap: spacing.lg,
  },
  errorSubtitle: {
    marginTop: spacing.sm,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
