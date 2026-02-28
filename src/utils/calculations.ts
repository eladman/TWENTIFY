import type { NutritionGoal } from '@/types/nutrition';

// ── Types ───────────────────────────────────────────────────────────────────

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';

export interface TDEEInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
  activityLevel: ActivityLevel;
}

// ── Activity multipliers (Mifflin-St Jeor) ──────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
};

// ── Protein per kg per goal ─────────────────────────────────────────────────

const PROTEIN_PER_KG: Record<NutritionGoal, number> = {
  fat_loss: 2.0,
  muscle_build: 1.8,
  maintenance: 1.4,
};

// ── Calorie adjustments per goal ────────────────────────────────────────────

const CALORIE_ADJUSTMENTS: Record<NutritionGoal, number> = {
  fat_loss: -500,
  muscle_build: 300,
  maintenance: 0,
};

// ── Fat per kg per goal ─────────────────────────────────────────────────────

const FAT_PER_KG: Record<NutritionGoal, number> = {
  fat_loss: 0.9,
  muscle_build: 1.0,
  maintenance: 1.0,
};

// ── TDEE (Mifflin-St Jeor) ─────────────────────────────────────────────────

/**
 * Calculates Total Daily Energy Expenditure using the Mifflin-St Jeor equation.
 *
 * BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + s  (s = +5 male, −161 female)
 * TDEE = BMR × activity multiplier
 *
 * @see Mifflin MD et al. "A new predictive equation for resting energy expenditure
 *      in healthy individuals." Am J Clin Nutr. 1990;51(2):241-247.
 */
export function calculateTDEE(input: TDEEInput): number {
  const { weightKg, heightCm, age, sex, activityLevel } = input;

  const bmr =
    sex === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// ── Protein target ──────────────────────────────────────────────────────────

/**
 * Calculates daily protein target in grams and hand-sized portions.
 *
 * grams = PROTEIN_PER_KG[goal] × weightKg
 * portions = grams / 28  (1 palm ≈ 28 g protein)
 *
 * @see Morton RW et al. "A systematic review, meta-analysis and meta-regression
 *      of the effect of protein supplementation on resistance training-induced gains
 *      in muscle mass and strength." Br J Sports Med. 2018;52(6):376-384.
 */
export function calculateProteinTarget(
  weightKg: number,
  goal: NutritionGoal,
): { grams: number; portions: number } {
  const grams = Math.round(PROTEIN_PER_KG[goal] * weightKg);
  const portions = Math.round(grams / 28);
  return { grams, portions };
}

// ── Zone 2 heart rate ───────────────────────────────────────────────────────

/**
 * Calculates Zone 2 heart-rate range using either the Karvonen formula
 * (when resting HR is provided) or a simple percentage of max HR.
 *
 * Karvonen: target = restingHR + HRR × intensity  (60–70 % for Zone 2)
 * Percentage: target = maxHR × intensity
 * maxHR = 220 − age
 *
 * @see Karvonen MJ et al. "The effects of training on heart rate; a longitudinal
 *      study." Ann Med Exp Biol Fenn. 1957;35(3):307-315.
 */
export function calculateZone2HR(
  age: number,
  restingHr?: number,
): { low: number; high: number; method: 'karvonen' | 'percentage' } {
  const maxHR = 220 - age;

  if (restingHr != null) {
    const reserve = maxHR - restingHr;
    return {
      low: Math.round(restingHr + reserve * 0.6),
      high: Math.round(restingHr + reserve * 0.7),
      method: 'karvonen',
    };
  }

  return {
    low: Math.round(maxHR * 0.6),
    high: Math.round(maxHR * 0.7),
    method: 'percentage',
  };
}

// ── Calorie target ──────────────────────────────────────────────────────────

/**
 * Applies a goal-specific calorie adjustment to TDEE.
 *
 * fat_loss: −500 kcal, muscle_build: +300 kcal, maintenance: 0 kcal
 *
 * @see Aragon AA et al. "International society of sports nutrition position stand:
 *      diets and body composition." J Int Soc Sports Nutr. 2017;14:16.
 */
export function calculateCalorieTarget(
  tdee: number,
  goal: NutritionGoal,
): number {
  return Math.round(tdee + CALORIE_ADJUSTMENTS[goal]);
}

// ── Macros ──────────────────────────────────────────────────────────────────

/**
 * Calculates daily macronutrient breakdown in grams.
 *
 * protein = PROTEIN_PER_KG[goal] × weightKg
 * fat     = FAT_PER_KG[goal] × weightKg
 * carbs   = (calorieTarget − protein×4 − fat×9) / 4
 *
 * @see Helms ER et al. "Evidence-based recommendations for natural bodybuilding
 *      contest preparation: nutrition and supplementation." J Int Soc Sports Nutr.
 *      2014;11:20.
 */
export function calculateMacros(
  calorieTarget: number,
  weightKg: number,
  goal: NutritionGoal,
): { protein: number; fat: number; carbs: number } {
  const protein = calculateProteinTarget(weightKg, goal).grams;
  const fat = Math.round(FAT_PER_KG[goal] * weightKg);

  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbs = Math.max(0, Math.round((calorieTarget - proteinCals - fatCals) / 4));

  return { protein, fat, carbs };
}
