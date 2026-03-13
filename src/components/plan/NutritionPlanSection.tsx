import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import type { NutritionPlan } from '@/types/nutrition';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface NutritionPlanSectionProps {
  nutritionPlan: NutritionPlan;
  onEdit: () => void;
}

export function NutritionPlanSection({ nutritionPlan, onEdit }: NutritionPlanSectionProps) {
  return (
    <View style={styles.container}>
      <Text variant="heading.md" style={styles.sectionTitle}>Nutrition</Text>
      <Card>
        <View style={styles.header}>
          <Text variant="heading.sm">Targets</Text>
          <Pressable onPress={onEdit} hitSlop={8}>
            <Text variant="body.md" color={colors.accent}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Text variant="body.md">Calories</Text>
          <Text variant="body.md" color={colors.textSecondary} style={styles.mono}>
            {nutritionPlan.calorieTarget} kcal
          </Text>
        </View>

        <View style={[styles.row, styles.divider]}>
          <Text variant="body.md">Protein</Text>
          <Text variant="body.md" color={colors.textSecondary} style={styles.mono}>
            {nutritionPlan.proteinTargetG}g ({nutritionPlan.proteinPortions} portions)
          </Text>
        </View>

        {nutritionPlan.dailyRules.length > 0 && (
          <View style={styles.rulesContainer}>
            <Text variant="caption" color={colors.textMuted} style={styles.rulesLabel}>
              Daily rules
            </Text>
            {nutritionPlan.dailyRules.map((rule, idx) => (
              <Text key={idx} variant="body.sm" color={colors.textSecondary}>
                {rule}
              </Text>
            ))}
          </View>
        )}
      </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  divider: {
    borderBottomWidth: 0,
  },
  mono: {
    fontFamily: 'IBMPlexMono_400Regular',
  },
  rulesContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  rulesLabel: {
    marginBottom: 2,
  },
});
