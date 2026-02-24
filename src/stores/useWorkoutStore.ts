import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type {
  ActiveWorkout,
  CompletedWorkout,
  SetData,
  WorkoutTemplate,
} from '@/types/workout';

interface WorkoutState {
  activeSession: ActiveWorkout | null;
  history: CompletedWorkout[];

  startWorkout: (template: WorkoutTemplate) => void;
  completeSet: (exerciseIndex: number, setIndex: number, data: SetData) => void;
  nextSet: () => void;
  finishWorkout: () => void;
  abandonWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      history: [],

      startWorkout: (template) =>
        set({
          activeSession: {
            templateId: template.id,
            startedAt: new Date().toISOString(),
            currentExerciseIndex: 0,
            currentSetIndex: 0,
            exercises: template.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              sets: ex.sets.map(() => null),
            })),
          },
        }),

      completeSet: (exerciseIndex, setIndex, data) =>
        set((state) => {
          if (!state.activeSession) return state;
          const exercises = [...state.activeSession.exercises];
          const sets = [...exercises[exerciseIndex].sets];
          sets[setIndex] = data;
          exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
          return {
            activeSession: { ...state.activeSession, exercises },
          };
        }),

      nextSet: () =>
        set((state) => {
          if (!state.activeSession) return state;
          const { currentExerciseIndex, currentSetIndex, exercises } =
            state.activeSession;
          const currentExercise = exercises[currentExerciseIndex];
          if (currentSetIndex + 1 < currentExercise.sets.length) {
            return {
              activeSession: {
                ...state.activeSession,
                currentSetIndex: currentSetIndex + 1,
              },
            };
          }
          if (currentExerciseIndex + 1 < exercises.length) {
            return {
              activeSession: {
                ...state.activeSession,
                currentExerciseIndex: currentExerciseIndex + 1,
                currentSetIndex: 0,
              },
            };
          }
          return state;
        }),

      finishWorkout: () =>
        set((state) => {
          if (!state.activeSession) return state;
          const completed: CompletedWorkout = {
            id: Date.now().toString(),
            templateId: state.activeSession.templateId,
            startedAt: state.activeSession.startedAt,
            completedAt: new Date().toISOString(),
            durationSeconds: Math.floor(
              (Date.now() - new Date(state.activeSession.startedAt).getTime()) /
                1000
            ),
            exercises: state.activeSession.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              sets: ex.sets.filter((s): s is SetData => s !== null),
            })),
          };
          return {
            activeSession: null,
            history: [...state.history, completed],
          };
        }),

      abandonWorkout: () => set({ activeSession: null }),
    }),
    {
      name: 'workout-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);
