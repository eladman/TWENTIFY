import { View, Pressable, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { haptics } from '@/utils/haptics';

interface NutritionCardProps {
  proteinLogged: number;
  proteinTarget: number;
  onLogProtein: () => void;
}

const CIRCLE_SIZE = 36;

export function NutritionCard({ proteinLogged, proteinTarget, onLogProtein }: NutritionCardProps) {
  const handleTap = () => {
    if (proteinLogged < proteinTarget) {
      haptics.light();
      onLogProtein();
    }
  };

  return (
    <Card variant="info">
      <Text variant="heading.sm">Protein Today</Text>

      <View style={styles.circlesRow}>
        {Array.from({ length: proteinTarget }).map((_, i) => {
          const filled = i < proteinLogged;
          return (
            <Pressable
              key={i}
              onPress={filled ? undefined : handleTap}
              style={[
                styles.circle,
                filled ? styles.circleFilled : styles.circleOutlined,
              ]}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text variant="body.sm" color={colors.textPrimary}>
          {proteinLogged}/{proteinTarget}
        </Text>
        <Text variant="caption" color={colors.textMuted} style={styles.caption}>
          Tap to log a palm-sized protein portion
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  circlesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  circleFilled: {
    backgroundColor: colors.accent,
  },
  circleOutlined: {
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  caption: {
    flex: 1,
  },
});
