import type { DayPlan, DayActivity, GymPlan, RunPlan, PlanInput } from '@/types/plan';
import type { WorkoutTemplate, WorkoutExercise, TargetSet } from '@/types/workout';
import type { RunTemplate } from '@/types/run';
import type { NutritionPlan, NutritionGoal } from '@/types/nutrition';
import type { EquipmentAccess, FitnessLevel, RunningLevel } from '@/types/user';

import { exercises } from '@/data/exercises';
import {
  toRunTemplate,
  walkRunProgression,
  easyRunTemplate,
  tempoRunTemplate,
  intervalTemplate,
} from '@/data/runTemplates';
import type { NutritionRule, NutritionTemplate } from '@/data/nutritionRules';
import {
  fatLossTemplate,
  muscleBuildTemplate,
  maintenanceTemplate,
} from '@/data/nutritionRules';
import {
  calculateTDEE,
  calculateCalorieTarget,
  type ActivityLevel,
} from '@/utils/calculations';

// ── Generated plan types ────────────────────────────────────────────────────

export interface GeneratedGymPlan extends GymPlan {
  exerciseIds: string[];
  weeklyVolumePerMuscle: Record<string, number>;
}

export interface GeneratedRunPlan extends RunPlan {
  currentWeek: number;
}

export interface GeneratedNutritionPlan extends NutritionPlan {
  template: NutritionGoal;
  rules: NutritionRule[];
  hasFullStats: boolean;
}

export interface GeneratedPlan {
  weeklySchedule: DayPlan[];
  gymPlan?: GeneratedGymPlan;
  runPlan?: GeneratedRunPlan;
  nutritionPlan?: GeneratedNutritionPlan;
  totalCitations: number;
}

// ── Equipment substitution ──────────────────────────────────────────────────

function resolveExercise(exerciseId: string, equipment: EquipmentAccess): string {
  if (equipment === 'full_gym') return exerciseId;

  const ex = exercises[exerciseId];
  if (!ex) return exerciseId;

  const allowed: Set<string> =
    equipment === 'dumbbells'
      ? new Set(['dumbbell', 'bodyweight'])
      : new Set(['bodyweight']);

  if (allowed.has(ex.equipment)) return exerciseId;

  const preferred = equipment === 'dumbbells' ? 'dumbbell' : 'bodyweight';

  const sorted = ex.alternatives
    .map((altId) => exercises[altId])
    .filter((alt): alt is NonNullable<typeof alt> => alt != null && allowed.has(alt.equipment))
    .sort((a, b) => {
      if (a.equipment === preferred && b.equipment !== preferred) return -1;
      if (b.equipment === preferred && a.equipment !== preferred) return 1;
      return 0;
    });

  return sorted.length > 0 ? sorted[0].id : exerciseId;
}

/** Check if an exercise can be resolved to a compatible equipment type */
function canResolve(exerciseId: string, equipment: EquipmentAccess): boolean {
  if (equipment === 'full_gym') return true;

  const resolved = resolveExercise(exerciseId, equipment);
  const resolvedEx = exercises[resolved];
  if (!resolvedEx) return false;

  const allowed: Set<string> =
    equipment === 'dumbbells'
      ? new Set(['dumbbell', 'bodyweight'])
      : new Set(['bodyweight']);

  return allowed.has(resolvedEx.equipment);
}

// ── Workout exercise builder ────────────────────────────────────────────────

function makeWorkoutExercise(
  exerciseId: string,
  sets: number,
  reps: [number, number],
  equipment: EquipmentAccess,
): WorkoutExercise {
  const resolvedId = resolveExercise(exerciseId, equipment);
  const ex = exercises[resolvedId];
  const restSeconds = ex?.restSeconds ?? 120;

  const targetSets: TargetSet[] = Array.from({ length: sets }, () => ({
    targetReps: reps,
    suggestedWeightKg: null,
    restSeconds,
  }));

  return { exerciseId: resolvedId, sets: targetSets };
}

// ── Gym duration estimator ──────────────────────────────────────────────────

function estimateGymDuration(workoutExercises: WorkoutExercise[]): number {
  let totalSeconds = 300; // 5 min warmup
  for (const we of workoutExercises) {
    for (const set of we.sets) {
      totalSeconds += 45 + set.restSeconds; // execution + rest
    }
  }
  return Math.round(totalSeconds / 60);
}

// ── Gym plan generation ─────────────────────────────────────────────────────

