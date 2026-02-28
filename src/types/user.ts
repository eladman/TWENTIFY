export type Domain = 'gym' | 'running' | 'nutrition';
export type Goal = 'fat_loss' | 'muscle_build' | 'maintenance';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Units = 'metric' | 'imperial';
export type SubscriptionTier = 'free' | 'pro';
export type EquipmentAccess = 'full_gym' | 'dumbbells' | 'bodyweight';
export type RunningLevel = 'cant_run_20min' | 'can_run_20min' | 'experienced';

export interface UserProfile {
  age?: number;
  weightKg?: number;
  heightCm?: number;
  sex?: 'male' | 'female';
  restingHr?: number;
  equipmentAccess?: EquipmentAccess;
  runningLevel?: RunningLevel;
  hasHrMonitor?: boolean;
  tdeeEstimated?: number;
  proteinTargetG?: number;
  gymDaysPerWeek?: 2 | 3 | 4;
  trainingDaysPerWeek?: 3 | 4 | 5;
  runDaysPerWeek?: 1 | 2 | 3;
}

export interface UserSettings {
  units: Units;
  notifications: boolean;
  reminderTime: string;
}
