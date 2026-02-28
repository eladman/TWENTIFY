import { generatePlan } from '@/services/planGenerator';
import type { PlanInput } from '@/types/plan';
import { exercises } from '@/data/exercises';

// ── Helper: default full input ──────────────────────────────────────────────

const fullInput: PlanInput = {
  domains: ['gym', 'running', 'nutrition'],
  goal: 'fat_loss',
  fitnessLevel: 'intermediate',
  trainingDaysPerWeek: 5,
  equipmentAccess: 'full_gym',
  runningLevel: 'can_run_20min',
  age: 30,
  weightKg: 80,
  heightCm: 180,
  sex: 'male',
};

// ── Schedule correctness ────────────────────────────────────────────────────

describe('generatePlan – schedule', () => {
  test('returns 7 day plans (Mon-Sun)', () => {
    const plan = generatePlan(fullInput);
    expect(plan.weeklySchedule).toHaveLength(7);
    expect(plan.weeklySchedule.map((d) => d.dayOfWeek)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  test('3 gym + 2 run layout: gym,run,gym,run,gym,rest,rest', () => {
    const plan = generatePlan({ ...fullInput, runningLevel: 'can_run_20min' });
    const activities = plan.weeklySchedule.map((d) => d.activity);
    expect(activities).toEqual(['gym', 'run', 'gym', 'run', 'gym', 'rest', 'rest']);
  });

  test('gym+run 3 total days: 2 gym + 1 run', () => {
    const plan = generatePlan({
      ...fullInput,
      trainingDaysPerWeek: 3,
    });
    const activities = plan.weeklySchedule.map((d) => d.activity);
    expect(activities).toEqual(['gym', 'rest', 'run', 'rest', 'gym', 'rest', 'rest']);
  });

  test('gym+run 4 total days: 3 gym + 1 run', () => {
    const plan = generatePlan({
      ...fullInput,
      trainingDaysPerWeek: 4,
    });
    const activities = plan.weeklySchedule.map((d) => d.activity);
    expect(activities).toEqual(['gym', 'rest', 'gym', 'run', 'gym', 'rest', 'rest']);
  });

  test('gym only: gym,rest,gym,rest,gym,rest,rest', () => {
    const plan = generatePlan({
      domains: ['gym'],
      goal: 'muscle_build',
      fitnessLevel: 'intermediate',
      gymDaysPerWeek: 3,
      equipmentAccess: 'full_gym',
    });
    const activities = plan.weeklySchedule.map((d) => d.activity);
    expect(activities).toEqual(['gym', 'rest', 'gym', 'rest', 'gym', 'rest', 'rest']);
  });

  test('run only (beginner): run,rest,run,rest,run,rest,rest', () => {
    const plan = generatePlan({
      domains: ['running'],
      goal: 'maintenance',
      fitnessLevel: 'beginner',
      runningLevel: 'cant_run_20min',
    });
    const activities = plan.weeklySchedule.map((d) => d.activity);
    expect(activities).toEqual(['run', 'rest', 'run', 'rest', 'run', 'rest', 'rest']);
  });

  test('nutrition only: all nutrition_only', () => {
    const plan = generatePlan({
      domains: ['nutrition'],
      goal: 'fat_loss',
      fitnessLevel: 'beginner',
    });
    const activities = plan.weeklySchedule.map((d) => d.activity);
    expect(activities).toEqual(Array(7).fill('nutrition_only'));
  });

  test('gym days have workoutTemplate, run days have runTemplate', () => {
    const plan = generatePlan(fullInput);
    for (const day of plan.weeklySchedule) {
      if (day.activity === 'gym') {
        expect(day.workoutTemplate).toBeDefined();
        expect(day.estimatedDurationMin).toBeGreaterThan(0);
      }
      if (day.activity === 'run') {
        expect(day.runTemplate).toBeDefined();
        expect(day.estimatedDurationMin).toBeGreaterThan(0);
      }
      if (day.activity === 'rest') {
        expect(day.estimatedDurationMin).toBe(0);
      }
    }
  });
});

// ── Gym plan ────────────────────────────────────────────────────────────────

describe('generatePlan – gym', () => {
  test('3-day plan has 2 templates (A and B)', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
      gymDaysPerWeek: 3,
    });
    expect(plan.gymPlan).toBeDefined();
    expect(plan.gymPlan!.type).toBe('gym_3day');
    expect(plan.gymPlan!.templates).toHaveLength(2);
    expect(plan.gymPlan!.templates[0].name).toBe('Full Body A');
    expect(plan.gymPlan!.templates[1].name).toBe('Full Body B');
  });

  test('4-day plan has 4 templates', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
      gymDaysPerWeek: 4,
    });
    expect(plan.gymPlan).toBeDefined();
    expect(plan.gymPlan!.type).toBe('gym_4day');
    expect(plan.gymPlan!.templates).toHaveLength(4);
    expect(plan.gymPlan!.templates.map((t) => t.name)).toEqual([
      'Lower Body A',
      'Upper Body A',
      'Lower Body B',
      'Upper Body B',
    ]);
  });

  test('intermediate has 3 sets per main exercise', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
      fitnessLevel: 'intermediate',
    });
    const template = plan.gymPlan!.templates[0];
    for (const ex of template.exercises) {
      expect(ex.sets.length).toBe(3);
    }
  });

  test('beginner has 2 sets per exercise', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
      fitnessLevel: 'beginner',
    });
    const template = plan.gymPlan!.templates[0];
    for (const ex of template.exercises) {
      expect(ex.sets.length).toBe(2);
    }
  });

  test('beginner 4-day has no optional exercises', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
      fitnessLevel: 'beginner',
      gymDaysPerWeek: 4,
    });
    for (const template of plan.gymPlan!.templates) {
      // Beginners should have exactly 2 exercises per template
      expect(template.exercises.length).toBe(2);
    }
  });

  test('intermediate 4-day has optional exercises', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
      fitnessLevel: 'intermediate',
      gymDaysPerWeek: 4,
      equipmentAccess: 'full_gym',
    });
    // At least some templates should have 3 exercises
    const hasOptional = plan.gymPlan!.templates.some(
      (t) => t.exercises.length > 2,
    );
    expect(hasOptional).toBe(true);
  });

  test('exerciseIds is a flat unique list', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
    });
    const ids = plan.gymPlan!.exerciseIds;
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length); // unique
    for (const id of ids) {
      expect(exercises[id]).toBeDefined();
    }
  });

  test('weeklyVolumePerMuscle has positive values', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
    });
    const volume = plan.gymPlan!.weeklyVolumePerMuscle;
    expect(Object.keys(volume).length).toBeGreaterThan(0);
    for (const sets of Object.values(volume)) {
      expect(sets).toBeGreaterThan(0);
    }
  });
});

