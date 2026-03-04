import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type { DayPlan, GymPlan, RunPlan } from '@/types/plan';
import type { NutritionPlan } from '@/types/nutrition';

interface PlanState {
  weeklySchedule: DayPlan[];
  currentWeek: number;
  gymPlan: GymPlan | null;
  runPlan: RunPlan | null;
  nutritionPlan: NutritionPlan | null;

  setWeeklySchedule: (schedule: DayPlan[]) => void;
  setGymPlan: (plan: GymPlan) => void;
  setRunPlan: (plan: RunPlan) => void;
  setNutritionPlan: (plan: NutritionPlan) => void;
  setPlan: (plan: {
    weeklySchedule: DayPlan[];
    gymPlan?: GymPlan;
    runPlan?: RunPlan;
    nutritionPlan?: NutritionPlan;
  }) => void;
  advanceWeek: () => void;
  clearPlan: () => void;
  reset: () => void;
}

const initialState = {
  weeklySchedule: [] as DayPlan[],
  currentWeek: 1,
  gymPlan: null as GymPlan | null,
  runPlan: null as RunPlan | null,
  nutritionPlan: null as NutritionPlan | null,
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      ...initialState,

      setWeeklySchedule: (schedule) => set({ weeklySchedule: schedule }),
      setGymPlan: (plan) => set({ gymPlan: plan }),
      setRunPlan: (plan) => set({ runPlan: plan }),
      setNutritionPlan: (plan) => set({ nutritionPlan: plan }),
      setPlan: (plan) => {
        set({
          weeklySchedule: plan.weeklySchedule,
          gymPlan: plan.gymPlan ?? null,
          runPlan: plan.runPlan ?? null,
          nutritionPlan: plan.nutritionPlan ?? null,
        });
        const { syncPlan } = require('@/services/sync');
        void syncPlan();
      },
      advanceWeek: () => set((state) => ({ currentWeek: state.currentWeek + 1 })),
      clearPlan: () => set(initialState),
      reset: () => set(initialState),
    }),
    {
      name: 'plan-store',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
