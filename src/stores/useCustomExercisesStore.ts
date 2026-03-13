import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import { generateUUID } from '@/utils/uuid';
import type { Exercise, ExerciseEquipment } from '@/types/workout';

export interface CustomExercise extends Exercise {
  synced: boolean;
}

interface CustomExercisesState {
  customExercises: Record<string, CustomExercise>;
  addCustomExercise(params: {
    name: string;
    category: Exercise['category'];
    primaryMuscles: string[];
    equipment: ExerciseEquipment;
  }): string;
  removeCustomExercise(id: string): void;
  markExerciseSynced(id: string): void;
  setCustomExercises(exercises: Record<string, CustomExercise>): void;
}

export const useCustomExercisesStore = create<CustomExercisesState>()(
  persist(
    (set, get) => ({
      customExercises: {},

      addCustomExercise({ name, category, primaryMuscles, equipment }) {
        const id = `custom_${generateUUID()}`;
        const exercise: CustomExercise = {
          id,
          name,
          category,
          movementPattern: 'accessory',
          primaryMuscles,
          secondaryMuscles: [],
          equipment,
          alternatives: [],
          citationIds: [],
          instructions: '',
          cues: [],
          defaultReps: { min: 8, max: 12 },
          defaultSets: 3,
          restSeconds: 90,
          synced: false,
        };
        set((state) => ({
          customExercises: { ...state.customExercises, [id]: exercise },
        }));

        // Fire-and-forget sync
        try {
          const { syncCustomExercise } = require('@/services/sync');
          void syncCustomExercise(exercise);
        } catch {}

        return id;
      },

      removeCustomExercise(id: string) {
        set((state) => {
          const next = { ...state.customExercises };
          delete next[id];
          return { customExercises: next };
        });

        // Fire-and-forget sync deletion
        try {
          const { syncDeleteCustomExercise } = require('@/services/sync');
          void syncDeleteCustomExercise(id);
        } catch {}
      },

      markExerciseSynced(id: string) {
        set((state) => {
          const ex = state.customExercises[id];
          if (!ex) return state;
          return {
            customExercises: {
              ...state.customExercises,
              [id]: { ...ex, synced: true },
            },
          };
        });
      },

      setCustomExercises(exercises: Record<string, CustomExercise>) {
        set({ customExercises: exercises });
      },
    }),
    {
      name: 'custom-exercises-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
