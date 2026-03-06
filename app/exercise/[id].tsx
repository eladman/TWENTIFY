import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';
import { exercises, getAlternatives } from '@/data/exercises';
import { getCitationsForExercise } from '@/data/citations';
import { analytics } from '@/services/analytics';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const exercise = id ? exercises[id] : null;

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text variant="heading.md">Exercise not found</Text>
          <Pressable onPress={() => router.back()} style={styles.dismissBtn}>
            <Text variant="body.md" color={colors.accent}>
              Go back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const citations = getCitationsForExercise(exercise.id);
  const alternatives = getAlternatives(exercise.id);

  useEffect(() => {
    analytics.track('exercise_detail_opened', { exercise_id: id });
    citations.forEach((cit) => {
      analytics.track('citation_viewed', { citation_id: cit.id, from_screen: 'exercise_detail' });
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.dismissBtn}>
          <Text variant="body.md" color={colors.accent}>
            {'\u2190'} Back
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="heading.xl">{exercise.name}</Text>

        <Text variant="body.md" style={styles.section}>
          {exercise.instructions}
        </Text>

        {exercise.cues.length > 0 && (
          <View style={styles.section}>
            <Text variant="heading.sm">Cues</Text>
            {exercise.cues.map((cue, i) => (
              <Text
                key={i}
                variant="body.sm"
                color={colors.textSecondary}
                style={styles.cueItem}
              >
                {'\u2022'} {cue}
              </Text>
            ))}
          </View>
        )}

        {citations.length > 0 && (
          <View style={styles.section}>
            <Text variant="heading.sm">Research</Text>
            {citations.map((cit) => (
              <View key={cit.id} style={styles.citationItem}>
                <Text variant="caption" color={colors.textSecondary}>
                  {cit.authors} ({cit.year})
                </Text>
                <Text variant="body.sm">{cit.finding}</Text>
              </View>
            ))}
          </View>
        )}

        {alternatives.length > 0 && (
          <View style={styles.section}>
            <Text variant="heading.sm">Alternatives</Text>
            {alternatives.map((alt) => (
              <Text
                key={alt.id}
                variant="body.sm"
                color={colors.textSecondary}
                style={styles.altItem}
              >
                {'\u2022'} {alt.name}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenPadding.horizontal,
  },
  header: {
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: spacing.sm,
  },
  dismissBtn: {
    paddingVertical: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: screenPadding.horizontal,
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginTop: spacing.lg,
  },
  cueItem: {
    marginTop: spacing.xs,
  },
  citationItem: {
    marginTop: spacing.sm,
  },
  altItem: {
    marginTop: spacing.xs,
  },
});
