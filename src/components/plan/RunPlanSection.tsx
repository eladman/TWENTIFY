import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { RunPlan } from '@/types/plan';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const typeLabels: Record<string, string> = {
  easy: 'Easy',
  tempo: 'Tempo',
  intervals: 'Intervals',
  walk_run: 'Walk/Run',
};

interface RunPlanSectionProps {
  runPlan: RunPlan;
  onEditTemplate: (templateIdx: number) => void;
}

export function RunPlanSection({ runPlan, onEditTemplate }: RunPlanSectionProps) {
  return (
    <View style={styles.container}>
      <Text variant="heading.md" style={styles.sectionTitle}>Running</Text>
      {runPlan.templates.map((template, tIdx) => (
        <Card key={template.id} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="heading.sm">{template.name}</Text>
              <View style={styles.meta}>
                <Badge label={typeLabels[template.type] ?? template.type} variant="accent" />
                <Text variant="body.sm" color={colors.textSecondary}>
                  {template.targetDurationMin} min
                </Text>
                {template.targetZone && (
                  <Text variant="body.sm" color={colors.textMuted}>
                    Zone: {template.targetZone}
                  </Text>
                )}
              </View>
            </View>
            <Pressable onPress={() => onEditTemplate(tIdx)} hitSlop={8}>
              <Text variant="body.md" color={colors.accent}>Edit</Text>
            </Pressable>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
    gap: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
