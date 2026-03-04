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
  history: NutritionCheckin[];

  ensureToday: () => void;
  resetToday: () => void;
  logProteinPortion: () => void;
  logVeggiePortion: () => void;
  logWater: () => void;
  setFollowedPlan: (followed: boolean) => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      todayCheckin: emptyCheckin(),
      history: [],

      ensureToday: () => {
        const today = getTodayDate();
        const stale = get().todayCheckin;
        if (stale.date !== today) {
          const hasData =
            stale.proteinServings > 0 ||
            stale.veggieServings > 0 ||
            stale.waterGlasses > 0 ||
            stale.followedPlan !== null;
          set({
            todayCheckin: emptyCheckin(),
            ...(hasData ? { history: [...get().history, stale] } : {}),
          });
        }
      },

      resetToday: () => set({ todayCheckin: emptyCheckin() }),

      logProteinPortion: () => {
        set((state) => ({
          todayCheckin: {
            ...state.todayCheckin,
            proteinServings: state.todayCheckin.proteinServings + 1,
          },
        }));
        const { debouncedSyncNutrition } = require('@/services/sync');
        debouncedSyncNutrition();
      },

      logVeggiePortion: () => {
        set((state) => ({
          todayCheckin: {
            ...state.todayCheckin,
            veggieServings: state.todayCheckin.veggieServings + 1,
          },
        }));
        const { debouncedSyncNutrition } = require('@/services/sync');
        debouncedSyncNutrition();
      },

      logWater: () => {
        set((state) => ({
          todayCheckin: {
            ...state.todayCheckin,
            waterGlasses: state.todayCheckin.waterGlasses + 1,
          },
        }));
        const { debouncedSyncNutrition } = require('@/services/sync');
        debouncedSyncNutrition();
      },

      setFollowedPlan: (followed) => {
        set((state) => ({
          todayCheckin: {
            ...state.todayCheckin,
            followedPlan: followed,
          },
        }));
        const { debouncedSyncNutrition } = require('@/services/sync');
        debouncedSyncNutrition();
      },
    }),
    {
      name: 'nutrition-store',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
