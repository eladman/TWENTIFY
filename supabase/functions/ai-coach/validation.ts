// Validation for AI-generated plan output

// Valid exercise IDs from src/data/exercises.ts
const VALID_EXERCISE_IDS = new Set([
  'barbell_squat', 'conventional_deadlift', 'bench_press', 'overhead_press',
  'barbell_row', 'pullup', 'romanian_deadlift', 'dip', 'leg_press',
  'lat_pulldown', 'calf_raise', 'db_goblet_squat', 'db_romanian_deadlift',
  'db_bench_press', 'db_shoulder_press', 'db_row', 'db_lunges',
  'lateral_raise', 'bicep_curl', 'tricep_pushdown', 'tricep_extension',
  'face_pull', 'leg_curl', 'leg_extension', 'incline_db_press',
  'cable_row', 'hammer_curl', 'bulgarian_split_squat',
  'bw_squat', 'bw_pushup', 'bw_pike_pushup', 'bw_inverted_row',
  'bw_single_leg_deadlift', 'bw_pullup', 'bw_glute_bridge', 'bw_dip',
]);

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface PlanInput {
  weeklySchedule?: unknown[];
  gymPlan?: { type?: string; templates?: unknown[] };
  runPlan?: { type?: string; templates?: unknown[] };
  nutritionPlan?: {
    goal?: string;
    tdee?: number;
    calorieTarget?: number;
    proteinTargetG?: number;
    proteinPortions?: number;
    dailyRules?: string[];
  };
}

export function validatePlan(plan: PlanInput): ValidationResult {
  const errors: string[] = [];

  // Validate weekly schedule
  if (!plan.weeklySchedule || !Array.isArray(plan.weeklySchedule)) {
    errors.push('weeklySchedule is required and must be an array');
  } else if (plan.weeklySchedule.length !== 7) {
    errors.push(`weeklySchedule must have 7 days, got ${plan.weeklySchedule.length}`);
  }

  // Validate exercise IDs in gym plan
  if (plan.gymPlan?.templates) {
    for (const template of plan.gymPlan.templates as Array<{ exercises?: Array<{ exerciseId?: string }> }>) {
      if (template.exercises) {
        for (const exercise of template.exercises) {
          if (exercise.exerciseId && !VALID_EXERCISE_IDS.has(exercise.exerciseId)) {
            errors.push(`Invalid exercise ID: "${exercise.exerciseId}"`);
          }
        }
      }
    }
  }

  // Validate exercise IDs in weekly schedule workout templates
  if (plan.weeklySchedule) {
    for (const day of plan.weeklySchedule as Array<{ workoutTemplate?: { exercises?: Array<{ exerciseId?: string }> } }>) {
      if (day.workoutTemplate?.exercises) {
        for (const exercise of day.workoutTemplate.exercises) {
          if (exercise.exerciseId && !VALID_EXERCISE_IDS.has(exercise.exerciseId)) {
            errors.push(`Invalid exercise ID in schedule: "${exercise.exerciseId}"`);
          }
        }
      }
    }
  }

  // Validate nutrition plan ranges
  if (plan.nutritionPlan) {
    const n = plan.nutritionPlan;
    if (n.calorieTarget && (n.calorieTarget < 800 || n.calorieTarget > 6000)) {
      errors.push(`Calorie target out of range: ${n.calorieTarget} (expected 800-6000)`);
    }
    if (n.proteinTargetG && (n.proteinTargetG < 30 || n.proteinTargetG > 400)) {
      errors.push(`Protein target out of range: ${n.proteinTargetG}g (expected 30-400g)`);
    }
    if (n.goal && !['fat_loss', 'muscle_build', 'maintenance'].includes(n.goal)) {
      errors.push(`Invalid nutrition goal: "${n.goal}"`);
    }
  }

  return { valid: errors.length === 0, errors };
}
