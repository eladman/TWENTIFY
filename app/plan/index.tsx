import { useState } from 'react';
import { ScrollView, Pressable, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { GymPlanSection } from '@/components/plan/GymPlanSection';
import { RunPlanSection } from '@/components/plan/RunPlanSection';
import { NutritionPlanSection } from '@/components/plan/NutritionPlanSection';
import { EditExerciseSheet } from '@/components/plan/EditExerciseSheet';
import { EditRunSheet } from '@/components/plan/EditRunSheet';
import { EditNutritionSheet } from '@/components/plan/EditNutritionSheet';
import { useUserStore } from '@/stores/useUserStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { syncPlan } from '@/services/sync';
import { toast } from '@/utils/toast';
import type { WorkoutExercise } from '@/types/workout';
import type { RunTemplate } from '@/types/run';
import type { NutritionPlan } from '@/types/nutrition';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';

type EditTarget =
  | { type: 'exercise'; templateIdx: number; exerciseIdx: number }
  | { type: 'run'; templateIdx: number }
  | { type: 'nutrition' }
  | null;

export default function PlanScreen() {
  const router = useRouter();
  const domains = useUserStore((s) => s.domains);
  const gymPlan = usePlanStore((s) => s.gymPlan);
  const runPlan = usePlanStore((s) => s.runPlan);
  const nutritionPlan = usePlanStore((s) => s.nutritionPlan);
  const weeklySchedule = usePlanStore((s) => s.weeklySchedule);

  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  const hasGym = domains.includes('gym');
  const hasRunning = domains.includes('running');
  const hasNutrition = domains.includes('nutrition');

  // ── Gym save ──
  const handleSaveExercise = (updated: WorkoutExercise) => {
    if (!gymPlan || editTarget?.type !== 'exercise') return;
    const { templateIdx, exerciseIdx } = editTarget;

    const newTemplates = gymPlan.templates.map((t, tIdx) => {
      if (tIdx !== templateIdx) return t;
      const newExercises = t.exercises.map((e, eIdx) =>
        eIdx === exerciseIdx ? updated : e,
      );
      return { ...t, exercises: newExercises };
    });

    const updatedGymPlan = { ...gymPlan, templates: newTemplates };
    usePlanStore.getState().setGymPlan(updatedGymPlan);

    // Update weeklySchedule entries that reference this template
    const templateId = gymPlan.templates[templateIdx].id;
    const updatedSchedule = weeklySchedule.map((day) => {
      if (day.workoutTemplate?.id === templateId) {
        return { ...day, workoutTemplate: newTemplates[templateIdx] };
      }
      return day;
    });
    usePlanStore.getState().setWeeklySchedule(updatedSchedule);

    void syncPlan();
    toast.success('Plan updated');
    setEditTarget(null);
  };

  // ── Run save ──
  const handleSaveRun = (updated: RunTemplate) => {
    if (!runPlan || editTarget?.type !== 'run') return;
    const { templateIdx } = editTarget;

    const newTemplates = runPlan.templates.map((t, tIdx) =>
      tIdx === templateIdx ? updated : t,
    );

    const updatedRunPlan = { ...runPlan, templates: newTemplates };
    usePlanStore.getState().setRunPlan(updatedRunPlan);

    // Update weeklySchedule
    const templateId = runPlan.templates[templateIdx].id;
    const updatedSchedule = weeklySchedule.map((day) => {
      if (day.runTemplate?.id === templateId) {
        return { ...day, runTemplate: newTemplates[templateIdx] };
      }
      return day;
    });
    usePlanStore.getState().setWeeklySchedule(updatedSchedule);

    void syncPlan();
    toast.success('Plan updated');
    setEditTarget(null);
  };

  // ── Nutrition save ──
  const handleSaveNutrition = (updated: NutritionPlan) => {
    usePlanStore.getState().setNutritionPlan(updated);
    void syncPlan();
    toast.success('Plan updated');
    setEditTarget(null);
  };

  // ── Derive the exercise being edited ──
  const editedExercise =
    editTarget?.type === 'exercise' && gymPlan
      ? gymPlan.templates[editTarget.templateIdx]?.exercises[editTarget.exerciseIdx] ?? null
      : null;

  const editedRunTemplate =
    editTarget?.type === 'run' && runPlan
      ? runPlan.templates[editTarget.templateIdx] ?? null
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text variant="body.lg" color={colors.accent}>← Back</Text>
        </Pressable>
        <Text variant="heading.lg">Your Plan</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {hasGym && gymPlan && (
          <GymPlanSection
            gymPlan={gymPlan}
            onEditExercise={(tIdx, eIdx) =>
              setEditTarget({ type: 'exercise', templateIdx: tIdx, exerciseIdx: eIdx })
            }
          />
        )}

        {hasRunning && runPlan && (
          <View style={styles.section}>
            <RunPlanSection
              runPlan={runPlan}
              onEditTemplate={(tIdx) =>
                setEditTarget({ type: 'run', templateIdx: tIdx })
              }
            />
          </View>
        )}

        {hasNutrition && nutritionPlan && (
          <View style={styles.section}>
            <NutritionPlanSection
              nutritionPlan={nutritionPlan}
              onEdit={() => setEditTarget({ type: 'nutrition' })}
            />
          </View>
        )}

        {!gymPlan && !runPlan && !nutritionPlan && (
          <Text variant="body.md" color={colors.textSecondary} align="center">
            No plan generated yet. Complete onboarding to get your plan.
          </Text>
        )}
      </ScrollView>

      {/* Edit sheets */}
      <EditExerciseSheet
        visible={editTarget?.type === 'exercise'}
        onDismiss={() => setEditTarget(null)}
        exercise={editedExercise}
        onSave={handleSaveExercise}
      />

      <EditRunSheet
        visible={editTarget?.type === 'run'}
        onDismiss={() => setEditTarget(null)}
        template={editedRunTemplate}
        onSave={handleSaveRun}
      />

      <EditNutritionSheet
        visible={editTarget?.type === 'nutrition'}
        onDismiss={() => setEditTarget(null)}
        nutritionPlan={nutritionPlan}
        onSave={handleSaveNutrition}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: spacing.md,
  },
  headerSpacer: {
    width: 50,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.md,
    paddingBottom: screenPadding.bottom + 20,
  },
  section: {
    marginTop: spacing['2xl'],
  },
});
