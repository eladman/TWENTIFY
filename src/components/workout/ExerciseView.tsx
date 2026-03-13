import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { radius } from '@/theme/radius';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamilies } from '@/theme/typography';
import { haptics } from '@/utils/haptics';
import { formatReps } from '@/utils/formatters';
import { getCitationsForExercise } from '@/data/citations';
import { getAlternatives } from '@/data/exerciseBank';
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
  placeholderWeight: number | null;
  placeholderReps: number | null;
  placeholderSource: 'last_session' | 'prev_set' | null;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onCompleteSet: () => void;
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
  placeholderWeight,
  placeholderReps,
  placeholderSource,
  onWeightChange,
  onRepsChange,
  onCompleteSet,
}: ExerciseViewProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [weightText, setWeightText] = useState(displayWeight === 0 ? '' : String(displayWeight));
  const [repsText, setRepsText] = useState(displayReps === 0 ? '' : String(displayReps));
  const [weightFocused, setWeightFocused] = useState(false);
  const [repsFocused, setRepsFocused] = useState(false);

  // Sync local text state when exercise/set changes
  const prevKeyRef = useRef('');
  useEffect(() => {
    const key = `${exerciseIndex}-${setIndex}`;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;
    setWeightText(displayWeight === 0 ? '' : String(displayWeight));
    setRepsText(displayReps === 0 ? '' : String(displayReps));
  }, [exerciseIndex, setIndex, displayWeight, displayReps]);

  const handleWeightBlur = useCallback(() => {
    setWeightFocused(false);
    const parsed = parseFloat(weightText);
    if (!isNaN(parsed) && parsed >= 0) {
      onWeightChange(parsed);
      setWeightText(parsed === 0 ? '' : String(Math.round(parsed * 10) / 10));
    } else if (weightText.trim() !== '') {
      // Invalid non-empty input — revert to last known value
      setWeightText(displayWeight === 0 ? '' : String(displayWeight));
    }
    // Empty input stays empty
  }, [weightText, displayWeight, onWeightChange]);

  const handleRepsBlur = useCallback(() => {
    setRepsFocused(false);
    const parsed = parseInt(repsText, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onRepsChange(parsed);
      setRepsText(parsed === 0 ? '' : String(parsed));
    } else if (repsText.trim() !== '') {
      // Invalid non-empty input — revert to last known value
      setRepsText(displayReps === 0 ? '' : String(displayReps));
    }
    // Empty input stays empty
  }, [repsText, displayReps, onRepsChange]);

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
  const alternatives = getAlternatives(exercise.id);

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
            <View style={styles.inputGroup}>
              <Text variant="body.sm" color={colors.textSecondary} align="center" style={styles.inputLabel}>
                Weight
              </Text>
              <View style={[styles.inputBox, weightFocused && styles.inputBoxFocused]}>
                <TextInput
                  style={styles.numberInput}
                  value={weightText}
                  onChangeText={setWeightText}
                  onFocus={() => setWeightFocused(true)}
                  onBlur={handleWeightBlur}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  textAlign="center"
                  placeholder={placeholderWeight != null ? String(placeholderWeight) : '0.0'}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <Text variant="body.sm" color={colors.textSecondary} align="center">
                {unitLabel}
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.inputRow, !isBodyweight && styles.inputRowSpaced]}>
          <View style={styles.inputGroup}>
            <Text variant="body.sm" color={colors.textSecondary} align="center" style={styles.inputLabel}>
              Reps completed
            </Text>
            <View style={[styles.inputBox, repsFocused && styles.inputBoxFocused]}>
              <TextInput
                style={styles.numberInput}
                value={repsText}
                onChangeText={setRepsText}
                onFocus={() => setRepsFocused(true)}
                onBlur={handleRepsBlur}
                keyboardType="number-pad"
                selectTextOnFocus
                textAlign="center"
                placeholder={placeholderReps != null ? String(placeholderReps) : '0'}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </View>

        {placeholderSource && (
          <Text variant="caption" color={colors.textMuted} align="center" style={styles.placeholderLabel}>
            {placeholderSource === 'last_session' ? 'Last session' : 'From prev set'}
          </Text>
        )}

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
        {progression.effortGuidance
          ? `Target: RPE 7-9 — ${progression.effortGuidance}`
          : 'RPE 7-8 (2-3 reps in reserve)'}
      </Text>
      {!progression.effortGuidance && (
        <Text
          variant="caption"
          color={colors.textMuted}
          align="center"
          style={styles.rpeCaption}
        >
          Should feel challenging but not maximal
        </Text>
      )}

      <Pressable onPress={() => setSheetVisible(true)} style={styles.whyBtn}>
        <Text variant="caption" color={colors.accent}>
          Why this exercise? {'\u2192'}
        </Text>
      </Pressable>

      <View style={styles.completeBtnSpacer} />
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

          {alternatives.length > 0 && (
            <View style={styles.sheetSection}>
              <Text variant="heading.sm">Alternatives</Text>
              {alternatives.map((alt) => (
                <Text
                  key={alt.id}
                  variant="body.sm"
                  color={colors.textSecondary}
                  style={styles.altItem}
                >
                  {'\u2022'} {alt.name}
                </Text>
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
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  inputRowSpaced: {
    marginTop: spacing.md,
  },
  inputGroup: {
    alignItems: 'center',
    minWidth: 130,
  },
  inputLabel: {
    marginBottom: spacing.xs,
  },
  inputBox: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minWidth: 130,
    alignItems: 'center',
  },
  inputBoxFocused: {
    borderColor: colors.accent,
    backgroundColor: '#FFFFFF',
  },
  numberInput: {
    fontFamily: fontFamilies.mono,
    fontSize: 36,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingVertical: 0,
    minWidth: 90,
  },
  placeholderLabel: {
    marginTop: spacing.sm,
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
  completeBtnSpacer: {
    flex: 1,
  },
  completeBtn: {
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
  altItem: {
    marginTop: spacing.xs,
  },
});
