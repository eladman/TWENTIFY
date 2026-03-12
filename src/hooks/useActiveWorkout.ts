import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { useUserStore } from '@/stores/useUserStore';
import { exercises } from '@/data/exercises';
import { getTargetsForWorkout, type ExerciseProgression } from '@/services/progressiveOverload';
import { displayWeightToKg, kgToDisplayWeight, getWeightStep, getUnitLabel } from '@/utils/formatters';
import { analytics } from '@/services/analytics';
import { haptics } from '@/utils/haptics';
import type { WorkoutTemplate, ExerciseEquipment } from '@/types/workout';
import type { Units } from '@/types/user';

export type WorkoutPhase = 'exercise' | 'rest' | 'transition' | 'complete' | 'error';

export interface ActiveWorkoutState {
  phase: WorkoutPhase;
  template: WorkoutTemplate | null;
  exerciseIndex: number;
  setIndex: number;
  totalExercises: number;
  currentExercise: typeof exercises[string] | null;
  currentProgression: ExerciseProgression | null;
  totalSets: number;
  displayWeight: number;
  displayReps: number;
  units: Units;
  unitLabel: string;
  weightStep: number;
  isBodyweight: boolean;
  previousRef: string;
  placeholderWeight: number | null;
  placeholderReps: number | null;
  placeholderSource: 'last_session' | 'prev_set' | null;
  showFlash: boolean;
  progressions: ExerciseProgression[];
  handleSetWeight: (value: number) => void;
  handleSetReps: (value: number) => void;
  handleCompleteSet: () => void;
  handleSkipRest: () => void;
  handleRestComplete: () => void;
  handleExit: () => void;
  handleFinish: () => void;
  restSeconds: number;
  nextSetInfo: {
    exerciseName: string;
    setNumber: number;
    totalSets: number;
    targetReps: { min: number; max: number };
  };
}

function equipmentFromAccess(access?: string): ExerciseEquipment {
  switch (access) {
    case 'full_gym': return 'barbell';
    case 'dumbbells': return 'dumbbell';
    case 'bodyweight': return 'bodyweight';
    default: return 'barbell';
  }
}

function isLowerBody(exerciseId: string): boolean {
  const ex = exercises[exerciseId];
  if (!ex) return false;
  return ex.movementPattern === 'squat' || ex.movementPattern === 'hinge';
}