function generateGymPlan(
  gymDays: 2 | 3 | 4,
  equipment: EquipmentAccess,
  fitnessLevel: FitnessLevel,
): GeneratedGymPlan {
  const isBeginnerSets = fitnessLevel === 'beginner';
  const mainSets = isBeginnerSets ? 2 : 3;
  const optionalSets = 2;

  const templates: WorkoutTemplate[] =
    gymDays === 4
      ? build4DayTemplates(mainSets, optionalSets, equipment, isBeginnerSets)
      : build3DayTemplates(mainSets, equipment, isBeginnerSets); // 2-day reuses same A/B templates

  // Collect all exercise IDs and compute weekly volume
  const exerciseIds: string[] = [];
  const weeklyVolumePerMuscle: Record<string, number> = {};

  // For volume calculation, account for how many times each template is used per week
  const weeklyTemplateUses =
    gymDays === 4
      ? [1, 1, 1, 1] // each used 1x per week
      : gymDays === 3
        ? [2, 1] // A used 2x, B used 1x (A/B/A pattern)
        : [1, 1]; // 2-day: each template used 1x per week

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    const timesPerWeek = weeklyTemplateUses[i];

    for (const we of template.exercises) {
      if (!exerciseIds.includes(we.exerciseId)) {
        exerciseIds.push(we.exerciseId);
      }

      const ex = exercises[we.exerciseId];
      if (ex) {
        const setsInSession = we.sets.length;
        const weeklySets = setsInSession * timesPerWeek;
        for (const muscle of ex.primaryMuscles) {
          weeklyVolumePerMuscle[muscle] =
            (weeklyVolumePerMuscle[muscle] ?? 0) + weeklySets;
        }
      }
    }
  }

  return {
    type: gymDays === 2 ? 'gym_2day' : gymDays === 3 ? 'gym_3day' : 'gym_4day',
    templates,
    exerciseIds,
    weeklyVolumePerMuscle,
  };
}

function build3DayTemplates(
  mainSets: number,
  equipment: EquipmentAccess,
  isBeginner: boolean,
): WorkoutTemplate[] {
  // Template A: Squat, Bench, Row
  const exercisesA: WorkoutExercise[] = [
    makeWorkoutExercise('barbell_squat', mainSets, [6, 8], equipment),
    makeWorkoutExercise('bench_press', mainSets, [6, 8], equipment),
    makeWorkoutExercise('barbell_row', mainSets, [8, 10], equipment),
  ];

  // Template B: RDL, OHP, Pull-Up/Lat Pulldown
  const pullExerciseId =
    equipment === 'full_gym' ? 'pullup' : resolveExercise('pullup', equipment);
  const exercisesB: WorkoutExercise[] = [
    makeWorkoutExercise('romanian_deadlift', mainSets, [8, 10], equipment),
    makeWorkoutExercise('overhead_press', mainSets, [6, 8], equipment),
    makeWorkoutExercise(pullExerciseId, mainSets, [6, 10], equipment),
  ];

  const templateA: WorkoutTemplate = {
    id: 'full_body_a',
    name: 'Full Body A',
    type: 'full_body_a',
    exercises: exercisesA,
    estimatedDurationMin: estimateGymDuration(exercisesA),
  };

  const templateB: WorkoutTemplate = {
    id: 'full_body_b',
    name: 'Full Body B',
    type: 'full_body_b',
    exercises: exercisesB,
    estimatedDurationMin: estimateGymDuration(exercisesB),
  };

  return [templateA, templateB];
}

