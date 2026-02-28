export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'accessory';

export type ExerciseEquipment =
  | 'barbell'
  | 'dumbbell'
  | 'bodyweight'
  | 'cable'
  | 'machine';

export interface Exercise {
  id: string;
  name: string;
  category: 'compound' | 'isolation' | 'bodyweight';
  movementPattern: MovementPattern;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: ExerciseEquipment;
  alternatives: string[];
  citationIds: string[];
  instructions: string;
  cues: string[];
  defaultReps: { min: number; max: number };
  defaultSets: number;
  restSeconds: number;
}

export interface SetData {
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface TargetSet {
  targetReps: [number, number]; // [min, max] e.g. [6, 8]
  suggestedWeightKg: number | null;
  restSeconds: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: TargetSet[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: string; // 'lower_a' | 'upper_a' | 'full_body_a' etc.
  exercises: WorkoutExercise[];
  estimatedDurationMin: number;
}

export interface ActiveWorkout {
  templateId: string;
  startedAt: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  exercises: {
    exerciseId: string;
    sets: (SetData | null)[];
  }[];
}

export interface CompletedWorkout {
  id: string;
  templateId: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: {
    exerciseId: string;
    sets: SetData[];
  }[];
}
