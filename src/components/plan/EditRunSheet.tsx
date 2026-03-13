import { useState, useEffect } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import type { RunTemplate } from '@/types/run';
import type { RunSessionType } from '@/types/run';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

const runTypes: { value: RunSessionType; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'intervals', label: 'Intervals' },
  { value: 'walk_run', label: 'Walk/Run' },
];

interface EditRunSheetProps {
  visible: boolean;
  onDismiss: () => void;
  template: RunTemplate | null;
  onSave: (updated: RunTemplate) => void;
}

export function EditRunSheet({
  visible,
  onDismiss,
  template,
  onSave,
}: EditRunSheetProps) {
  const [type, setType] = useState<RunSessionType>('easy');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (template) {
      setType(template.type);
      setDuration(String(template.targetDurationMin));
    }
  }, [template]);

  const handleSave = () => {
    if (!template) return;
    onSave({
      ...template,
      type,
      targetDurationMin: parseInt(duration, 10) || template.targetDurationMin,
    });
  };

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss} snapPoints={['50%']}>
      <View style={styles.content}>
        <Text variant="heading.md" style={styles.title}>
          {template?.name ?? 'Edit Run'}
        </Text>

        <Text variant="caption" color={colors.textMuted} style={styles.label}>
          Run type
        </Text>
        <View style={styles.typeRow}>
          {runTypes.map((rt) => (
            <Pressable
              key={rt.value}
              onPress={() => setType(rt.value)}
              style={[
                styles.pill,
                type === rt.value && styles.pillActive,
              ]}
            >
              <Text
                variant="body.sm"
                color={type === rt.value ? '#FFFFFF' : colors.textSecondary}
                style={{ fontFamily: 'DMSans_600SemiBold' }}
              >
                {rt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text variant="caption" color={colors.textMuted} style={styles.label}>
          Duration (minutes)
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={duration}
          onChangeText={setDuration}
          selectTextOnFocus
        />

        <Button
          variant="primary"
          label="Save Changes"
          onPress={handleSave}
          fullWidth
          style={styles.saveButton}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    marginBottom: spacing.xl,
  },
  label: {
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xs,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
