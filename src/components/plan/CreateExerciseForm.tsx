import { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { useCustomExercisesStore } from '@/stores/useCustomExercisesStore';
import type { ExerciseEquipment } from '@/types/workout';

const CATEGORIES = ['compound', 'isolation', 'bodyweight'] as const;

const MUSCLES = [
  'chest', 'lats', 'shoulders', 'quadriceps', 'glutes', 'hamstrings',
  'biceps', 'triceps', 'core', 'upper_back', 'lower_back', 'calves',
] as const;

const EQUIPMENT: ExerciseEquipment[] = [
  'barbell', 'dumbbell', 'bodyweight', 'cable', 'machine',
];

interface CreateExerciseFormProps {
  onCreated: (newId: string) => void;
  onCancel: () => void;
}

function chipLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CreateExerciseForm({ onCreated, onCancel }: CreateExerciseFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('compound');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<ExerciseEquipment>('barbell');

  const addCustomExercise = useCustomExercisesStore((s) => s.addCustomExercise);

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle],
    );
  };

  const canCreate = name.trim().length > 0 && selectedMuscles.length > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    const id = addCustomExercise({
      name: name.trim(),
      category,
      primaryMuscles: selectedMuscles,
      equipment,
    });
    onCreated(id);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text variant="heading.sm">Create Exercise</Text>
        <Pressable onPress={onCancel}>
          <Text variant="body.sm" color={colors.accent}>Cancel</Text>
        </Pressable>
      </View>

      {/* Name */}
      <Text variant="caption" color={colors.textMuted} style={styles.label}>Name</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Exercise name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoCorrect={false}
        autoFocus
      />

      {/* Category */}
      <Text variant="caption" color={colors.textMuted} style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.chip, category === cat && styles.chipSelected]}
            onPress={() => setCategory(cat)}
          >
            <Text
              variant="body.sm"
              color={category === cat ? colors.accent : colors.textSecondary}
            >
              {chipLabel(cat)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Primary Muscles */}
      <Text variant="caption" color={colors.textMuted} style={styles.label}>
        Primary Muscles (select at least 1)
      </Text>
      <View style={styles.chipGrid}>
        {MUSCLES.map((muscle) => {
          const selected = selectedMuscles.includes(muscle);
          return (
            <Pressable
              key={muscle}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleMuscle(muscle)}
            >
              <Text
                variant="body.sm"
                color={selected ? colors.accent : colors.textSecondary}
              >
                {chipLabel(muscle)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Equipment */}
      <Text variant="caption" color={colors.textMuted} style={styles.label}>Equipment</Text>
      <View style={styles.chipRow}>
        {EQUIPMENT.map((eq) => (
          <Pressable
            key={eq}
            style={[styles.chip, equipment === eq && styles.chipSelected]}
            onPress={() => setEquipment(eq)}
          >
            <Text
              variant="body.sm"
              color={equipment === eq ? colors.accent : colors.textSecondary}
            >
              {chipLabel(eq)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button
        variant="primary"
        label="Create Exercise"
        onPress={handleCreate}
        fullWidth
        disabled={!canCreate}
        style={styles.createBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xs,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  createBtn: {
    marginTop: spacing.xl,
  },
});