function build4DayTemplates(
  mainSets: number,
  optionalSets: number,
  equipment: EquipmentAccess,
  isBeginner: boolean,
): WorkoutTemplate[] {
  // Lower A: Squat, RDL, [optional] Calf Raise
  const lowerAExercises: WorkoutExercise[] = [
    makeWorkoutExercise('barbell_squat', mainSets, [6, 8], equipment),
    makeWorkoutExercise('romanian_deadlift', mainSets, [8, 10], equipment),
  ];
  if (!isBeginner && canResolve('calf_raise', equipment)) {
    lowerAExercises.push(
      makeWorkoutExercise('calf_raise', optionalSets, [12, 15], equipment),
    );
  }

  // Upper A: Bench, Row, [optional] Dip
  const upperAExercises: WorkoutExercise[] = [
    makeWorkoutExercise('bench_press', mainSets, [6, 8], equipment),
    makeWorkoutExercise('barbell_row', mainSets, [8, 10], equipment),
  ];
  if (!isBeginner && canResolve('dip', equipment)) {
    upperAExercises.push(
      makeWorkoutExercise('dip', optionalSets, [8, 12], equipment),
    );
  }

  // Lower B: Deadlift, Leg Press, [optional] Calf Raise
  const lowerBExercises: WorkoutExercise[] = [
    makeWorkoutExercise('conventional_deadlift', mainSets, [5, 6], equipment),
    makeWorkoutExercise('leg_press', mainSets, [8, 10], equipment),
  ];
  if (!isBeginner && canResolve('calf_raise', equipment)) {
    lowerBExercises.push(
      makeWorkoutExercise('calf_raise', optionalSets, [12, 15], equipment),
    );
  }

  // Upper B: OHP, Pull-Up, [optional] accessory
  const upperBExercises: WorkoutExercise[] = [
    makeWorkoutExercise('overhead_press', mainSets, [6, 8], equipment),
    makeWorkoutExercise('pullup', mainSets, [6, 10], equipment),
  ];
  if (!isBeginner && canResolve('dip', equipment)) {
    upperBExercises.push(
      makeWorkoutExercise('dip', optionalSets, [10, 12], equipment),
    );
  }

  const lowerA: WorkoutTemplate = {
    id: 'lower_a',
    name: 'Lower Body A',
    type: 'lower_a',
    exercises: lowerAExercises,
    estimatedDurationMin: estimateGymDuration(lowerAExercises),
  };

  const upperA: WorkoutTemplate = {
    id: 'upper_a',
    name: 'Upper Body A',
    type: 'upper_a',
    exercises: upperAExercises,
    estimatedDurationMin: estimateGymDuration(upperAExercises),
  };

  const lowerB: WorkoutTemplate = {
    id: 'lower_b',
    name: 'Lower Body B',
    type: 'lower_b',
    exercises: lowerBExercises,
    estimatedDurationMin: estimateGymDuration(lowerBExercises),
  };

  const upperB: WorkoutTemplate = {
    id: 'upper_b',
    name: 'Upper Body B',
    type: 'upper_b',
    exercises: upperBExercises,
    estimatedDurationMin: estimateGymDuration(upperBExercises),
  };

  return [lowerA, upperA, lowerB, upperB];
}

// ── Run plan generation ─────────────────────────────────────────────────────

function distributeTrainingDays(
  totalDays: 3 | 4 | 5,
  hasGym: boolean,
  hasRunning: boolean,
): { gymDays: 0 | 2 | 3 | 4; runDays: 0 | 1 | 2 | 3 } {
  if (hasGym && hasRunning) {
    if (totalDays === 3) return { gymDays: 2, runDays: 1 };
    if (totalDays === 4) return { gymDays: 3, runDays: 1 };
    return { gymDays: 3, runDays: 2 }; // 5
  }
  if (hasGym) return { gymDays: totalDays as 3 | 4, runDays: 0 };
  if (hasRunning) return { gymDays: 0, runDays: totalDays <= 3 ? (totalDays as 2 | 3) : 3 };
  return { gymDays: 0, runDays: 0 };
}

function generateRunPlan(
  runningLevel: RunningLevel,
  numRunDays: 1 | 2 | 3,
  fitnessLevel: FitnessLevel,
): GeneratedRunPlan {
  let templates: RunTemplate[];
  let currentWeek: number;

  if (runningLevel === 'cant_run_20min') {
    // Walk/run beginner progression, week 1
    const week1 = walkRunProgression[0];
    const sessions = week1.sessions.slice(0, numRunDays);
    templates = sessions.map(toRunTemplate);
    currentWeek = 1;
  } else {
    // Standard 80/20: easy runs + quality session
    const qualitySession =
      fitnessLevel === 'advanced' ? intervalTemplate : tempoRunTemplate;

    if (numRunDays === 3) {
      templates = [
        toRunTemplate(easyRunTemplate),
        toRunTemplate(easyRunTemplate),
        toRunTemplate(qualitySession),
      ];
    } else if (numRunDays === 2) {
      templates = [
        toRunTemplate(easyRunTemplate),
        toRunTemplate(qualitySession),
      ];
    } else {
      // 1 day: single easy run
      templates = [
        toRunTemplate(easyRunTemplate),
      ];
    }
    currentWeek = 0;
  }

  return {
    type: numRunDays === 3 ? 'run_3day' : numRunDays === 2 ? 'run_2day' : 'run_1day',
    templates,
    currentWeek,
  };
}

// ── Nutrition plan generation ───────────────────────────────────────────────

