import { exercises, exerciseList, getAlternatives as builtInAlternatives } from './exercises';
import { useCustomExercisesStore } from '@/stores/useCustomExercisesStore';
import type { Exercise } from '@/types/workout';

/**
 * Lookup a single exercise by ID — checks built-in first, then custom.
 */
export function getExercise(id: string): Exercise | undefined {
  return exercises[id] ?? useCustomExercisesStore.getState().customExercises[id];
}

/**
 * Merged array of all exercises (built-in + custom).
 */
export function getAllExercisesList(): Exercise[] {
  const custom = Object.values(useCustomExercisesStore.getState().customExercises);
  return [...exerciseList, ...custom];
}

/**
 * Merged Record for utility functions that accept Record<string, Exercise>.
 */
export function getAllExercisesMap(): Record<string, Exercise> {
  const custom = useCustomExercisesStore.getState().customExercises;
  return { ...exercises, ...custom };
}

/**
 * Get alternatives for an exercise using the unified lookup.
 */
export function getAlternatives(exerciseId: string): Exercise[] {
  return builtInAlternatives(exerciseId);
}

/**
 * Check if an exercise is user-created.
 */
export function isCustomExercise(id: string): boolean {
  return id.startsWith('custom_');
}
