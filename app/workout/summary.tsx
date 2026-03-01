import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';

export default function WorkoutSummaryScreen() {
  const router = useRouter();

  const handleDone = () => {
    router.dismissAll();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.center}>
          <Text variant="heading.xl">Session Complete</Text>
          <Text variant="body.md" color={colors.textSecondary} style={styles.subtitle}>
            Workout summary will appear here.
          </Text>
        </View>

        <View style={styles.bottom}>
          <Button
            variant="primary"
            label="Done"
            onPress={handleDone}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: screenPadding.horizontal,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  bottom: {
    paddingBottom: spacing.xl,
  },
});