const NUTRITION_TEMPLATES: Record<NutritionGoal, NutritionTemplate> = {
  fat_loss: fatLossTemplate,
  muscle_build: muscleBuildTemplate,
  maintenance: maintenanceTemplate,
};

const PALM_GRAMS = 27.5; // 1 palm ≈ 25-30g protein

function generateNutritionPlan(
  input: PlanInput,
  activeDaysPerWeek: number,
): GeneratedNutritionPlan {
  const template = NUTRITION_TEMPLATES[input.goal];
  const hasFullStats = !!(input.age && input.weightKg && input.heightCm && input.sex);

  let tdee = 0;
  let calorieTarget = 0;
  let proteinTargetG = 0;
  let proteinPortions: number;

  if (hasFullStats) {
    // Derive activity level from total active days
    const activityLevel: ActivityLevel =
      activeDaysPerWeek >= 5
        ? 'very_active'
        : activeDaysPerWeek >= 3
          ? 'moderate'
          : activeDaysPerWeek >= 1
            ? 'light'
            : 'sedentary';

    tdee = calculateTDEE({
      weightKg: input.weightKg!,
      heightCm: input.heightCm!,
      age: input.age!,
      sex: input.sex!,
      activityLevel,
    });

    calorieTarget = calculateCalorieTarget(tdee, input.goal);

    const proteinPerKg =
      (template.proteinPerKg.min + template.proteinPerKg.max) / 2;
    proteinTargetG = Math.round(proteinPerKg * input.weightKg!);
    proteinPortions = Math.round(proteinTargetG / PALM_GRAMS);
  } else {
    // Fallback: use template default portions
    proteinPortions = template.dailyPortions.protein;
  }

  const dailyRules = template.rules.map((r) => r.rule);

  return {
    goal: input.goal,
    tdee,
    calorieTarget,
    proteinTargetG,
    proteinPortions,
    dailyRules,
    template: input.goal,
    rules: template.rules,
    hasFullStats,
  };
}

// ── Weekly schedule builder ─────────────────────────────────────────────────

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SCHEDULE_LAYOUTS: Record<string, DayActivity[]> = {
  gym2_run1: ['gym', 'rest', 'run', 'rest', 'gym', 'rest', 'rest'],
  gym3_run0: ['gym', 'rest', 'gym', 'rest', 'gym', 'rest', 'rest'],
  gym3_run1: ['gym', 'rest', 'gym', 'run', 'gym', 'rest', 'rest'],
  gym3_run2: ['gym', 'run', 'gym', 'run', 'gym', 'rest', 'rest'],
  gym3_run3: ['gym', 'run', 'gym', 'run', 'gym', 'run', 'rest'],
  gym4_run0: ['gym', 'gym', 'rest', 'gym', 'gym', 'rest', 'rest'],
  gym4_run2: ['gym', 'gym', 'run', 'gym', 'gym', 'run', 'rest'],
  gym0_run2: ['run', 'rest', 'run', 'rest', 'rest', 'rest', 'rest'],
  gym0_run3: ['run', 'rest', 'run', 'rest', 'run', 'rest', 'rest'],
};

// Template assignment order for gym days within a layout
const GYM_2DAY_SEQUENCE = [0, 1]; // A, B
const GYM_3DAY_SEQUENCE = [0, 1, 0]; // A, B, A
const GYM_4DAY_SEQUENCE = [0, 1, 2, 3]; // lowerA, upperA, lowerB, upperB

function buildWeeklySchedule(
  gymTemplates: WorkoutTemplate[] | null,
  runTemplates: RunTemplate[] | null,
  gymDays: number,
  runDays: number,
  hasNutrition: boolean,
): DayPlan[] {
  // Nutrition-only plan
  if (gymDays === 0 && runDays === 0) {
    return DAY_NAMES.map((_, dayOfWeek): DayPlan => ({
      dayOfWeek,
      activity: 'nutrition_only',
      estimatedDurationMin: 0,
      label: 'Nutrition Focus',
    }));
  }

  const key = `gym${gymDays}_run${runDays}`;
  const layout = SCHEDULE_LAYOUTS[key] ?? SCHEDULE_LAYOUTS['gym3_run0'];

  const gymSequence = gymDays === 4 ? GYM_4DAY_SEQUENCE : gymDays === 2 ? GYM_2DAY_SEQUENCE : GYM_3DAY_SEQUENCE;
  let gymIdx = 0;
  let runIdx = 0;

  return layout.map((activity, dayOfWeek): DayPlan => {
    if (activity === 'gym' && gymTemplates) {
      const templateIdx = gymSequence[gymIdx % gymSequence.length];
      const template = gymTemplates[templateIdx];
      gymIdx++;
      return {
        dayOfWeek,
        activity: 'gym',
        workoutTemplate: template,
        estimatedDurationMin: template.estimatedDurationMin,
        label: template.name,
      };
    }

    if (activity === 'run' && runTemplates) {
      const template = runTemplates[runIdx % runTemplates.length];
      runIdx++;
      return {
        dayOfWeek,
        activity: 'run',
        runTemplate: template,
        estimatedDurationMin: template.targetDurationMin,
        label: template.name,
      };
    }

    return {
      dayOfWeek,
      activity: 'rest',
      estimatedDurationMin: 0,
      label: 'Rest Day',
    };
  });
}

