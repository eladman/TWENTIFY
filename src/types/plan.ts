import type { WorkoutTemplate } from './workout';
import type { RunTemplate } from './run';
import type { NutritionPlan } from './nutrition';

export type DayActivity = 'gym' | 'run' | 'rest' | 'nutrition_only';

export interface DayPlan {
  dayOfWeek: number; // 0=Monday, 6=Sunday
  activity: DayActivity;
  workoutTemplate?: WorkoutTemplate;
  runTemplate?: RunTemplate;
  estimatedDurationMin: number;
  label: string; // e.g., "Lower Body", "Easy Run", "Rest Day"
}

export interface GymPlan {
  type: 'gym_3day' | 'gym_4day';
  templates: WorkoutTemplate[];
}

export interface RunPlan {
  type: 'run_3day' | 'run_2day';
  templates: RunTemplate[];
}

export interface WeeklyPlan {
  weekNumber: number;
  schedule: DayPlan[];
  gymPlan: GymPlan | null;
  runPlan: RunPlan | null;
  nutritionPlan: NutritionPlan | null;
}
