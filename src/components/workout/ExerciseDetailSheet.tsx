import { ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getExercise, getAlternatives } from '@/data/exerciseBank';
import { getCitationsForExercise } from '@/data/citations';

interface ExerciseDetailSheetProps {
  exerciseId: string | null;
  visible: boolean;
  onDismiss: () => void;
}

export function ExerciseDetailSheet({
  exerciseId,
  visible,
  onDismiss,
}: ExerciseDetailSheetProps) {
  if (!exerciseId) return null;

  const exercise = getExercise(exerciseId);
  if (!exercise) return null;

  const citations = getCitationsForExercise(exerciseId);
  const alternatives = getAlternatives(exerciseId);

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss} snapPoints={['70%']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="heading.md" style={styles.title}>
          {exercise.name}
        </Text>

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
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
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
