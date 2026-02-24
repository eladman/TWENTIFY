export type NutritionGoal = 'fat_loss' | 'muscle_build' | 'maintenance';

export interface NutritionPlan {
  goal: NutritionGoal;
  tdee: number;
  calorieTarget: number;
  proteinTargetG: number;
  proteinPortions: number;
  dailyRules: string[];
}

export interface NutritionCheckin {
  date: string; // YYYY-MM-DD
  proteinServings: number;
  veggieServings: number;
  waterGlasses: number;
  followedPlan: boolean | null;
}
