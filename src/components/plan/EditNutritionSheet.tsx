import { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import type { NutritionPlan } from '@/types/nutrition';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

interface EditNutritionSheetProps {
  visible: boolean;
  onDismiss: () => void;
  nutritionPlan: NutritionPlan | null;
  onSave: (updated: NutritionPlan) => void;
}

export function EditNutritionSheet({
  visible,
  onDismiss,
  nutritionPlan,
  onSave,
}: EditNutritionSheetProps) {
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  useEffect(() => {
    if (nutritionPlan) {
      setCalories(String(nutritionPlan.calorieTarget));
      setProtein(String(nutritionPlan.proteinTargetG));
    }
  }, [nutritionPlan]);

  const handleSave = () => {
    if (!nutritionPlan) return;
    const cal = parseInt(calories, 10) || nutritionPlan.calorieTarget;
    const prot = parseInt(protein, 10) || nutritionPlan.proteinTargetG;
    onSave({
      ...nutritionPlan,
      calorieTarget: cal,
      proteinTargetG: prot,
      proteinPortions: Math.round(prot / 30),
    });
  };

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss} snapPoints={['50%']}>
      <View style={styles.content}>
        <Text variant="heading.md" style={styles.title}>Edit Nutrition Targets</Text>

        <Text variant="caption" color={colors.textMuted} style={styles.label}>
          Calorie target (kcal)
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={calories}
          onChangeText={setCalories}
          selectTextOnFocus
        />

        <Text variant="caption" color={colors.textMuted} style={styles.label}>
          Protein target (grams)
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={protein}
          onChangeText={setProtein}
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
    marginBottom: spacing.lg,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