// ── Citation counting ───────────────────────────────────────────────────────

function countCitations(
  gymPlan: GeneratedGymPlan | undefined,
  nutritionRules: NutritionRule[] | undefined,
): number {
  const citationIds = new Set<string>();

  // Collect from exercises
  if (gymPlan) {
    for (const id of gymPlan.exerciseIds) {
      const ex = exercises[id];
      if (ex) {
        for (const citId of ex.citationIds) {
          citationIds.add(citId);
        }
      }
    }
  }

  // Collect from nutrition rules
  if (nutritionRules) {
    for (const rule of nutritionRules) {
      if (rule.citationId && rule.citationId !== 'general') {
        citationIds.add(rule.citationId);
      }
    }
  }

  return citationIds.size;
}

// ── Main export ─────────────────────────────────────────────────────────────

export function generatePlan(input: PlanInput): GeneratedPlan {
  console.log('[generatePlan] input:', JSON.stringify(input, null, 2));

  const hasGym = input.domains.includes('gym');
  const hasRunning = input.domains.includes('running');
  const hasNutrition = input.domains.includes('nutrition');

  const equipmentAccess: EquipmentAccess = input.equipmentAccess ?? 'full_gym';
  const runningLevel: RunningLevel = input.runningLevel ?? 'cant_run_20min';

  // Determine gym/run day distribution
  let gymDaysPerWeek: 0 | 2 | 3 | 4;
  let numRunDays: 0 | 1 | 2 | 3;

  if (input.trainingDaysPerWeek && hasGym && hasRunning) {
    // Multi-domain: use total training days distribution
    const dist = distributeTrainingDays(input.trainingDaysPerWeek, hasGym, hasRunning);
    gymDaysPerWeek = dist.gymDays;
    numRunDays = dist.runDays;
  } else {
    // Single-domain fallback
    gymDaysPerWeek = hasGym ? (input.gymDaysPerWeek ?? 3) as 0 | 3 | 4 : 0;
    numRunDays = hasRunning ? (gymDaysPerWeek === 0 ? 3 : 2) as 0 | 2 | 3 : 0;
  }

  console.log('[generatePlan] gymDaysPerWeek:', gymDaysPerWeek, 'numRunDays:', numRunDays);

  // Gym plan
  let gymPlan: GeneratedGymPlan | undefined;
  if (hasGym && gymDaysPerWeek > 0) {
    gymPlan = generateGymPlan(
      gymDaysPerWeek as 2 | 3 | 4,
      equipmentAccess,
      input.fitnessLevel,
    );
  }

  // Run plan
  let runPlan: GeneratedRunPlan | undefined;
  if (hasRunning && numRunDays > 0) {
    runPlan = generateRunPlan(runningLevel, numRunDays as 1 | 2 | 3, input.fitnessLevel);
  }

  // Nutrition plan
  let nutritionPlan: GeneratedNutritionPlan | undefined;
  if (hasNutrition) {
    const activeDays = gymDaysPerWeek + numRunDays;
    nutritionPlan = generateNutritionPlan(input, activeDays);
  }

  // Weekly schedule
  const weeklySchedule = buildWeeklySchedule(
    gymPlan?.templates ?? null,
    runPlan?.templates ?? null,
    gymDaysPerWeek,
    numRunDays,
    hasNutrition,
  );

  console.log('[generatePlan] weeklySchedule:', weeklySchedule.map(d => `${d.label}: ${d.activity}`));

  // Citation count
  const totalCitations = countCitations(gymPlan, nutritionPlan?.rules);

  return {
    weeklySchedule,
    gymPlan,
    runPlan,
    nutritionPlan,
    totalCitations,
  };
}
