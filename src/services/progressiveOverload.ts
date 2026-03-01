import type { SetData, CompletedWorkout, ExerciseEquipment } from '@/types/workout';
import type { FitnessLevel } from '@/types/user';
import { exercises } from '@/data/exercises';

// ── Types ──────────────────────────────────────────────────────────

export interface SetTarget {
  setNumber: number;
  targetReps: { min: number; max: number };
  targetWeightKg: number | null;
  isDeload: boolean;
  note?: string;
}

export interface ExerciseProgression {
  exerciseId: string;
  sets: SetTarget[];
  progressionNote?: string;
}

// ── Helpers ────────────────────────────────────────────────────────

function isLowerBody(exerciseId: string): boolean {
  const exercise = exercises[exerciseId];
  if (!exercise) return false;
  return exercise.movementPattern === 'squat' || exercise.movementPattern === 'hinge';
}

function getWeightIncrement(
  equipment: ExerciseEquipment,
  isLower: boolean,
): number {
  switch (equipment) {
    case 'barbell':
      return isLower ? 5 : 2.5;
    case 'dumbbell':
    case 'cable':
    case 'machine':
      return 2;
    case 'bodyweight':
      return 0;
  }
}

function getCompletedSets(sets: SetData[]): SetData[] {
  return sets.filter((s) => s.completed);
}

function getTotalReps(sets: SetData[]): number {
  return getCompletedSets(sets).reduce((sum, s) => sum + s.reps, 0);
}

function allSetsAtTopOfRange(sets: SetData[], repMax: number): boolean {
  const completed = getCompletedSets(sets);
  if (completed.length === 0) return false;
  return completed.every((s) => s.reps >= repMax);
}

function getWorkingWeight(sets: SetData[]): number {
  const completed = getCompletedSets(sets);
  if (completed.length === 0) return 0;
  // Use the most common weight (mode) as the working weight
  const freq = new Map<number, number>();
  for (const s of completed) {
    freq.set(s.weightKg, (freq.get(s.weightKg) ?? 0) + 1);
  }
  let maxCount = 0;
  let mode = completed[0].weightKg;
  for (const [weight, count] of freq) {
    if (count > maxCount) {
      maxCount = count;
      mode = weight;
    }
  }
  return mode;
}

function sameWeight(setsA: SetData[], setsB: SetData[]): boolean {
  return getWorkingWeight(setsA) === getWorkingWeight(setsB);
}

function getExerciseHistory(
  exerciseId: string,
  workoutHistory: CompletedWorkout[],
  maxSessions: number = 3,
): SetData[][] {
  const sessions: SetData[][] = [];
  for (let i = workoutHistory.length - 1; i >= 0 && sessions.length < maxSessions; i--) {
    const ex = workoutHistory[i].exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) {
      sessions.push(ex.sets);
    }
  }
  return sessions;
}

function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

// ── Core ───────────────────────────────────────────────────────────

