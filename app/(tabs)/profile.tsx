import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { screenPadding } from '@/theme/spacing';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text variant="heading.xl">Profile</Text>
        <Text variant="body.md" color="secondary" style={styles.subtitle}>
          Your settings and account will appear here.
        </Text>
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
});
