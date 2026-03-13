import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import type { AiGeneratedPlan } from '@/types/chat';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ACTIVITY_EMOJI: Record<string, string> = {
  gym: '🏋️',
  run: '🏃',
  rest: '😴',
  nutrition_only: '🍽',
};

interface PlanPreviewCardProps {
  plan: AiGeneratedPlan;
  onAccept: () => void;
}

export function PlanPreviewCard({ plan, onAccept }: PlanPreviewCardProps) {
  if (!plan.weeklySchedule?.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="heading.sm">Your Plan</Text>
        </View>
        <Text variant="body.sm" color={colors.textMuted}>
          Generating your plan...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading.sm">Your Plan</Text>
      </View>

      <View style={styles.weekGrid}>
        {plan.weeklySchedule.map((day) => (
          <View key={day.dayOfWeek} style={styles.dayCell}>
            <Text variant="caption" color={colors.textMuted}>
              {DAY_LABELS[day.dayOfWeek]}
            </Text>
            <Text style={styles.emoji}>
              {ACTIVITY_EMOJI[day.activity] ?? '📋'}
            </Text>
            <Text
              variant="caption"
              color={colors.textSecondary}
              numberOfLines={1}
              style={styles.dayLabel}
            >
              {day.label}
            </Text>
            {day.estimatedDurationMin > 0 && (
              <Text variant="caption" color={colors.textMuted}>
                {day.estimatedDurationMin}m
              </Text>
            )}
          </View>
        ))}
      </View>

      {plan.nutritionPlan && (
        <View style={styles.nutritionRow}>
          <Text variant="body.sm" color={colors.textSecondary}>
            🍽 {plan.nutritionPlan.calorieTarget} kcal · {plan.nutritionPlan.proteinTargetG}g protein
          </Text>
        </View>
      )}

      <Button
        variant="primary"
        label="Accept Plan"
        onPress={onAccept}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    ...shadows.sm,
  },
  header: {
    marginBottom: spacing.md,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  dayCell: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  emoji: {
    fontSize: 20,
    marginVertical: 2,
  },
  dayLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  nutritionRow: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});
