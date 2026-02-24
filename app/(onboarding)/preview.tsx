import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/useUserStore';

export default function PreviewScreen() {
  const router = useRouter();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="heading.xl">Your 20% Plan</Text>
      </View>
      <View style={styles.bottom}>
        <Button
          variant="primary"
          label="Start My Plan"
          onPress={() => {
            completeOnboarding();
            router.replace('/(tabs)/today');
          }}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
