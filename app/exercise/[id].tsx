import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { screenPadding } from '@/theme/spacing';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text variant="heading.xl">Exercise Detail</Text>
        <Text variant="body.md" color="secondary" style={styles.subtitle}>
          Research citations and form cues for {id} will appear here.
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenPadding.horizontal,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
});