export function calculateNextSession(
  exerciseId: string,
  lastSession: SetData[],
  previousSessions: SetData[][], // most recent first, NOT including lastSession
  _fitnessLevel: FitnessLevel,
  equipment: ExerciseEquipment,
): ExerciseProgression {
  const exercise = exercises[exerciseId];
  const repRange = exercise
    ? { min: exercise.defaultReps.min, max: exercise.defaultReps.max }
    : { min: 6, max: 8 };

  const completedLast = getCompletedSets(lastSession);

  // Step 5 — First time (no data)
  if (completedLast.length === 0) {
    const setCount = lastSession.length || 3;
    return {
      exerciseId,
      sets: Array.from({ length: setCount }, (_, i) => ({
        setNumber: i + 1,
        targetReps: repRange,
        targetWeightKg: null,
        isDeload: false,
        note: 'First session. Start light and find your working weight.',
      })),
      progressionNote: 'First session. Start light and find your working weight.',
    };
  }

  const lower = isLowerBody(exerciseId);
  const lastWeight = getWorkingWeight(completedLast);
  const lastTotalReps = getTotalReps(lastSession);

  // Step 4 — Failure detection (2 consecutive regressions at same weight)
  if (previousSessions.length >= 1) {
    const prev0 = previousSessions[0];
    const prev0Total = getTotalReps(prev0);

    // Check if last session regressed from prev[0] at the same weight
    if (
      sameWeight(completedLast, prev0) &&
      lastTotalReps < prev0Total
    ) {
      // Check if prev[0] also regressed from prev[1] at same weight
      if (previousSessions.length >= 2) {
        const prev1 = previousSessions[1];
        const prev1Total = getTotalReps(prev1);

        if (sameWeight(prev0, prev1) && prev0Total < prev1Total) {
          // Two consecutive regressions → deload
          const deloadWeight = equipment === 'bodyweight'
            ? null
            : roundToNearest(lastWeight * 0.9, equipment === 'barbell' ? 2.5 : 1);

          return {
            exerciseId,
            sets: completedLast.map((_, i) => ({
              setNumber: i + 1,
              targetReps: repRange,
              targetWeightKg: deloadWeight,
              isDeload: true,
              note: 'Deload: -10%',
            })),
            progressionNote: 'Deload week: -10% weight. Focus on form.',
          };
        }
      }
    }
  }

  // Step 1+2 — All sets at top of rep range → increase weight
  if (allSetsAtTopOfRange(lastSession, repRange.max)) {
    if (equipment === 'bodyweight') {
      // Bodyweight: add +2 reps to each set instead of weight
      const newMin = repRange.min + 2;
      const newMax = repRange.max + 2;
      return {
        exerciseId,
        sets: completedLast.map((_, i) => ({
          setNumber: i + 1,
          targetReps: { min: newMin, max: newMax },
          targetWeightKg: null,
          isDeload: false,
        })),
        progressionNote: `↑ +2 reps per set from last session`,
      };
    }

    const increment = getWeightIncrement(equipment, lower);
    const newWeight = lastWeight + increment;

    return {
      exerciseId,
      sets: completedLast.map((_, i) => ({
        setNumber: i + 1,
        targetReps: repRange,
        targetWeightKg: newWeight,
        isDeload: false,
        note: `Weight increase from last session`,
      })),
      progressionNote: `↑ ${increment}kg from last session`,
    };
  }

  // Step 3 — Not at top of range → keep same weight, aim for +1 rep
  return {
    exerciseId,
    sets: completedLast.map((_, i) => ({
      setNumber: i + 1,
      targetReps: repRange,
      targetWeightKg: equipment === 'bodyweight' ? null : lastWeight,
      isDeload: false,
    })),
    progressionNote: 'Same weight. Aim for +1 rep per set.',
  };
}

// ── Workout-level helper ───────────────────────────────────────────

export function getTargetsForWorkout(
  workoutExercises: { exerciseId: string; sets: number; reps: { min: number; max: number } }[],
  workoutHistory: CompletedWorkout[],
  fitnessLevel: FitnessLevel,
  equipment: ExerciseEquipment,
): ExerciseProgression[] {
  return workoutExercises.map((we) => {
    const history = getExerciseHistory(we.exerciseId, workoutHistory, 3);

    if (history.length === 0) {
      // No history — first time
      return {
        exerciseId: we.exerciseId,
        sets: Array.from({ length: we.sets }, (_, i) => ({
          setNumber: i + 1,
          targetReps: we.reps,
          targetWeightKg: null,
          isDeload: false,
          note: 'First session. Start light and find your working weight.',
        })),
        progressionNote: 'First session. Start light and find your working weight.',
      };
    }

    const lastSession = history[0];
    const previousSessions = history.slice(1);

    // Use the exercise's own equipment type if available, otherwise fall back to global
    const exerciseData = exercises[we.exerciseId];
    const exerciseEquipment = exerciseData ? exerciseData.equipment : equipment;

    return calculateNextSession(
      we.exerciseId,
      lastSession,
      previousSessions,
      fitnessLevel,
      exerciseEquipment,
    );
  });
}
