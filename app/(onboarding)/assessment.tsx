import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { screenPadding } from '@/theme/spacing';

export default function AssessmentScreen() {
  return (
    <View style={styles.container}>
      <Text variant="heading.xl">Quick Assessment</Text>
      <Text variant="body.md" color="secondary" style={styles.subtitle}>
        5 quick questions to build your plan.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenPadding.horizontal,
    backgroundColor: colors.background,
  },
  subtitle: {
    marginTop: 8,
  },
});
