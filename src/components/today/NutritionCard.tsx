import { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
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

function AnimatedCircle({
  filled,
  onPress,
}: {
  filled: boolean;
  onPress: (() => void) | undefined;
}) {
  const scale = useSharedValue(filled ? 1 : 0);
  const prevFilled = useRef(filled);

  useEffect(() => {
    if (filled && !prevFilled.current) {
      // unfilled → filled: scale-in with overshoot
      scale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1.0, { duration: 100 }),
      );
    }
    prevFilled.current = filled;
  }, [filled, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filled ? scale.value : 1 }],
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.circle,
          filled ? styles.circleFilled : styles.circleOutlined,
          animatedStyle,
        ]}
      />
    </Pressable>
  );
}

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
            <AnimatedCircle
              key={i}
              filled={filled}
              onPress={filled ? undefined : handleTap}
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
