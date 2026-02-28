import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { screenPadding } from '@/theme/spacing';
import { toast } from '@/utils/toast';

export default function TodayScreen() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

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
        <Button
          variant="secondary"
          label="Test Toast"
          onPress={() => toast.show('Set completed')}
          style={styles.devButton}
        />
        <Button
          variant="secondary"
          label="Test Success Toast"
          onPress={() => toast.success('Workout saved')}
          style={styles.devButton}
        />
        <Button
          variant="secondary"
          label="Test Error Toast"
          onPress={() => toast.error('Failed to sync')}
          style={styles.devButton}
        />
        <Button
          variant="secondary"
          label="Test Bottom Sheet"
          onPress={() => setSheetOpen(true)}
          style={styles.devButton}
        />
        <BottomSheet visible={sheetOpen} onDismiss={() => setSheetOpen(false)}>
          <View style={styles.sheetContent}>
            <Text variant="heading.md">Bottom Sheet Test</Text>
            <Text variant="body.md" color={colors.textSecondary} style={styles.subtitle}>
              Swipe down or tap backdrop to dismiss
            </Text>
          </View>
        </BottomSheet>
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
  sheetContent: {
    padding: 24,
  },
});
