import { useState, useRef, useEffect, useMemo } from 'react';
import { View, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { CreateExerciseForm } from './CreateExerciseForm';
import { getExercise, getAllExercisesList, getAlternatives } from '@/data/exerciseBank';
import { useCustomExercisesStore } from '@/stores/useCustomExercisesStore';
import type { WorkoutExercise, TargetSet } from '@/types/workout';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

interface EditExerciseSheetProps {
  visible: boolean;
  onDismiss: () => void;
  exercise: WorkoutExercise | null;
  onSave: (updated: WorkoutExercise) => void;
}

export function EditExerciseSheet({
  visible,
  onDismiss,
  exercise,
  onSave,
}: EditExerciseSheetProps) {
  const [localSets, setLocalSets] = useState<TargetSet[]>([]);
  const [localExerciseId, setLocalExerciseId] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to custom exercises for reactivity
  const customExercises = useCustomExercisesStore((s) => s.customExercises);

  const prevExIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (exercise && exercise.exerciseId !== prevExIdRef.current) {
      prevExIdRef.current = exercise.exerciseId;
      setLocalSets(exercise.sets.map((s) => ({ ...s })));
      setLocalExerciseId(exercise.exerciseId);
      setShowExercisePicker(false);
      setSearchQuery('');
    }
  }, [exercise]);

  const currentExercise = localExerciseId ? getExercise(localExerciseId) : null;
  const exName = currentExercise?.name ?? localExerciseId ?? '';

  const alternatives = useMemo(
    () => (localExerciseId ? getAlternatives(localExerciseId) : []),
    [localExerciseId],
  );

  const filteredExercises = useMemo(() => {
    const all = getAllExercisesList();
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter((ex) => ex.name.toLowerCase().includes(q));
  }, [searchQuery, customExercises]);

  const updateSet = (idx: number, field: 'targetReps', value: [number, number]) => {
    setLocalSets((prev) => {
      const next = prev.map((s) => ({ ...s }));
      next[idx] = { ...next[idx], targetReps: value };
      return next;
    });
  };

  const removeSet = (idx: number) => {
    if (localSets.length <= 1) return;
    setLocalSets((prev) => prev.filter((_, i) => i !== idx));
  };

  const addSet = () => {
    const lastSet = localSets[localSets.length - 1];
    const ex = currentExercise;
    const newSet: TargetSet = {
      targetReps: lastSet
        ? [...lastSet.targetReps] as [number, number]
        : [ex?.defaultReps.min ?? 8, ex?.defaultReps.max ?? 12],
      suggestedWeightKg: null,
      restSeconds: ex?.restSeconds ?? 90,
    };
    setLocalSets((prev) => [...prev, newSet]);
  };

  const selectExercise = (exerciseId: string) => {
    const ex = getExercise(exerciseId);
    if (!ex) return;
    setLocalExerciseId(exerciseId);
    // Reset sets to new exercise defaults
    const newSets: TargetSet[] = Array.from({ length: ex.defaultSets }, () => ({
      targetReps: [ex.defaultReps.min, ex.defaultReps.max] as [number, number],
      suggestedWeightKg: null,
      restSeconds: ex.restSeconds,
    }));
    setLocalSets(newSets);
    setShowExercisePicker(false);
    setShowCreateForm(false);
    setSearchQuery('');
  };

  const handleSave = () => {
    if (!exercise || !localExerciseId) return;
    onSave({ exerciseId: localExerciseId, sets: localSets });
  };

  const equipmentLabel = (eq: string) =>
    eq.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <BottomSheet
      visible={visible}
      onDismiss={onDismiss}
      snapPoints={[showExercisePicker || showCreateForm ? '85%' : '65%']}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exercise name — tappable to toggle picker */}
        <Pressable
          style={styles.titleRow}
          onPress={() => setShowExercisePicker((v) => !v)}
        >
          <Text variant="heading.md" style={styles.titleText}>{exName}</Text>
          <Text variant="body.sm" color={colors.accent}>
            {showExercisePicker ? 'Close' : 'Change'}
          </Text>
        </Pressable>

        {/* Create exercise form */}
        {showCreateForm && (
          <CreateExerciseForm
            onCreated={(newId) => selectExercise(newId)}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Exercise picker */}
        {showExercisePicker && !showCreateForm && (
          <View style={styles.pickerContainer}>
            {/* Suggested alternatives */}
            {alternatives.length > 0 && (
              <>
                <Text variant="caption" color={colors.textMuted} style={styles.sectionLabel}>
                  Suggested Alternatives
                </Text>
                {alternatives.map((alt) => (
                  <Pressable
                    key={alt.id}
                    style={styles.exerciseRow}
                    onPress={() => selectExercise(alt.id)}
                  >
                    <Text variant="body.md" color={colors.textPrimary} style={styles.exerciseRowName}>
                      {alt.name}
                    </Text>
                    <View style={styles.equipBadge}>
                      <Text variant="caption" color={colors.textMuted}>
                        {equipmentLabel(alt.equipment)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </>
            )}

            {/* All exercises with search */}
            <Text variant="caption" color={colors.textMuted} style={styles.sectionLabel}>
              All Exercises
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises…"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {filteredExercises.map((ex) => (
              <Pressable
                key={ex.id}
                style={styles.exerciseRow}
                onPress={() => selectExercise(ex.id)}
              >
                <Text variant="body.md" color={colors.textPrimary} style={styles.exerciseRowName}>
                  {ex.name}
                </Text>
                <View style={styles.equipBadge}>
                  <Text variant="caption" color={colors.textMuted}>
                    {equipmentLabel(ex.equipment)}
                  </Text>
                </View>
              </Pressable>
            ))}

            {/* Create custom exercise button */}
            <Pressable
              style={styles.createCustomBtn}
              onPress={() => setShowCreateForm(true)}
            >
              <Text variant="body.sm" color={colors.accent} style={styles.createCustomText}>
                + Create Custom Exercise
              </Text>
            </Pressable>
          </View>
        )}

        {/* Sets editor — hidden when exercise picker is open */}
        {!showExercisePicker && (
          <>
            {/* Column headers */}
            <View style={styles.headerRow}>
              <Text variant="caption" color={colors.textMuted} style={styles.setLabel}>Set</Text>
              <Text variant="caption" color={colors.textMuted} style={styles.colHeader}>Min reps</Text>
              <Text variant="caption" color={colors.textMuted} style={styles.colHeader}>Max reps</Text>
              <View style={styles.removeCol} />
            </View>

            {/* Set rows */}
            {localSets.map((set, idx) => (
              <View key={idx} style={styles.setRow}>
                <Text variant="body.md" color={colors.textSecondary} style={styles.setLabel}>
                  {idx + 1}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(set.targetReps[0])}
                  onChangeText={(t) => {
                    const n = parseInt(t, 10) || 0;
                    updateSet(idx, 'targetReps', [n, set.targetReps[1]]);
                  }}
                  selectTextOnFocus
                />
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(set.targetReps[1])}
                  onChangeText={(t) => {
                    const n = parseInt(t, 10) || 0;
                    updateSet(idx, 'targetReps', [set.targetReps[0], n]);
                  }}
                  selectTextOnFocus
                />
                <Pressable
                  style={[styles.removeBtn, localSets.length <= 1 && styles.removeBtnDisabled]}
                  onPress={() => removeSet(idx)}
                  disabled={localSets.length <= 1}
                >
                  <Text
                    variant="body.md"
                    color={localSets.length <= 1 ? colors.textMuted : colors.error}
                  >
                    −
                  </Text>
                </Pressable>
              </View>
            ))}

            {/* Add set button */}
            <Pressable style={styles.addSetBtn} onPress={addSet}>
              <Text variant="body.sm" color={colors.accent} style={styles.addSetText}>
                + Add Set
              </Text>
            </Pressable>

            <Button
              variant="primary"
              label="Save Changes"
              onPress={handleSave}
              fullWidth
              style={styles.saveButton}
            />
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleText: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  setLabel: {
    width: 36,
    fontFamily: 'IBMPlexMono_500Medium',
  },
  colHeader: {
    flex: 1,
    textAlign: 'center',
  },
  removeCol: {
    width: 36,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xs,
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
    marginHorizontal: 4,
  },
  removeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnDisabled: {
    opacity: 0.3,
  },
  addSetBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xs,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
  },
  addSetText: {
    fontFamily: 'DMSans_600SemiBold',
  },
  saveButton: {
    marginTop: spacing.xl,
  },
  // Exercise picker styles
  pickerContainer: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xs,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  exerciseRowName: {
    flex: 1,
  },
  equipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  createCustomBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xs,
    borderStyle: 'dashed',
    marginTop: spacing.lg,
  },
  createCustomText: {
    fontFamily: 'DMSans_600SemiBold',
  },
});