// ── Equipment substitution ──────────────────────────────────────────────────

describe('generatePlan – equipment', () => {
  test('full_gym uses barbell exercises', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
      equipmentAccess: 'full_gym',
    });
    const ids = plan.gymPlan!.exerciseIds;
    expect(ids).toContain('barbell_squat');
    expect(ids).toContain('bench_press');
  });

  test('dumbbells replaces barbell exercises', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
      equipmentAccess: 'dumbbells',
    });
    const ids = plan.gymPlan!.exerciseIds;
    // Should NOT have barbell exercises
    expect(ids).not.toContain('barbell_squat');
    expect(ids).not.toContain('bench_press');
    // Should have dumbbell alternatives
    expect(ids).toContain('db_goblet_squat');
    expect(ids).toContain('db_bench_press');
  });

  test('bodyweight replaces all with bodyweight exercises', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
      equipmentAccess: 'bodyweight',
    });
    const ids = plan.gymPlan!.exerciseIds;
    for (const id of ids) {
      const ex = exercises[id];
      expect(ex.equipment).toBe('bodyweight');
    }
  });
});

// ── Run plan ────────────────────────────────────────────────────────────────

describe('generatePlan – running', () => {
  test('beginner runner gets walk/run templates', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['running'],
      runningLevel: 'cant_run_20min',
    });
    expect(plan.runPlan).toBeDefined();
    expect(plan.runPlan!.currentWeek).toBe(1);
    expect(plan.runPlan!.templates.length).toBe(3);
    for (const t of plan.runPlan!.templates) {
      expect(t.type).toBe('walk_run');
    }
  });

  test('intermediate runner gets easy + tempo', () => {
    const plan = generatePlan({
      domains: ['running'],
      goal: 'maintenance',
      fitnessLevel: 'intermediate',
      runningLevel: 'can_run_20min',
    });
    expect(plan.runPlan!.currentWeek).toBe(0);
    const types = plan.runPlan!.templates.map((t) => t.type);
    expect(types).toContain('easy');
    expect(types).toContain('tempo');
  });

  test('advanced runner gets easy + intervals', () => {
    const plan = generatePlan({
      domains: ['running'],
      goal: 'maintenance',
      fitnessLevel: 'advanced',
      runningLevel: 'experienced',
    });
    const types = plan.runPlan!.templates.map((t) => t.type);
    expect(types).toContain('easy');
    expect(types).toContain('intervals');
  });

  test('gym+run 5 total days: 3 gym + 2 run', () => {
    const plan = generatePlan({
      domains: ['gym', 'running'],
      goal: 'muscle_build',
      fitnessLevel: 'intermediate',
      trainingDaysPerWeek: 5,
      runningLevel: 'cant_run_20min',
    });
    expect(plan.runPlan!.type).toBe('run_2day');
    expect(plan.runPlan!.templates).toHaveLength(2);
    expect(plan.gymPlan!.type).toBe('gym_3day');
  });
});

// ── Nutrition plan ──────────────────────────────────────────────────────────

