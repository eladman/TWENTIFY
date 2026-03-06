import { useState, useCallback, useMemo } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useRunStore } from '@/stores/useRunStore';
import { exercises } from '@/data/exercises';
import { syncAllPending } from '@/services/sync';
import type { Units } from '@/types/user';
import type { MovementPattern } from '@/types/workout';

const TARGET_PATTERNS: MovementPattern[] = [
  'squat',
  'hinge',
  'push_horizontal',
  'push_vertical',
  'pull_horizontal',
];

export interface TrendChartItem {
  exerciseId: string;
  title: string;
}

export interface ProgressData {
  hasGymDomain: boolean;
  hasRunningDomain: boolean;
  units: Units;
  trendCharts: TrendChartItem[];
  hasWorkoutHistory: boolean;
  hasRunHistory: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function useProgress(): ProgressData {
  const domains = useUserStore((s) => s.domains);
  const units = useUserStore((s) => s.settings.units);
  const gymPlan = usePlanStore((s) => s.gymPlan);
  const workoutHistory = useWorkoutStore((s) => s.history);
  const runHistory = useRunStore((s) => s.history);

  const [refreshing, setRefreshing] = useState(false);

  const hasGymDomain = domains.includes('gym');
  const hasRunningDomain = domains.includes('running');
  const hasWorkoutHistory = workoutHistory.length > 0;
  const hasRunHistory = runHistory.length > 0;

  const trendCharts = useMemo((): TrendChartItem[] => {
    if (!gymPlan) return [];

    // Collect unique exercise IDs from plan templates, preserving order
    const seen = new Set<string>();
    const planExerciseIds: string[] = [];
    for (const template of gymPlan.templates) {
      for (const ex of template.exercises) {
        if (!seen.has(ex.exerciseId)) {
          seen.add(ex.exerciseId);
          planExerciseIds.push(ex.exerciseId);
        }
      }
    }

    // For each target pattern, find the first matching exercise from the plan
    const matched = new Set<string>();
    const result: TrendChartItem[] = [];

    for (const pattern of TARGET_PATTERNS) {
      for (const id of planExerciseIds) {
        if (matched.has(id)) continue;
        const ex = exercises[id];
        if (ex && ex.movementPattern === pattern) {
          matched.add(id);
          result.push({ exerciseId: id, title: ex.name });
          break;
        }
      }
    }

    return result;
  }, [gymPlan]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await syncAllPending(); } catch {}
    setRefreshing(false);
  }, []);

  return {
    hasGymDomain,
    hasRunningDomain,
    units,
    trendCharts,
    hasWorkoutHistory,
    hasRunHistory,
    refreshing,
    onRefresh,
  };
}
