import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import { generateUUID } from '@/utils/uuid';
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
  skipSet: (exerciseIndex: number, setIndex: number) => void;
  nextSet: () => void;
  finishWorkout: () => void;
  abandonWorkout: () => void;
  getLastSessionForExercise: (exerciseId: string) => SetData[] | null;
  markWorkoutSynced: (id: string) => void;
  updateWorkoutId: (oldId: string, newId: string) => void;
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

      skipSet: (exerciseIndex, setIndex) => {
        get().completeSet(exerciseIndex, setIndex, {
          reps: 0,
          weightKg: 0,
          completed: false,
        });
        get().nextSet();
      },

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

      finishWorkout: () => {
        const state = get();
        if (!state.activeSession) return;
        const completed: CompletedWorkout = {
          id: generateUUID(),
          templateId: state.activeSession.templateId,
          startedAt: state.activeSession.startedAt,
          completedAt: new Date().toISOString(),
          durationSeconds: Math.floor(
            (Date.now() - new Date(state.activeSession.startedAt).getTime()) / 1000,
          ),
          exercises: state.activeSession.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets.filter((s): s is SetData => s !== null),
          })),
          synced: false,
        };
        set({ activeSession: null, history: [...state.history, completed] });
        const { syncWorkoutSession } = require('@/services/sync');
        void syncWorkoutSession(completed);
      },

      abandonWorkout: () => set({ activeSession: null }),

      markWorkoutSynced: (id) =>
        set((state) => ({
          history: state.history.map((w) => (w.id === id ? { ...w, synced: true } : w)),
        })),

      updateWorkoutId: (oldId, newId) =>
        set((state) => ({
          history: state.history.map((w) => (w.id === oldId ? { ...w, id: newId } : w)),
        })),

      getLastSessionForExercise: (exerciseId) => {
        const { history } = get();
        for (let i = history.length - 1; i >= 0; i--) {
          const ex = history[i].exercises.find(
            (e) => e.exerciseId === exerciseId
          );
          if (ex) return ex.sets;
        }
        return null;
      },
    }),
    {
      name: 'workout-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);