describe('generatePlan – nutrition', () => {
  test('with full stats calculates TDEE and protein', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['nutrition'],
    });
    expect(plan.nutritionPlan).toBeDefined();
    expect(plan.nutritionPlan!.hasFullStats).toBe(true);
    expect(plan.nutritionPlan!.tdee).toBeGreaterThan(1500);
    expect(plan.nutritionPlan!.calorieTarget).toBeLessThan(plan.nutritionPlan!.tdee);
    expect(plan.nutritionPlan!.proteinTargetG).toBeGreaterThan(100);
    expect(plan.nutritionPlan!.proteinPortions).toBeGreaterThan(0);
  });

  test('without stats uses fallback', () => {
    const plan = generatePlan({
      domains: ['nutrition'],
      goal: 'fat_loss',
      fitnessLevel: 'beginner',
    });
    expect(plan.nutritionPlan!.hasFullStats).toBe(false);
    expect(plan.nutritionPlan!.tdee).toBe(0);
    expect(plan.nutritionPlan!.calorieTarget).toBe(0);
    expect(plan.nutritionPlan!.proteinTargetG).toBe(0);
    expect(plan.nutritionPlan!.proteinPortions).toBeGreaterThan(0); // from template defaults
  });

  test('nutrition plan has 5 daily rules', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['nutrition'],
    });
    expect(plan.nutritionPlan!.dailyRules).toHaveLength(5);
    for (const rule of plan.nutritionPlan!.dailyRules) {
      expect(typeof rule).toBe('string');
      expect(rule.length).toBeGreaterThan(0);
    }
  });

  test('nutrition plan has full NutritionRule objects', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['nutrition'],
    });
    expect(plan.nutritionPlan!.rules).toHaveLength(5);
    for (const rule of plan.nutritionPlan!.rules) {
      expect(rule.id).toBeTruthy();
      expect(rule.rule).toBeTruthy();
      expect(rule.why).toBeTruthy();
      expect(rule.citationId).toBeTruthy();
    }
  });

  test('calorie target reflects goal adjustment', () => {
    const fatLoss = generatePlan({
      ...fullInput,
      domains: ['nutrition'],
      goal: 'fat_loss',
    });
    const muscleBuild = generatePlan({
      ...fullInput,
      domains: ['nutrition'],
      goal: 'muscle_build',
    });
    expect(fatLoss.nutritionPlan!.calorieTarget).toBeLessThan(
      fatLoss.nutritionPlan!.tdee,
    );
    expect(muscleBuild.nutritionPlan!.calorieTarget).toBeGreaterThan(
      muscleBuild.nutritionPlan!.tdee,
    );
  });
});

// ── Citations ───────────────────────────────────────────────────────────────

describe('generatePlan – citations', () => {
  test('gym-only plan has citations from exercises', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['gym'],
    });
    expect(plan.totalCitations).toBeGreaterThan(0);
  });

  test('nutrition-only plan has citations from rules', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['nutrition'],
    });
    expect(plan.totalCitations).toBeGreaterThan(0);
  });

  test('full plan has more citations than single domain', () => {
    const gymOnly = generatePlan({ ...fullInput, domains: ['gym'] });
    const full = generatePlan(fullInput);
    expect(full.totalCitations).toBeGreaterThanOrEqual(gymOnly.totalCitations);
  });

  test('running-only plan has 0 citations (run sessions have empty citationIds)', () => {
    const plan = generatePlan({
      ...fullInput,
      domains: ['running'],
    });
    expect(plan.totalCitations).toBe(0);
  });
});

// ── Determinism ─────────────────────────────────────────────────────────────

describe('generatePlan – determinism', () => {
  test('same input produces identical output', () => {
    const plan1 = generatePlan(fullInput);
    const plan2 = generatePlan(fullInput);
    expect(JSON.stringify(plan1)).toBe(JSON.stringify(plan2));
  });
});

// ── Store compatibility ─────────────────────────────────────────────────────

describe('generatePlan – store compatibility', () => {
  test('result shape matches usePlanStore.setPlan expectations', () => {
    const plan = generatePlan(fullInput);

    // weeklySchedule is DayPlan[]
    expect(Array.isArray(plan.weeklySchedule)).toBe(true);

    // gymPlan has type and templates (GymPlan fields)
    expect(plan.gymPlan!.type).toMatch(/^gym_/);
    expect(Array.isArray(plan.gymPlan!.templates)).toBe(true);

    // runPlan has type and templates (RunPlan fields)
    expect(plan.runPlan!.type).toMatch(/^run_/);
    expect(Array.isArray(plan.runPlan!.templates)).toBe(true);

    // nutritionPlan has goal, tdee, calorieTarget, etc. (NutritionPlan fields)
    expect(plan.nutritionPlan!.goal).toBeTruthy();
    expect(typeof plan.nutritionPlan!.tdee).toBe('number');
    expect(typeof plan.nutritionPlan!.calorieTarget).toBe('number');
    expect(typeof plan.nutritionPlan!.proteinTargetG).toBe('number');
    expect(typeof plan.nutritionPlan!.proteinPortions).toBe('number');
    expect(Array.isArray(plan.nutritionPlan!.dailyRules)).toBe(true);
  });
});
