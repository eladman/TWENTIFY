import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { haptics } from '@/utils/haptics';
import { formatReps } from '@/utils/formatters';
import { getCitationsForExercise } from '@/data/citations';
import type { Exercise } from '@/types/workout';
import type { ExerciseProgression } from '@/services/progressiveOverload';

interface ExerciseViewProps {
  exercise: Exercise;
  progression: ExerciseProgression;
  exerciseIndex: number;
  setIndex: number;
  totalSets: number;
  displayWeight: number;
  displayReps: number;
  unitLabel: string;
  isBodyweight: boolean;
  previousRef: string;
  onIncrementWeight: () => void;
  onDecrementWeight: () => void;
  onIncrementReps: () => void;
  onDecrementReps: () => void;
  onCompleteSet: () => void;
}

function StepperButton({ label, onPress }: { label: string; onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    haptics.light();
    scale.value = withSequence(
      withTiming(1.15, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress} style={styles.stepperBtn}>
        <Text variant="heading.md" color={colors.accent}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function ExerciseView({
  exercise,
  progression,
  exerciseIndex,
  setIndex,
  totalSets,
  displayWeight,
  displayReps,
  unitLabel,
  isBodyweight,
  previousRef,
  onIncrementWeight,
  onDecrementWeight,
  onIncrementReps,
  onDecrementReps,
  onCompleteSet,
}: ExerciseViewProps) {
  const [sheetVisible, setSheetVisible] = useState(false);

  const currentTarget = progression.sets[setIndex];
  const targetRepsStr = currentTarget
    ? formatReps(currentTarget.targetReps.min, currentTarget.targetReps.max)
    : '';

  const progressionNote = currentTarget?.note ?? progression.progressionNote;

  const handleComplete = useCallback(() => {
    haptics.medium();
    onCompleteSet();
  }, [onCompleteSet]);

  const citations = getCitationsForExercise(exercise.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading.lg" align="center">
          {exercise.name}
        </Text>
        <Text variant="body.md" color={colors.textSecondary} align="center" style={styles.setLabel}>
          Set {setIndex + 1} of {totalSets}
        </Text>
      </View>

      <View style={styles.gap32} />

      <Card variant="workout">
        <Text variant="heading.md" align="center">
          Target: {targetRepsStr}
        </Text>

        <Text
          variant="body.sm"
          color={colors.textSecondary}
          align="center"
          style={styles.gap12}
        >
          {previousRef}
        </Text>

        {!isBodyweight && (
          <View style={styles.inputRow}>
            <StepperButton label={'\u2212'} onPress={onDecrementWeight} />
            <View style={styles.valueContainer}>
              <Text variant="data.lg" align="center">
                {displayWeight}
              </Text>
              <Text variant="body.sm" color={colors.textSecondary} align="center">
                {unitLabel}
              </Text>
            </View>
            <StepperButton label="+" onPress={onIncrementWeight} />
          </View>
        )}

        <View style={[styles.inputRow, { marginTop: spacing.lg }]}>
          <StepperButton label={'\u2212'} onPress={onDecrementReps} />
          <View style={styles.valueContainer}>
            <Text variant="body.sm" color={colors.textSecondary} align="center">
              Reps completed
            </Text>
            <Text variant="data.lg" align="center">
              {displayReps}
            </Text>
          </View>
          <StepperButton label="+" onPress={onIncrementReps} />
        </View>

        {progressionNote ? (
          <Text
            variant="body.sm"
            color={colors.accent}
            align="center"
            style={styles.progressionNote}
          >
            {progressionNote}
          </Text>
        ) : null}
      </Card>

      <Text
        variant="body.sm"
        color={colors.textSecondary}
        align="center"
        style={styles.rpeGuide}
      >
        RPE 7-8 (2-3 reps in reserve)
      </Text>
      <Text
        variant="caption"
        color={colors.textMuted}
        align="center"
        style={styles.rpeCaption}
      >
        Should feel challenging but not maximal
      </Text>

      <Pressable onPress={() => setSheetVisible(true)} style={styles.whyBtn}>
        <Text variant="caption" color={colors.accent}>
          Why this exercise? {'\u2192'}
        </Text>
      </Pressable>

      <View style={styles.completeBtn}>
        <Button
          variant="primary"
          fullWidth
          label={'Complete Set \u2713'}
          onPress={handleComplete}
        />
      </View>

      <BottomSheet
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        snapPoints={['70%']}
      >
        <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <Text variant="heading.md" style={styles.sheetTitle}>
            {exercise.name}
          </Text>

          <Text variant="body.md" style={styles.sheetSection}>
            {exercise.instructions}
          </Text>

          {exercise.cues.length > 0 && (
            <View style={styles.sheetSection}>
              <Text variant="heading.sm">Cues</Text>
              {exercise.cues.map((cue, i) => (
                <Text key={i} variant="body.sm" color={colors.textSecondary} style={styles.cueItem}>
                  {'\u2022'} {cue}
                </Text>
              ))}
            </View>
          )}

          {citations.length > 0 && (
            <View style={styles.sheetSection}>
              <Text variant="heading.sm">Research</Text>
              {citations.map((cit) => (
                <View key={cit.id} style={styles.citationItem}>
                  <Text variant="caption" color={colors.textSecondary}>
                    {cit.authors} ({cit.year})
                  </Text>
                  <Text variant="body.sm">{cit.finding}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
  },
  setLabel: {
    marginTop: spacing.xs,
  },
  gap32: {
    height: 32,
  },
  gap12: {
    marginTop: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    minWidth: 80,
    alignItems: 'center',
  },
  progressionNote: {
    marginTop: spacing.lg,
  },
  rpeGuide: {
    marginTop: spacing.xl,
  },
  rpeCaption: {
    marginTop: spacing.xs,
  },
  whyBtn: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  completeBtn: {
    marginTop: 'auto' as unknown as number,
    paddingBottom: spacing.lg,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sheetTitle: {
    marginBottom: spacing.lg,
  },
  sheetSection: {
    marginBottom: spacing.lg,
  },
  cueItem: {
    marginTop: spacing.xs,
  },
  citationItem: {
    marginTop: spacing.sm,
  },
});
