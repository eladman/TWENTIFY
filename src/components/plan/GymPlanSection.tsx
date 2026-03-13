import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { getExercise } from '@/data/exerciseBank';
import type { GymPlan } from '@/types/plan';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface GymPlanSectionProps {
  gymPlan: GymPlan;
  onEditExercise: (templateIdx: number, exerciseIdx: number) => void;
}

export function GymPlanSection({ gymPlan, onEditExercise }: GymPlanSectionProps) {
  return (
    <View style={styles.container}>
      <Text variant="heading.md" style={styles.sectionTitle}>Gym</Text>
      {gymPlan.templates.map((template, tIdx) => (
        <Card key={template.id} style={styles.card}>
          <Text variant="heading.sm" style={styles.templateName}>{template.name}</Text>
          <Text variant="caption" color={colors.textSecondary} style={styles.duration}>
            ~{template.estimatedDurationMin} min
          </Text>
          {template.exercises.map((we, eIdx) => {
            const ex = getExercise(we.exerciseId);
            const name = ex?.name ?? we.exerciseId;
            const sets = we.sets.length;
            const reps = we.sets[0]
              ? `${we.sets[0].targetReps[0]}-${we.sets[0].targetReps[1]}`
              : '–';
            const weight = we.sets[0]?.suggestedWeightKg;
            const isLast = eIdx === template.exercises.length - 1;

            return (
              <Pressable
                key={we.exerciseId}
                onPress={() => onEditExercise(tIdx, eIdx)}
                style={({ pressed }) => [
                  styles.exerciseRow,
                  !isLast && styles.rowDivider,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={styles.exerciseLeft}>
                  <Text variant="caption" color={colors.textMuted} style={styles.exerciseIndex}>
                    {eIdx + 1}
                  </Text>
                  <Text variant="body.md" style={styles.exerciseName} numberOfLines={1}>
                    {name}
                  </Text>
                </View>
                <View style={styles.exerciseRight}>
                  <Text variant="body.sm" color={colors.textSecondary}>
                    {sets}x{reps}
                  </Text>
                  {weight != null && (
                    <Text variant="body.sm" color={colors.textMuted} style={styles.weight}>
                      {weight}kg
                    </Text>
                  )}
                  <Text variant="body.md" color={colors.textMuted} style={styles.chevron}>
                    ›
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  card: {
    gap: 0,
  },
  templateName: {
    marginBottom: 2,
  },
  duration: {
    marginBottom: spacing.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    backgroundColor: colors.accentAlpha08,
    borderRadius: 8,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  exerciseIndex: {
    width: 20,
    fontFamily: 'IBMPlexMono_400Regular',
  },
  exerciseName: {
    flex: 1,
  },
  exerciseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weight: {
    fontFamily: 'IBMPlexMono_400Regular',
  },
  chevron: {
    fontSize: 18,
    marginLeft: 2,
  },
});
