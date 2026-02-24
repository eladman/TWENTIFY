import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { screenPadding } from '@/theme/spacing';

export default function DomainsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="heading.xl">Choose Your Domains</Text>
      <Text variant="body.md" color="secondary" style={styles.subtitle}>
        Pick the areas you want to focus on.
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
