import type { NutritionGoal } from '@/types/nutrition';

// ── Types ───────────────────────────────────────────────────────────────────

export interface NutritionRule {
  id: string;
  rule: string;
  why: string;
  citationId: string;
  priority: number; // 1 = most important
}

export interface HandPortion {
  type: 'protein' | 'carbs' | 'fat' | 'veggies';
  handUnit: string;
  approximateGrams: number;
  approximateCalories: number;
  examples: string[];
}

export interface NutritionTemplate {
  goal: NutritionGoal;
  calorieAdjustment: number; // relative to TDEE
  proteinPerKg: { min: number; max: number };
  fatPerKg: { min: number; max: number };
  carbsNote: string;
  rules: NutritionRule[];
  dailyPortions: {
    protein: number;
    veggies: number;
    carbs: number;
    fat: number;
  };
}

// ── Hand Portions ───────────────────────────────────────────────────────────

export const handPortions: HandPortion[] = [
  {
    type: 'protein',
    handUnit: '1 palm',
    approximateGrams: 27.5, // avg of 25-30g
    approximateCalories: 150,
    examples: ['chicken breast', 'fish fillet', 'lean steak', 'tofu block', '3 eggs'],
  },
  {
    type: 'carbs',
    handUnit: '1 cupped hand',
    approximateGrams: 27.5, // avg of 25-30g
    approximateCalories: 100,
    examples: ['rice', 'pasta', 'potato', 'oats', 'bread slice'],
  },
  {
    type: 'fat',
    handUnit: '1 thumb',
    approximateGrams: 8.5, // avg of 7-10g
    approximateCalories: 70,
    examples: ['olive oil', 'nuts', 'cheese', 'avocado', 'butter'],
  },
  {
    type: 'veggies',
    handUnit: '1 fist',
    approximateGrams: 0,
    approximateCalories: 25,
    examples: ['broccoli', 'spinach', 'peppers', 'salad', 'green beans'],
  },
];

// ── Fat Loss Template ───────────────────────────────────────────────────────

export const fatLossTemplate: NutritionTemplate = {
  goal: 'fat_loss',
  calorieAdjustment: -500,
  proteinPerKg: { min: 2.0, max: 2.4 },
  fatPerKg: { min: 0.8, max: 1.0 },
  carbsNote: 'remaining calories',
  rules: [
    {
      id: 'fl_protein',
      rule: 'Hit your protein target at every meal — 4 palm-sized portions per day',
      why: 'Higher protein intake (1.6-2.4 g/kg) preserves lean mass during a caloric deficit.',
      citationId: 'morton_2018',
      priority: 1,
    },
    {
      id: 'fl_deficit',
      rule: 'Stay in a caloric deficit consistently — weekdays AND weekends',
      why: 'A sustained moderate deficit (~500 kcal/day) is the primary driver of fat loss.',
      citationId: 'helms_pyramid',
      priority: 2,
    },
    {
      id: 'fl_veggies',
      rule: 'Eat vegetables at 2-3 meals per day',
      why: 'Vegetables add volume and micronutrients with minimal calories, improving satiety.',
      citationId: 'general',
      priority: 3,
    },
    {
      id: 'fl_lifting',
      rule: "Keep lifting heavy during your cut — it's the #1 stimulus for keeping muscle",
      why: 'Resistance training during a deficit is the strongest signal for muscle retention.',
      citationId: 'longland_2016',
      priority: 4,
    },
    {
      id: 'fl_tracking',
      rule: 'Weigh yourself weekly (average of 3+ mornings) and adjust if needed',
      why: 'Weekly weight averages smooth out daily fluctuations and guide calorie adjustments.',
      citationId: 'thom_2020',
      priority: 5,
    },
  ],
  dailyPortions: {
    protein: 4,
    veggies: 4,
    carbs: 3,
    fat: 3,
  },
};

// ── Muscle Build Template ───────────────────────────────────────────────────

