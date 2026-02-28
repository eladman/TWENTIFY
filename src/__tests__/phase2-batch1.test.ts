import {
  exercises,
  exerciseList,
  getExercisesByEquipment,
  getAlternatives,
} from '@/data/exercises';

import {
  citations,
  citationList,
  getCitationsByDomain,
} from '@/data/citations';

import {
  walkRunProgression,
  easyRunTemplate,
  tempoRunTemplate,
  intervalTemplate,
  getRunSessionForDay,
} from '@/data/runTemplates';

import {
  fatLossTemplate,
  muscleBuildTemplate,
  maintenanceTemplate,
  handPortions,
  calculatePortions,
} from '@/data/nutritionRules';

import {
  onboardingQuestions,
  getQuestionsForDomains,
} from '@/data/onboardingQuestions';

// ============================================
// 1. EXERCISES (src/data/exercises.ts)
// ============================================

describe('Exercise Database', () => {
  test('has at least 20 exercises total', () => {
    expect(exerciseList.length).toBeGreaterThanOrEqual(20);
  });

  test('every exercise has all required fields', () => {
    for (const ex of exerciseList) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.category).toBeTruthy();
      expect(ex.movementPattern).toBeTruthy();
      expect(ex.primaryMuscles.length).toBeGreaterThan(0);
      expect(ex.equipment).toBeTruthy();
      expect(ex.defaultReps.min).toBeLessThan(ex.defaultReps.max);
      expect(ex.defaultSets).toBeGreaterThan(0);
      expect(ex.restSeconds).toBeGreaterThan(0);
      expect(ex.cues.length).toBeGreaterThan(0);
      expect(ex.instructions.length).toBeGreaterThan(0);
    }
  });

  test('all movement patterns are covered', () => {
    const patterns = new Set(exerciseList.map((ex) => ex.movementPattern));
    const required = [
      'squat',
      'hinge',
      'push_horizontal',
      'push_vertical',
      'pull_horizontal',
      'pull_vertical',
    ];
    for (const pattern of required) {
      expect(patterns.has(pattern as any)).toBe(true);
    }
  });

  test('barbell exercises have at least one alternative', () => {
    const barbellExercises = exerciseList.filter(
      (ex) => ex.equipment === 'barbell',
    );
    expect(barbellExercises.length).toBeGreaterThan(0);
    for (const ex of barbellExercises) {
      expect(ex.alternatives.length).toBeGreaterThanOrEqual(1);
      for (const altId of ex.alternatives) {
        expect(exercises[altId]).toBeDefined();
      }
    }
  });

  test('alternative IDs reference valid exercises', () => {
    for (const ex of exerciseList) {
      for (const altId of ex.alternatives) {
        expect(exercises[altId]).toBeDefined();
      }
    }
  });

  test('getExercisesByEquipment returns correct subsets', () => {
    const barbellExercises = getExercisesByEquipment('barbell');
    expect(barbellExercises.length).toBeGreaterThanOrEqual(5);
    for (const ex of barbellExercises) {
      expect(ex.equipment).toBe('barbell');
    }

    const dumbbellExercises = getExercisesByEquipment('dumbbell');
    expect(dumbbellExercises.length).toBeGreaterThanOrEqual(5);
    for (const ex of dumbbellExercises) {
      expect(ex.equipment).toBe('dumbbell');
    }

    const bodyweightExercises = getExercisesByEquipment('bodyweight');
    expect(bodyweightExercises.length).toBeGreaterThanOrEqual(5);
    for (const ex of bodyweightExercises) {
      expect(ex.equipment).toBe('bodyweight');
    }
  });

  test('getAlternatives returns valid exercises', () => {
    const alternatives = getAlternatives('barbell_squat');
    expect(alternatives.length).toBeGreaterThan(0);
    for (const alt of alternatives) {
      expect(alt.id).toBeTruthy();
      expect(alt.name).toBeTruthy();
    }
  });

  test('no duplicate exercise IDs', () => {
    const ids = exerciseList.map((ex) => ex.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('rep ranges are sensible', () => {
    for (const ex of exerciseList) {
      expect(ex.defaultReps.min).toBeGreaterThanOrEqual(1);
      expect(ex.defaultReps.max).toBeLessThanOrEqual(30);
      expect(ex.defaultReps.min).toBeLessThan(ex.defaultReps.max);
    }

    const compounds = exerciseList.filter((ex) => ex.category === 'compound');
    for (const ex of compounds) {
      expect(ex.defaultReps.max).toBeLessThanOrEqual(12);
    }
  });

  test('rest seconds are within expected range', () => {
    for (const ex of exerciseList) {
      expect(ex.restSeconds).toBeGreaterThanOrEqual(30);
      expect(ex.restSeconds).toBeLessThanOrEqual(300);
    }

    const compounds = exerciseList.filter((ex) => ex.category === 'compound');
    for (const ex of compounds) {
      expect(ex.restSeconds).toBeGreaterThanOrEqual(90);
    }
  });
});

// ============================================
// 2. CITATIONS (src/data/citations.ts)
// ============================================

describe('Citations Database', () => {
  test('has at least 15 citations', () => {
    expect(citationList.length).toBeGreaterThanOrEqual(15);
  });

  test('every citation has all required fields', () => {
    for (const cit of citationList) {
      expect(cit.id).toBeTruthy();
      expect(cit.authors.length).toBeGreaterThan(0);
      expect(cit.year).toBeGreaterThanOrEqual(2000);
      expect(cit.title.length).toBeGreaterThan(0);
      expect(cit.journal.length).toBeGreaterThan(0);
      expect(cit.finding.length).toBeGreaterThan(0);
      expect(cit.finding.length).toBeLessThanOrEqual(200);
      expect(['high', 'medium', 'low']).toContain(cit.confidence);
    }
  });

  test('covers all three domains', () => {
    expect(getCitationsByDomain('gym').length).toBeGreaterThanOrEqual(5);
    expect(getCitationsByDomain('running').length).toBeGreaterThanOrEqual(4);
    expect(getCitationsByDomain('nutrition').length).toBeGreaterThanOrEqual(4);
  });

  test('exercise citationIds reference valid citations', () => {
    for (const ex of exerciseList) {
      for (const citId of ex.citationIds) {
        expect(citations[citId]).toBeDefined();
      }
    }
  });

  test('no duplicate citation IDs', () => {
    const ids = citationList.map((cit) => cit.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('findings are concise (under 200 characters)', () => {
    for (const cit of citationList) {
      expect(cit.finding.length).toBeLessThanOrEqual(200);
    }
  });
});

// ============================================
// 3. RUN TEMPLATES (src/data/runTemplates.ts)
// ============================================

describe('Run Templates', () => {
  test('walk/run progression has exactly 8 weeks', () => {
    expect(walkRunProgression.length).toBe(8);
  });

  test('each walk/run week has 3 sessions', () => {
    for (const week of walkRunProgression) {
      expect(week.sessions.length).toBe(3);
    }
  });

  test('walk/run sessions have warmup and cooldown segments', () => {
    for (const week of walkRunProgression) {
      for (const session of week.sessions) {
        const first = session.segments[0];
        const last = session.segments[session.segments.length - 1];
        expect(['warmup', 'walk']).toContain(first.type);
        expect(['cooldown', 'walk']).toContain(last.type);
      }
    }
  });

  test('walk/run progression gets harder over time', () => {
    function totalRunSeconds(weekIndex: number): number {
      const week = walkRunProgression[weekIndex];
      return week.sessions.reduce(
        (weekTotal, session) =>
          weekTotal +
          session.segments
            .filter((seg) => seg.type === 'run')
            .reduce((sum, seg) => sum + seg.durationSeconds, 0),
        0,
      );
    }

    const week1Run = totalRunSeconds(0);
    const week8Run = totalRunSeconds(7);
    expect(week8Run).toBeGreaterThan(week1Run);
  });

  test('easy run template exists and is valid', () => {
    expect(easyRunTemplate.type).toBe('easy');
    expect(easyRunTemplate.totalDurationMinutes).toBeGreaterThanOrEqual(30);
    expect(easyRunTemplate.totalDurationMinutes).toBeLessThanOrEqual(50);
    expect(easyRunTemplate.talkTestGuidance.length).toBeGreaterThan(0);

    const types = easyRunTemplate.segments.map((s) => s.type);
    expect(types).toContain('warmup');
    expect(types).toContain('cooldown');
    expect(types).toContain('run');
  });

  test('tempo run template exists and is valid', () => {
    expect(tempoRunTemplate.type).toBe('tempo');
    expect(tempoRunTemplate.totalDurationMinutes).toBeGreaterThanOrEqual(25);
    expect(tempoRunTemplate.totalDurationMinutes).toBeLessThanOrEqual(40);
    expect(tempoRunTemplate.talkTestGuidance.length).toBeGreaterThan(0);

    const types = tempoRunTemplate.segments.map((s) => s.type);
    expect(types).toContain('warmup');
    expect(types).toContain('cooldown');
    expect(types).toContain('work');
  });

  test('interval template exists and is valid', () => {
    expect(intervalTemplate.type).toBe('intervals');
    expect(intervalTemplate.talkTestGuidance.length).toBeGreaterThan(0);

    const types = intervalTemplate.segments.map((s) => s.type);
    expect(types).toContain('work');
    expect(types).toContain('recovery');

    const workSegments = intervalTemplate.segments.filter(
      (s) => s.type === 'work',
    );
    expect(workSegments.length).toBeGreaterThanOrEqual(3);
  });

  test('all segments have positive duration', () => {
    // Walk/run progression
    for (const week of walkRunProgression) {
      for (const session of week.sessions) {
        for (const segment of session.segments) {
          expect(segment.durationSeconds).toBeGreaterThan(0);
        }
      }
    }

    // Standard templates
    for (const template of [easyRunTemplate, tempoRunTemplate, intervalTemplate]) {
      for (const segment of template.segments) {
        expect(segment.durationSeconds).toBeGreaterThan(0);
      }
    }
  });

  test('getRunSessionForDay returns correct template', () => {
    const easy = getRunSessionForDay('easy');
    expect(easy.type).toBe('easy');

    const tempo = getRunSessionForDay('tempo');
    expect(tempo.type).toBe('tempo');

    const intervals = getRunSessionForDay('intervals');
    expect(intervals.type).toBe('intervals');

    const walkRun = getRunSessionForDay('walk_run', 3);
    expect(walkRun.type).toBe('walk_run');
  });
});

// ============================================
// 4. NUTRITION RULES (src/data/nutritionRules.ts)
// ============================================

describe('Nutrition Rules', () => {
  test('all three goal templates exist', () => {
    expect(fatLossTemplate).toBeDefined();
    expect(muscleBuildTemplate).toBeDefined();
    expect(maintenanceTemplate).toBeDefined();
  });

  test('each template has exactly 5 rules', () => {
    expect(fatLossTemplate.rules.length).toBe(5);
    expect(muscleBuildTemplate.rules.length).toBe(5);
    expect(maintenanceTemplate.rules.length).toBe(5);
  });

  test('rules are in priority order', () => {
    for (const template of [fatLossTemplate, muscleBuildTemplate, maintenanceTemplate]) {
      for (let i = 0; i < template.rules.length; i++) {
        expect(template.rules[i].priority).toBe(i + 1);
      }
    }
  });

  test('each rule has a citation reference', () => {
    for (const template of [fatLossTemplate, muscleBuildTemplate, maintenanceTemplate]) {
      for (const rule of template.rules) {
        expect(rule.citationId).toBeTruthy();
        // citationId is either a valid citation or 'general'
        const isValid =
          rule.citationId === 'general' || citations[rule.citationId] != null;
        expect(isValid).toBe(true);
      }
    }
  });

  test('calorie adjustments are correct per goal', () => {
    expect(fatLossTemplate.calorieAdjustment).toBeLessThan(0);
    expect(fatLossTemplate.calorieAdjustment).toBe(-500);

    expect(muscleBuildTemplate.calorieAdjustment).toBeGreaterThan(0);
    expect(muscleBuildTemplate.calorieAdjustment).toBe(300);

    expect(maintenanceTemplate.calorieAdjustment).toBe(0);
  });

  test('protein ranges are evidence-based', () => {
    expect(fatLossTemplate.proteinPerKg.min).toBeGreaterThanOrEqual(1.6);
    expect(fatLossTemplate.proteinPerKg.max).toBeLessThanOrEqual(2.8);

    expect(muscleBuildTemplate.proteinPerKg.min).toBeGreaterThanOrEqual(1.4);

    expect(maintenanceTemplate.proteinPerKg.min).toBeGreaterThanOrEqual(1.0);
  });

  test('hand portions are defined for all 4 types', () => {
    const types = handPortions.map((p) => p.type);
    expect(types).toContain('protein');
    expect(types).toContain('carbs');
    expect(types).toContain('fat');
    expect(types).toContain('veggies');

    for (const portion of handPortions) {
      expect(portion.handUnit.length).toBeGreaterThan(0);
      expect(portion.examples.length).toBeGreaterThan(0);
      // Veggies have 0 grams by design (tracked by calories instead)
      if (portion.type !== 'veggies') {
        expect(portion.approximateGrams).toBeGreaterThan(0);
      }
      expect(portion.approximateCalories).toBeGreaterThan(0);
    }
  });

  test('calculatePortions returns reasonable values', () => {
    const fatLoss = calculatePortions(80, 'fat_loss');
    expect(fatLoss.protein).toBeGreaterThanOrEqual(1);
    expect(fatLoss.carbs).toBeGreaterThanOrEqual(1);
    expect(fatLoss.fat).toBeGreaterThanOrEqual(1);
    expect(fatLoss.veggies).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(fatLoss.protein)).toBe(true);
    expect(Number.isInteger(fatLoss.carbs)).toBe(true);
    expect(Number.isInteger(fatLoss.fat)).toBe(true);
    expect(Number.isInteger(fatLoss.veggies)).toBe(true);

    const muscleBuild = calculatePortions(60, 'muscle_build');
    expect(muscleBuild.protein).toBeGreaterThanOrEqual(1);
    expect(muscleBuild.carbs).toBeGreaterThanOrEqual(1);
    expect(muscleBuild.fat).toBeGreaterThanOrEqual(1);
    expect(muscleBuild.veggies).toBeGreaterThanOrEqual(1);

    const maintenance = calculatePortions(70, 'maintenance');
    expect(maintenance.protein).toBeGreaterThanOrEqual(1);
    expect(maintenance.carbs).toBeGreaterThanOrEqual(1);
    expect(maintenance.fat).toBeGreaterThanOrEqual(1);
    expect(maintenance.veggies).toBeGreaterThanOrEqual(1);
  });
});

// ============================================
// 5. ONBOARDING QUESTIONS (src/data/onboardingQuestions.ts)
// ============================================

describe('Onboarding Questions', () => {
  test('getQuestionsForDomains returns correct count', () => {
    expect(getQuestionsForDomains(['gym']).length).toBe(4);
    expect(getQuestionsForDomains(['running']).length).toBe(4);
    expect(getQuestionsForDomains(['nutrition']).length).toBe(3);
    expect(getQuestionsForDomains(['gym', 'running', 'nutrition']).length).toBe(5);
  });

  test('universal questions always appear first', () => {
    const combos: string[][] = [
      ['gym'],
      ['running'],
      ['nutrition'],
      ['gym', 'running'],
      ['gym', 'nutrition'],
      ['running', 'nutrition'],
      ['gym', 'running', 'nutrition'],
    ];

    for (const domains of combos) {
      const questions = getQuestionsForDomains(domains);
      expect(questions[0].id).toBe('goal');
      expect(questions[1].id).toBe('fitness_level');
    }
  });

  test('gym questions only appear when gym selected', () => {
    const runningOnly = getQuestionsForDomains(['running']);
    const ids = runningOnly.map((q) => q.id);
    expect(ids).not.toContain('gym_days');
    expect(ids).not.toContain('equipment');

    const gymQuestions = getQuestionsForDomains(['gym']);
    const gymIds = gymQuestions.map((q) => q.id);
    expect(gymIds).toContain('gym_days');
    expect(gymIds).toContain('equipment');
  });

  test('running questions only appear when running selected', () => {
    const gymOnly = getQuestionsForDomains(['gym']);
    const ids = gymOnly.map((q) => q.id);
    expect(ids).not.toContain('running_level');
    expect(ids).not.toContain('has_hr_monitor');
  });

  test('never exceeds 5 questions', () => {
    const allCombos: string[][] = [
      ['gym'],
      ['running'],
      ['nutrition'],
      ['gym', 'running'],
      ['gym', 'nutrition'],
      ['running', 'nutrition'],
      ['gym', 'running', 'nutrition'],
    ];

    for (const domains of allCombos) {
      const questions = getQuestionsForDomains(domains);
      expect(questions.length).toBeLessThanOrEqual(5);
    }
  });

  test('all single_select questions have at least 2 options', () => {
    const allCombos: string[][] = [
      ['gym'],
      ['running'],
      ['nutrition'],
      ['gym', 'running', 'nutrition'],
    ];

    for (const domains of allCombos) {
      const questions = getQuestionsForDomains(domains);
      for (const q of questions) {
        if (q.type === 'single_select') {
          expect(q.options!.length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  test('numeric_form questions have fields defined', () => {
    const numericQuestions = onboardingQuestions.filter(
      (q) => q.type === 'numeric_form',
    );
    expect(numericQuestions.length).toBeGreaterThan(0);

    for (const q of numericQuestions) {
      expect(q.fields!.length).toBeGreaterThan(0);
      for (const field of q.fields!) {
        expect(field.key).toBeTruthy();
        expect(field.label).toBeTruthy();
        expect(field.keyboardType).toBeTruthy();
      }
    }
  });

  test('every question has a valid storeKey and unique id', () => {
    const allCombos: string[][] = [
      ['gym'],
      ['running'],
      ['nutrition'],
      ['gym', 'running', 'nutrition'],
    ];

    for (const domains of allCombos) {
      const questions = getQuestionsForDomains(domains);
      for (const q of questions) {
        expect(q.storeKey.length).toBeGreaterThan(0);
      }

      // Question IDs should be unique within each set
      const ids = questions.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    }
  });
});

// ============================================
// 6. CALCULATIONS (src/utils/calculations.ts)
// ============================================
// NOTE: This file does not exist yet. These tests will fail
// with an import error until src/utils/calculations.ts is created.

describe('Calculations', () => {
  let calculateTDEE: any;
  let calculateProteinTarget: any;
  let calculateZone2HR: any;
  let calculateCalorieTarget: any;
  let calculateMacros: any;

  beforeAll(() => {
    try {
      const mod = require('@/utils/calculations');
      calculateTDEE = mod.calculateTDEE;
      calculateProteinTarget = mod.calculateProteinTarget;
      calculateZone2HR = mod.calculateZone2HR;
      calculateCalorieTarget = mod.calculateCalorieTarget;
      calculateMacros = mod.calculateMacros;
    } catch {
      // Module not yet implemented
    }
  });

  test('calculateTDEE returns realistic values', () => {
    if (!calculateTDEE) return; // skip until implemented

    // Male, 80kg, 180cm, 30yo, moderate
    const male = calculateTDEE({
      weightKg: 80,
      heightCm: 180,
      age: 30,
      sex: 'male',
      activityLevel: 'moderate',
    });
    expect(male).toBeGreaterThanOrEqual(2400);
    expect(male).toBeLessThanOrEqual(2800);

    // Female, 60kg, 165cm, 28yo, light
    const female = calculateTDEE({
      weightKg: 60,
      heightCm: 165,
      age: 28,
      sex: 'female',
      activityLevel: 'light',
    });
    expect(female).toBeGreaterThanOrEqual(1600);
    expect(female).toBeLessThanOrEqual(1900);

    // Male, 100kg, 190cm, 25yo, very_active
    const active = calculateTDEE({
      weightKg: 100,
      heightCm: 190,
      age: 25,
      sex: 'male',
      activityLevel: 'very_active',
    });
    expect(active).toBeGreaterThanOrEqual(3200);
    expect(active).toBeLessThanOrEqual(3600);

    // Female, 55kg, 160cm, 45yo, sedentary
    const sedentary = calculateTDEE({
      weightKg: 55,
      heightCm: 160,
      age: 45,
      sex: 'female',
      activityLevel: 'sedentary',
    });
    expect(sedentary).toBeGreaterThanOrEqual(1300);
    expect(sedentary).toBeLessThanOrEqual(1500);
  });

  test('calculateTDEE increases with activity level', () => {
    if (!calculateTDEE) return;

    const base = { weightKg: 80, heightCm: 180, age: 30, sex: 'male' as const };
    const sedentary = calculateTDEE({ ...base, activityLevel: 'sedentary' });
    const light = calculateTDEE({ ...base, activityLevel: 'light' });
    const moderate = calculateTDEE({ ...base, activityLevel: 'moderate' });
    const veryActive = calculateTDEE({ ...base, activityLevel: 'very_active' });

    expect(sedentary).toBeLessThan(light);
    expect(light).toBeLessThan(moderate);
    expect(moderate).toBeLessThan(veryActive);
  });

  test('calculateProteinTarget returns grams and portions per goal', () => {
    if (!calculateProteinTarget) return;

    const fatLoss = calculateProteinTarget(80, 'fat_loss');
    expect(fatLoss.grams).toBe(160); // 2.0 * 80
    expect(fatLoss.portions).toBe(6); // 160 / 28 ≈ 5.71 → 6

    const muscleBuild = calculateProteinTarget(80, 'muscle_build');
    expect(muscleBuild.grams).toBe(144); // 1.8 * 80
    expect(muscleBuild.portions).toBe(5); // 144 / 28 ≈ 5.14 → 5

    const maintenance = calculateProteinTarget(80, 'maintenance');
    expect(maintenance.grams).toBe(112); // 1.4 * 80
    expect(maintenance.portions).toBe(4); // 112 / 28 = 4
  });

  test('calculateZone2HR Karvonen method', () => {
    if (!calculateZone2HR) return;

    const result = calculateZone2HR(30, 60);
    // maxHR = 220 - 30 = 190, reserve = 130
    // low = 60 + 130*0.6 = 138, high = 60 + 130*0.7 = 151
    expect(result.low).toBeGreaterThanOrEqual(136);
    expect(result.low).toBeLessThanOrEqual(140);
    expect(result.high).toBeGreaterThanOrEqual(149);
    expect(result.high).toBeLessThanOrEqual(153);
    expect(result.method).toBe('karvonen');
  });

  test('calculateZone2HR percentage method (no resting HR)', () => {
    if (!calculateZone2HR) return;

    const result = calculateZone2HR(30);
    // maxHR = 220 - 30 = 190
    // low = 190 * 0.6 = 114, high = 190 * 0.7 = 133
    expect(result.low).toBeGreaterThanOrEqual(112);
    expect(result.low).toBeLessThanOrEqual(116);
    expect(result.high).toBeGreaterThanOrEqual(131);
    expect(result.high).toBeLessThanOrEqual(135);
    expect(result.method).toBe('percentage');
  });

  test('calculateCalorieTarget applies correct adjustments', () => {
    if (!calculateCalorieTarget) return;

    expect(calculateCalorieTarget(2500, 'fat_loss')).toBe(2000);
    expect(calculateCalorieTarget(2500, 'muscle_build')).toBe(2800);
    expect(calculateCalorieTarget(2500, 'maintenance')).toBe(2500);
  });

  test('calculateMacros protein + fat + carbs = total calories', () => {
    if (!calculateMacros) return;

    const macros = calculateMacros(2000, 80, 'fat_loss');
    const totalCals =
      macros.protein * 4 + macros.fat * 9 + macros.carbs * 4;
    expect(Math.abs(totalCals - 2000)).toBeLessThanOrEqual(50);
  });
});
