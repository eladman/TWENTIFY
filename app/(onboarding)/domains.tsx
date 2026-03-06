import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useUserStore } from '@/stores/useUserStore';
import { haptics } from '@/utils/haptics';
import { analytics } from '@/services/analytics';
import type { Domain } from '@/types/user';

const DOMAINS = [
  { id: 'gym' as Domain, emoji: '🏋️', title: 'GYM', description: 'Strength training. The vital few exercises.' },
  { id: 'running' as Domain, emoji: '🏃', title: 'RUNNING', description: 'Cardio & endurance. The 80/20 of running.' },
  { id: 'nutrition' as Domain, emoji: '🍽', title: 'NUTRITION', description: 'What to eat. The rules that actually matter.' },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={stepStyles.container}>
      <Text variant="overline" style={{ color: colors.textSecondary }}>
        STEP {current} OF {total}
      </Text>
      <View style={stepStyles.dots}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              stepStyles.dot,
              {
                backgroundColor:
                  i < current ? colors.accent : 'transparent',
                borderColor:
                  i < current ? colors.accent : colors.cardBorder,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});

function DomainCard({
  domain,
  selected,
  onToggle,
  index,
}: {
  domain: (typeof DOMAINS)[number];
  selected: boolean;
  onToggle: () => void;
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Card
        variant="workout"
        onPress={() => {
          haptics.selection();
          onToggle();
        }}
        style={
          selected
            ? {
                borderColor: colors.accent,
                borderWidth: 1.5,
                backgroundColor: colors.accentAlpha08,
              }
            : undefined
        }
      >
        <View style={cardStyles.row}>
          <Text style={cardStyles.emoji}>{domain.emoji}</Text>
          <View style={cardStyles.textContainer}>
            <Text variant="heading.sm">{domain.title}</Text>
            <Text variant="body.sm" color={colors.textSecondary}>
              {domain.description}
            </Text>
          </View>
          <View
            style={[
              cardStyles.checkbox,
              selected
                ? { backgroundColor: colors.accent, borderColor: colors.accent }
                : { borderColor: colors.cardBorder },
            ]}
          >
            {selected && (
              <Text style={cardStyles.checkmark}>✓</Text>
            )}
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const cardStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.lg,
    gap: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
});

export default function DomainsScreen() {
  const router = useRouter();
  const setDomains = useUserStore((s) => s.setDomains);
  const [selected, setSelected] = useState<Domain[]>([]);

  useEffect(() => {
    analytics.track('onboarding_started');
  }, []);

  const toggle = (id: Domain) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const handleContinue = () => {
    analytics.track('domains_selected', { domains: selected });
    setDomains(selected);
    router.push('/(onboarding)/assessment');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.content}>
        <StepIndicator current={1} total={3} />
        <Text variant="heading.xl">What's your 20%?</Text>
        <Text
          variant="body.lg"
          color={colors.textSecondary}
          style={styles.subtitle}
        >
          Pick the domains you want to focus on. You can change these later.
        </Text>
        <View style={styles.cards}>
          {DOMAINS.map((domain, i) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              selected={selected.includes(domain.id)}
              onToggle={() => toggle(domain.id)}
              index={i}
            />
          ))}
        </View>
      </View>
      <View style={styles.bottom}>
        <Button
          variant="primary"
          label="Continue"
          onPress={handleContinue}
          fullWidth
          disabled={selected.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  cards: {
    marginTop: spacing['2xl'],
    gap: spacing.md,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
});
