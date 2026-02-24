import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default function DomainsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="heading.xl">Choose Your Domains</Text>
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
