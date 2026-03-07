import type { CompletedWorkout, Exercise } from '@/types/workout';

/**
 * Returns the Monday 00:00 of the week containing `date`.
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Counts completed sets per primary muscle group for the current week (Mon-Sun).
 */
export function getWeeklyVolumeSets(
  history: CompletedWorkout[],
  exercisesDb: Record<string, Exercise>,
): Record<string, number> {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const volume: Record<string, number> = {};

  for (const workout of history) {
    const completedAt = new Date(workout.completedAt);
    if (completedAt < weekStart || completedAt >= weekEnd) continue;

    for (const ex of workout.exercises) {
      const exData = exercisesDb[ex.exerciseId];
      if (!exData) continue;

      const completedSets = ex.sets.filter((s) => s.completed).length;
      for (const muscle of exData.primaryMuscles) {
        volume[muscle] = (volume[muscle] ?? 0) + completedSets;
      }
    }
  }

  return volume;
}

/**
 * Returns total sets and unique muscle groups hit this week.
 */
export function getWeeklyVolumeSummary(
  history: CompletedWorkout[],
  exercisesDb: Record<string, Exercise>,
): { totalSets: number; muscleGroups: number } {
  const volume = getWeeklyVolumeSets(history, exercisesDb);
  const totalSets = Object.values(volume).reduce((a, b) => a + b, 0);
  const muscleGroups = Object.keys(volume).length;
  return { totalSets, muscleGroups };
}
