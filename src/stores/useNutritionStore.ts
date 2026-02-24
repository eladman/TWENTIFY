import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type { NutritionCheckin } from '@/types/nutrition';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function emptyCheckin(): NutritionCheckin {
  return {
    date: getTodayDate(),
    proteinServings: 0,
    veggieServings: 0,
    waterGlasses: 0,
    followedPlan: null,
  };
}

interface NutritionState {
  todayCheckin: NutritionCheckin;

  ensureToday: () => void;
  logProteinPortion: () => void;
  logVeggiePortion: () => void;
  logWater: () => void;
  setFollowedPlan: (followed: boolean) => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      todayCheckin: emptyCheckin(),

      ensureToday: () => {
        const today = getTodayDate();
        if (get().todayCheckin.date !== today) {
          set({ todayCheckin: emptyCheckin() });
        }
      },

      logProteinPortion: () =>
        set((state) => ({
          todayCheckin: {
            ...state.todayCheckin,
            proteinServings: state.todayCheckin.proteinServings + 1,
          },
        })),

      logVeggiePortion: () =>
        set((state) => ({
          todayCheckin: {
            ...state.todayCheckin,
            veggieServings: state.todayCheckin.veggieServings + 1,
          },
        })),

      logWater: () =>
        set((state) => ({
          todayCheckin: {
            ...state.todayCheckin,
            waterGlasses: state.todayCheckin.waterGlasses + 1,
          },
        })),

      setFollowedPlan: (followed) =>
        set((state) => ({
          todayCheckin: {
            ...state.todayCheckin,
            followedPlan: followed,
          },
        })),
    }),
    {
      name: 'nutrition-store',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
