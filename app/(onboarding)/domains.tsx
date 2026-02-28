import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

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

export default function DomainsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <StepIndicator current={1} total={3} />
        <Text variant="heading.xl">Domain Selection</Text>
      </View>
      <View style={styles.bottom}>
        <Button
          variant="primary"
          label="Next"
          onPress={() => router.push('/(onboarding)/assessment')}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
});