export function useActiveWorkout(workoutId: string): ActiveWorkoutState {
  // Store selectors
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const history = useWorkoutStore((s) => s.history);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const completeSet = useWorkoutStore((s) => s.completeSet);
  const nextSet = useWorkoutStore((s) => s.nextSet);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const getLastSessionForExercise = useWorkoutStore((s) => s.getLastSessionForExercise);

  const gymPlan = usePlanStore((s) => s.gymPlan);
  const weeklySchedule = usePlanStore((s) => s.weeklySchedule);

  const units = useUserStore((s) => s.settings.units);
  const fitnessLevel = useUserStore((s) => s.fitnessLevel);
  const profile = useUserStore((s) => s.profile);

  // Find template
  const template = useMemo((): WorkoutTemplate | null => {
    // Search gymPlan.templates first
    const fromPlan = gymPlan?.templates.find((t) => t.id === workoutId);
    if (fromPlan) return fromPlan;
    // Fall back to weeklySchedule
    const fromSchedule = weeklySchedule.find(
      (d) => d.workoutTemplate?.id === workoutId,
    );
    return fromSchedule?.workoutTemplate ?? null;
  }, [gymPlan, weeklySchedule, workoutId]);

  // Equipment
  const equipment = useMemo(
    () => equipmentFromAccess(profile?.equipmentAccess),
    [profile?.equipmentAccess],
  );

  // Progressive overload targets
  const progressions = useMemo((): ExerciseProgression[] => {
    if (!template) return [];
    const mapped = template.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets.length,
      reps: { min: ex.sets[0]?.targetReps[0] ?? 6, max: ex.sets[0]?.targetReps[1] ?? 8 },
    }));
    return getTargetsForWorkout(mapped, history, fitnessLevel ?? 'beginner', equipment);
  }, [template, history, fitnessLevel, equipment]);

  // Phase state
  const [phase, setPhase] = useState<WorkoutPhase>('exercise');
  const [showFlash, setShowFlash] = useState(false);
  const hasStartedRef = useRef(false);
  const hasFinishedRef = useRef(false);
  const capturedRestSecondsRef = useRef(90);

  // Start workout on mount
  useEffect(() => {
    if (!template) {
      setPhase('error');
      return;
    }
    if (!activeSession && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startWorkout(template);
      analytics.track('workout_started', {
        template: template.id,
        exercise_count: template.exercises.length,
        estimated_minutes: template.estimatedDurationMin ?? null,
      });
    }
  }, [template, activeSession, startWorkout]);

  // Indices from store
  const exerciseIndex = activeSession?.currentExerciseIndex ?? 0;
  const setIndex = activeSession?.currentSetIndex ?? 0;
  const totalExercises = template?.exercises.length ?? 0;

  // Current exercise data
  const currentExerciseId = template?.exercises[exerciseIndex]?.exerciseId ?? '';
  const currentExercise = exercises[currentExerciseId] ?? null;
  const currentProgression = progressions[exerciseIndex] ?? null;
  const totalSets = currentProgression?.sets.length ?? template?.exercises[exerciseIndex]?.sets.length ?? 0;

  // Current set target
  const currentSetTarget = currentProgression?.sets[setIndex] ?? null;

  // Weight/reps display state
  const isBodyweight = currentExercise?.equipment === 'bodyweight';
  const weightStep = currentExercise
    ? getWeightStep(currentExercise.equipment, isLowerBody(currentExerciseId), units)
    : 2.5;
  const unitLabel = getUnitLabel(units);

  // Initialize display weight/reps from target when exercise/set changes
  const [displayWeight, setDisplayWeight] = useState(0);
  const [displayReps, setDisplayReps] = useState(0);
  const prevKeyRef = useRef('');

  useEffect(() => {
    const key = `${exerciseIndex}-${setIndex}`;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    const targetKg = currentSetTarget?.targetWeightKg ?? 0;
    setDisplayWeight(targetKg > 0 ? kgToDisplayWeight(targetKg, units) : 0);
    setDisplayReps(currentSetTarget?.targetReps.max ?? currentExercise?.defaultReps.max ?? 8);
  }, [exerciseIndex, setIndex, currentSetTarget, units, currentExercise]);

  // Previous reference string
  const previousRef = useMemo(() => {
    const lastSets = getLastSessionForExercise(currentExerciseId);
    if (!lastSets || lastSets.length === 0) return 'First time';
    const set = lastSets[Math.min(setIndex, lastSets.length - 1)];
    const w = kgToDisplayWeight(set.weightKg, units);
    return `Previous: ${w}${unitLabel} \u00d7 ${set.reps}`;
  }, [currentExerciseId, setIndex, getLastSessionForExercise, units, unitLabel]);

  // Placeholder from previous data
  const { placeholderWeight, placeholderReps, placeholderSource } = useMemo(() => {
    // Source A: previous session for the same exercise
    const lastSets = getLastSessionForExercise(currentExerciseId);
    if (lastSets && lastSets.length > 0) {
      const set = lastSets[Math.min(setIndex, lastSets.length - 1)];
      return {
        placeholderWeight: kgToDisplayWeight(set.weightKg, units),
        placeholderReps: set.reps,
        placeholderSource: 'last_session' as const,
      };
    }
    // Source B: previous set in current workout
    if (setIndex > 0 && activeSession) {
      const prevSet = activeSession.exercises[exerciseIndex]?.sets[setIndex - 1];
      if (prevSet && prevSet.completed) {
        return {
          placeholderWeight: kgToDisplayWeight(prevSet.weightKg, units),
          placeholderReps: prevSet.reps,
          placeholderSource: 'prev_set' as const,
        };
      }
    }
    return { placeholderWeight: null, placeholderReps: null, placeholderSource: null };
  }, [currentExerciseId, setIndex, getLastSessionForExercise, units, activeSession, exerciseIndex]);

  // Weight/reps handlers
  const maxWeight = units === 'metric' ? 500 : 1000;

  const handleSetWeight = useCallback((value: number) => {
    if (isBodyweight) return;
    setDisplayWeight(Math.min(maxWeight, Math.max(0, Math.round(value * 10) / 10)));
  }, [isBodyweight, maxWeight]);

  const handleSetReps = useCallback((value: number) => {
    setDisplayReps(Math.min(999, Math.max(0, Math.round(value))));
  }, []);

  // Complete set
  const handleCompleteSet = useCallback(() => {
    const weightKg = isBodyweight ? 0 : displayWeightToKg(displayWeight, units);
    completeSet(exerciseIndex, setIndex, {
      reps: displayReps,
      weightKg,
      completed: true,
    });

    analytics.track('set_completed', {
      exercise_id: currentExerciseId,
      set_number: setIndex + 1,
      weight_kg: weightKg,
      reps: displayReps,
      is_deload: currentSetTarget?.isDeload ?? false,
    });

    // Flash animation
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 650);

    const isLastSet = setIndex + 1 >= totalSets;
    const isLastExercise = exerciseIndex + 1 >= totalExercises;

    if (isLastSet && isLastExercise) {
      setPhase('complete');
    } else if (isLastSet) {
      capturedRestSecondsRef.current = currentExercise?.restSeconds ?? 90;
      nextSet();
      setPhase('transition');
      setTimeout(() => setPhase('rest'), 300);
    } else {
      capturedRestSecondsRef.current = currentExercise?.restSeconds ?? 90;
      nextSet();
      setPhase('rest');
    }
  }, [
    isBodyweight, displayWeight, displayReps, units,
    completeSet, exerciseIndex, setIndex, totalSets,
    totalExercises, nextSet, currentExercise, currentExerciseId,
  ]);

  // Rest handlers
  const handleSkipRest = useCallback(() => {
    setPhase('exercise');
  }, []);

  const handleRestComplete = useCallback(() => {
    setPhase('exercise');
  }, []);

  // Rest seconds — captured at rest-phase entry to avoid flicker when exerciseIndex advances
  const restSeconds = capturedRestSecondsRef.current;

  // Next set info for rest timer
  const nextSetInfo = useMemo(() => {
    // After nextSet() has been called, activeSession indices already point to the next set
    const nextExIdx = activeSession?.currentExerciseIndex ?? exerciseIndex;
    const nextSetIdx = activeSession?.currentSetIndex ?? setIndex;
    const nextExId = template?.exercises[nextExIdx]?.exerciseId ?? '';
    const nextEx = exercises[nextExId];
    const nextProg = progressions[nextExIdx];
    const nextTarget = nextProg?.sets[nextSetIdx];

    return {
      exerciseName: nextEx?.name ?? '',
      setNumber: nextSetIdx + 1,
      totalSets: nextProg?.sets.length ?? 0,
      targetReps: nextTarget
        ? { min: nextTarget.targetReps.min, max: nextTarget.targetReps.max }
        : { min: 6, max: 8 },
    };
  }, [activeSession?.currentExerciseIndex, activeSession?.currentSetIndex, template, progressions, exerciseIndex, setIndex]);

  // Exit
  const handleExit = useCallback(() => {
    Alert.alert(
      'End Workout?',
      'Your progress so far will be saved.',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: () => {
            const session = useWorkoutStore.getState().activeSession;
            analytics.track('workout_abandoned', {
              exercise_reached: (session?.currentExerciseIndex ?? exerciseIndex) + 1,
              sets_completed: session?.exercises.reduce(
                (sum, ex) => sum + ex.sets.filter((s): s is NonNullable<typeof s> => s != null && s.completed).length,
                0,
              ) ?? 0,
            });
            finishWorkout();
            router.back();
          },
        },
      ],
    );
  }, [finishWorkout, exerciseIndex]);

  // Finish (called when phase === 'complete')
  const handleFinish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    const session = useWorkoutStore.getState().activeSession;
    if (session) {
      const totalSetsCompleted = session.exercises.reduce(
        (sum, ex) => sum + ex.sets.filter((s): s is NonNullable<typeof s> => s != null && s.completed).length,
        0,
      );
      const totalVolumeKg = session.exercises.reduce(
        (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set != null && set.completed ? set.weightKg * set.reps : 0), 0),
        0,
      );
      const durationSeconds = session.startedAt
        ? Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)
        : 0;
      analytics.track('workout_completed', {
        duration_seconds: durationSeconds,
        total_volume_kg: totalVolumeKg,
        exercises_completed: session.exercises.length,
        total_sets: totalSetsCompleted,
      });
    }

    haptics.success();
    finishWorkout();
    setTimeout(() => {
      router.replace('/workout/summary');
    }, 600);
  }, [finishWorkout]);

  return {
    phase,
    template,
    exerciseIndex,
    setIndex,
    totalExercises,
    currentExercise,
    currentProgression,
    totalSets,
    displayWeight,
    displayReps,
    units,
    unitLabel,
    weightStep,
    isBodyweight,
    previousRef,
    placeholderWeight,
    placeholderReps,
    placeholderSource,
    showFlash,
    progressions,
    handleSetWeight,
    handleSetReps,
    handleCompleteSet,
    handleSkipRest,
    handleRestComplete,
    handleExit,
    handleFinish,
    restSeconds,
    nextSetInfo,
  };
}