export const muscleBuildTemplate: NutritionTemplate = {
  goal: 'muscle_build',
  calorieAdjustment: 300,
  proteinPerKg: { min: 1.6, max: 2.2 },
  fatPerKg: { min: 0.8, max: 1.2 },
  carbsNote: 'remaining calories',
  rules: [
    {
      id: 'mb_eat_enough',
      rule: 'Eat enough — chronic undereating is the #1 mistake in building phases',
      why: 'A modest caloric surplus (~300 kcal/day) provides energy for muscle protein synthesis.',
      citationId: 'helms_pyramid',
      priority: 1,
    },
    {
      id: 'mb_protein',
      rule: 'Hit protein target: at least 1.6g per kg across 3-4 meals',
      why: 'Distributing 1.6-2.2 g/kg protein across meals maximises muscle protein synthesis.',
      citationId: 'morton_2018',
      priority: 2,
    },
    {
      id: 'mb_carbs',
      rule: 'Prioritize carbs around training for performance and recovery',
      why: 'Peri-workout carbohydrates replenish glycogen and support training intensity.',
      citationId: 'helms_pyramid',
      priority: 3,
    },
    {
      id: 'mb_slow_gain',
      rule: 'Gain weight slowly — aim for 0.25-0.5% bodyweight per week',
      why: 'A surplus above ~500 kcal/day mostly adds fat, not additional muscle tissue.',
      citationId: 'helms_pyramid',
      priority: 4,
    },
    {
      id: 'mb_sleep',
      rule: 'Sleep 7-9 hours — growth hormone peaks during deep sleep',
      why: 'Sleep is when the majority of muscle repair and growth hormone release occurs.',
      citationId: 'general',
      priority: 5,
    },
  ],
  dailyPortions: {
    protein: 4,
    veggies: 3,
    carbs: 5,
    fat: 4,
  },
};

// ── Maintenance Template ────────────────────────────────────────────────────

export const maintenanceTemplate: NutritionTemplate = {
  goal: 'maintenance',
  calorieAdjustment: 0,
  proteinPerKg: { min: 1.2, max: 1.6 },
  fatPerKg: { min: 0.8, max: 1.2 },
  carbsNote: 'remaining calories',
  rules: [
    {
      id: 'mt_protein',
      rule: 'Eat protein at every meal — at least 25g per sitting',
      why: 'A per-meal minimum of ~25g triggers meaningful muscle protein synthesis.',
      citationId: 'morton_2018',
      priority: 1,
    },
    {
      id: 'mt_produce',
      rule: 'Eat 5+ servings of fruits and vegetables daily',
      why: 'High produce intake is consistently linked to lower all-cause mortality.',
      citationId: 'general',
      priority: 2,
    },
    {
      id: 'mt_water',
      rule: 'Drink water as your primary beverage',
      why: 'Replacing caloric drinks with water is one of the simplest ways to manage intake.',
      citationId: 'general',
      priority: 3,
    },
    {
      id: 'mt_whole_foods',
      rule: 'Eat mostly whole, minimally processed foods — about 80% of intake',
      why: 'Whole foods are more satiating and nutrient-dense than ultra-processed alternatives.',
      citationId: 'helms_pyramid',
      priority: 4,
    },
    {
      id: 'mt_flexibility',
      rule: "Allow flexibility — 'good enough' consistently beats 'perfect' intermittently",
      why: 'Long-term adherence, not short-term perfection, drives lasting results.',
      citationId: 'helms_pyramid',
      priority: 5,
    },
  ],
  dailyPortions: {
    protein: 4,
    veggies: 3,
    carbs: 4,
    fat: 4,
  },
};

// ── Lookup helpers ──────────────────────────────────────────────────────────

const templatesByGoal: Record<NutritionGoal, NutritionTemplate> = {
  fat_loss: fatLossTemplate,
  muscle_build: muscleBuildTemplate,
  maintenance: maintenanceTemplate,
};

export const nutritionRulesByGoal: Record<NutritionGoal, NutritionRule[]> = {
  fat_loss: fatLossTemplate.rules,
  muscle_build: muscleBuildTemplate.rules,
  maintenance: maintenanceTemplate.rules,
};

// ── Portion calculator ──────────────────────────────────────────────────────

export function calculatePortions(
  weightKg: number,
  goal: NutritionGoal,
): { protein: number; carbs: number; fat: number; veggies: number } {
  const template = templatesByGoal[goal];

  const proteinPerKg = (template.proteinPerKg.min + template.proteinPerKg.max) / 2;
  const fatPerKg = (template.fatPerKg.min + template.fatPerKg.max) / 2;

  const proteinG = proteinPerKg * weightKg;
  const fatG = fatPerKg * weightKg;

  // Hand portion conversions (using midpoint estimates)
  const proteinPortions = Math.round(proteinG / 27.5); // 1 palm ≈ 25-30g protein
  const fatPortions = Math.round(fatG / 8.5); // 1 thumb ≈ 7-10g fat

  // Carbs fill remaining calories (protein = 4 cal/g, fat = 9 cal/g)
  const proteinCals = proteinG * 4;
  const fatCals = fatG * 9;
  // Use a baseline ~2200 kcal TDEE + adjustment for portion estimation
  const estimatedTotalCals = 2200 + template.calorieAdjustment;
  const carbCals = Math.max(0, estimatedTotalCals - proteinCals - fatCals);
  const carbPortions = Math.round(carbCals / 100); // 1 cupped hand ≈ 100 cal

  const veggies = goal === 'fat_loss' ? 4 : 3;

  return { protein: proteinPortions, carbs: carbPortions, fat: fatPortions, veggies };
}
