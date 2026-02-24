export interface Exercise {
  id: string;
  name: string;
  category: 'compound' | 'isolation' | 'bodyweight';
  movementPattern: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string;
  alternatives: string[];
  citationIds: string[];
  instructions: string;
  cues: string[];
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
