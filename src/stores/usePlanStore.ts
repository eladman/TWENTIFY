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
  advanceWeek: () => void;
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
      advanceWeek: () => set((state) => ({ currentWeek: state.currentWeek + 1 })),
      reset: () => set(initialState),
    }),
    {
      name: 'plan-store',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
