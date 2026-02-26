import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { screenPadding } from '@/theme/spacing';

export default function TodayScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text variant="heading.xl">Today's 20%</Text>
        <Text variant="body.md" color={colors.textSecondary} style={styles.subtitle}>
          Your plan for today will appear here.
        </Text>
        <Button
          variant="secondary"
          label="Card Test"
          onPress={() => router.push('/card-test')}
          style={styles.devButton}
        />
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
    paddingTop: screenPadding.top,
  },
  subtitle: {
    marginTop: 8,
  },
  devButton: {
    marginTop: 24,
  },
});
