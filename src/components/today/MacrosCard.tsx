import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { motion } from '@/theme/animations';

interface MacrosCardProps {
  onPress?: () => void;
}

const DATA = {
  calories: { consumed: 1420, target: 2100 },
  protein: { consumed: 95, target: 140, color: colors.accent, label: 'Protein' },
  carbs: { consumed: 145, target: 220, color: colors.warning, label: 'Carbs' },
  fat: { consumed: 48, target: 70, color: colors.success, label: 'Fat' },
} as const;

const MACROS = [DATA.protein, DATA.carbs, DATA.fat] as const;

function MacroBar({ label, consumed, target, color, index }: typeof MACROS[number] & { index: number }) {
  const pct = Math.min(consumed / target, 1);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withDelay(
      index * motion.stagger.cards,
      withTiming(pct * 100, { duration: motion.duration.chart, easing: motion.easing.out }),
    );
  }, []);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
    backgroundColor: color,
  }));

  return (
    <View style={barStyles.row}>
      <View style={barStyles.labelRow}>
        <Text variant="caption" color={colors.textSecondary}>{label}</Text>
        <Text variant="caption" color={colors.textSecondary}>{consumed}/{target}g</Text>
      </View>
      <View style={barStyles.track}>
        <Animated.View style={[barStyles.fill, fillStyle]} />
      </View>
    </View>
  );
}

export function MacrosCard({ onPress }: MacrosCardProps) {
  const { calories } = DATA;

  return (
    <Card variant="info" onPress={onPress} style={shadows.sm}>
      <View style={styles.header}>
        <Text variant="heading.sm">Nutrition</Text>
        <Badge label="ON TRACK" variant="success" />
      </View>

      <View style={styles.calorieRow}>
        <Text variant="data.lg">{calories.consumed.toLocaleString()}</Text>
        <Text variant="body.sm" color={colors.textSecondary} style={styles.calorieLabel}>
          {' '}/ {calories.target.toLocaleString()} kcal
        </Text>
      </View>

      <View style={styles.macros}>
        {MACROS.map((m, i) => (
          <MacroBar key={m.label} {...m} index={i} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
  },
  calorieLabel: {
    marginBottom: 2,
  },
  macros: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});

const barStyles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: radius.full,
  },
});
