import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { screenPadding } from '@/theme/spacing';

export default function PreviewScreen() {
  return (
    <View style={styles.container}>
      <Text variant="heading.xl">Your 20% Plan</Text>
      <Text variant="body.md" color="secondary" style={styles.subtitle}>
        Here's what the science says you need.
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
