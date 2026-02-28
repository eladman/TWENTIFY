import type { WorkoutTemplate } from './workout';
import type { RunTemplate } from './run';
import type { NutritionPlan } from './nutrition';
import type {
  Domain,
  Goal,
  FitnessLevel,
  EquipmentAccess,
  RunningLevel,
} from './user';

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
  type: 'gym_2day' | 'gym_3day' | 'gym_4day';
  templates: WorkoutTemplate[];
}

export interface RunPlan {
  type: 'run_1day' | 'run_2day' | 'run_3day';
  templates: RunTemplate[];
}

export interface PlanInput {
  domains: Domain[];
  goal: Goal;
  fitnessLevel: FitnessLevel;
  gymDaysPerWeek?: 2 | 3 | 4;
  trainingDaysPerWeek?: 3 | 4 | 5;
  equipmentAccess?: EquipmentAccess;
  runningLevel?: RunningLevel;
  hasHrMonitor?: boolean;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  sex?: 'male' | 'female';
}

export interface WeeklyPlan {
  weekNumber: number;
  schedule: DayPlan[];
  gymPlan: GymPlan | null;
  runPlan: RunPlan | null;
  nutritionPlan: NutritionPlan | null;
}
