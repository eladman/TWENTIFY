import { useState, useCallback, useMemo, useEffect } from 'react';
import { startOfWeek, addDays, isSameDay } from 'date-fns';
import { usePlanStore } from '@/stores/usePlanStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useRunStore } from '@/stores/useRunStore';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { useUserStore } from '@/stores/useUserStore';
import { analytics } from '@/services/analytics';
import { syncAllPending } from '@/services/sync';
import type { DayPlan, DayActivity } from '@/types/plan';
import type { CompletedWorkout } from '@/types/workout';
import type { CompletedRun } from '@/types/run';

export type TodayState =
  | 'no_plan'
  | 'completed_today'
  | 'scheduled_workout'
  | 'scheduled_run'
  | 'rest_day';

export type WeekDayStatus =
  | 'completed_gym'
  | 'completed_run'
  | 'scheduled'
  | 'rest'
  | 'missed';

export interface WeekDay {
  date: Date;
  dayIndex: number; // 0=Mon .. 6=Sun
  label: string; // "M", "T", "W", etc.
  status: WeekDayStatus;
  activity: DayActivity | null;
  isToday: boolean;
  isSelected: boolean;
}

export interface TodayData {
  state: TodayState;
  todayPlan: DayPlan | null;
  completedWorkout: CompletedWorkout | null;
  completedRun: CompletedRun | null;
  hasNutritionDomain: boolean;
  proteinLogged: number;
  proteinTarget: number;
  onLogProtein: () => void;
  weekDays: WeekDay[];
  completedCount: number;
  totalScheduled: number;
  refreshing: boolean;
  onRefresh: () => void;
  currentWeek: number;
  selectedDate: Date;
  onSelectDay: (dayIndex: number) => void;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getTodayDayIndex(): number {
  const jsDay = new Date().getDay(); // Sun=0 .. Sat=6
  return (jsDay + 6) % 7; // Mon=0 .. Sun=6
}

export function useToday(): TodayData {
  const weeklySchedule = usePlanStore((s) => s.weeklySchedule);
  const currentWeek = usePlanStore((s) => s.currentWeek);
  const nutritionPlan = usePlanStore((s) => s.nutritionPlan);
  const workoutHistory = useWorkoutStore((s) => s.history);
  const runHistory = useRunStore((s) => s.history);
  const todayCheckin = useNutritionStore((s) => s.todayCheckin);
  const ensureToday = useNutritionStore((s) => s.ensureToday);
  const logProteinPortion = useNutritionStore((s) => s.logProteinPortion);
  const domains = useUserStore((s) => s.domains);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(getTodayDayIndex);

  useEffect(() => {
    ensureToday();
  }, [ensureToday]);

  // Selected day's date
  const selectedDate = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return addDays(monday, selectedDayIndex);
  }, [selectedDayIndex]);

  // Plan for selected day
  const todayPlan = useMemo((): DayPlan | null => {
    if (weeklySchedule.length === 0) return null;
    return weeklySchedule.find((d) => d.dayOfWeek === selectedDayIndex) ?? null;
  }, [weeklySchedule, selectedDayIndex]);

  // Completed on selected day
  const selectedDateStr = getDateString(selectedDate);

  const completedWorkout = useMemo((): CompletedWorkout | null => {
    for (let i = workoutHistory.length - 1; i >= 0; i--) {
      if (workoutHistory[i].completedAt.split('T')[0] === selectedDateStr) {
        return workoutHistory[i];
      }
    }
    return null;
  }, [workoutHistory, selectedDateStr]);

  const completedRun = useMemo((): CompletedRun | null => {
    for (let i = runHistory.length - 1; i >= 0; i--) {
      if (runHistory[i].completedAt.split('T')[0] === selectedDateStr) {
        return runHistory[i];
      }
    }
    return null;
  }, [runHistory, selectedDateStr]);

  // State resolution
  const state = useMemo((): TodayState => {
    if (weeklySchedule.length === 0) return 'no_plan';
    if (completedWorkout || completedRun) return 'completed_today';
    if (!todayPlan) return 'rest_day';
    if (todayPlan.activity === 'gym') return 'scheduled_workout';
    if (todayPlan.activity === 'run') return 'scheduled_run';
    return 'rest_day';
  }, [weeklySchedule, completedWorkout, completedRun, todayPlan]);

  // Nutrition
  const hasNutritionDomain = domains.includes('nutrition');
  const proteinLogged = todayCheckin.proteinServings;
  const proteinTarget = nutritionPlan?.proteinPortions ?? 4;

  const onLogProtein = useCallback(() => {
    analytics.track('nutrition_logged', {
      type: 'protein',
      daily_count: todayCheckin.proteinServings + 1,
    });
    logProteinPortion();
  }, [logProteinPortion, todayCheckin.proteinServings]);

  // Day selection
  const onSelectDay = useCallback((dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
  }, []);

  // Week strip
  const weekDays = useMemo((): WeekDay[] => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    const days: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(monday, i);
      const dateStr = getDateString(date);
      const isToday = isSameDay(date, today);
      const isPast = date < today && !isToday;

      // Find the plan for this day
      const plan = weeklySchedule.find((d) => d.dayOfWeek === i);

      // Check if completed
      const hasGymCompletion = workoutHistory.some(
        (w) => w.completedAt.split('T')[0] === dateStr
      );
      const hasRunCompletion = runHistory.some(
        (r) => r.completedAt.split('T')[0] === dateStr
      );

      let status: WeekDayStatus;
      if (hasGymCompletion) {
        status = 'completed_gym';
      } else if (hasRunCompletion) {
        status = 'completed_run';
      } else if (!plan || plan.activity === 'rest' || plan.activity === 'nutrition_only') {
        status = 'rest';
      } else if (isPast) {
        status = 'missed';
      } else {
        status = 'scheduled';
      }

      days.push({
        date,
        dayIndex: i,
        label: DAY_LABELS[i],
        status,
        activity: plan?.activity ?? null,
        isToday,
        isSelected: i === selectedDayIndex,
      });
    }

    return days;
  }, [weeklySchedule, workoutHistory, runHistory, selectedDayIndex]);

  const completedCount = weekDays.filter(
    (d) => d.status === 'completed_gym' || d.status === 'completed_run'
  ).length;

  const totalScheduled = weeklySchedule.filter(
    (d) => d.activity === 'gym' || d.activity === 'run'
  ).length;

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    ensureToday();
    try { await syncAllPending(); } catch {}
    setRefreshing(false);
  }, [ensureToday]);

  return {
    state,
    todayPlan,
    completedWorkout,
    completedRun,
    hasNutritionDomain,
    proteinLogged,
    proteinTarget,
    onLogProtein,
    weekDays,
    completedCount,
    totalScheduled,
    refreshing,
    onRefresh,
    currentWeek,
    selectedDate,
    onSelectDay,
  };
}
