import { useMemo } from 'react';
import { View, ViewStyle, TextStyle, useWindowDimensions, Text as RNText } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getDaysInMonth, getDay, format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useRunStore } from '@/stores/useRunStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { screenPadding } from '@/theme/spacing';
import type { DayActivity } from '@/types/plan';

interface ConsistencyGridProps {
  month?: Date;
}

type CellState =
  | 'completed_gym'
  | 'completed_run'
  | 'completed_both'
  | 'rest'
  | 'scheduled'
  | 'missed'
  | 'outside';

const CELL_RADIUS = 6;
const CELL_GAP = 4;
const CARD_PADDING = 16;
const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Convert JS getDay() (0=Sun..6=Sat) to plan store's index (0=Mon..6=Sun) */
function jsDayToPlanDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export function ConsistencyGrid({ month }: ConsistencyGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const workoutHistory = useWorkoutStore((s) => s.history);
  const runHistory = useRunStore((s) => s.history);
  const weeklySchedule = usePlanStore((s) => s.weeklySchedule);

  const targetMonth = month ?? new Date();
  const year = targetMonth.getFullYear();
  const monthIndex = targetMonth.getMonth();

  const cellSize = useMemo(() => {
    const availableWidth = screenWidth - screenPadding.horizontal * 2 - CARD_PADDING * 2;
    return Math.floor((availableWidth - 6 * CELL_GAP) / 7);
  }, [screenWidth]);

  // Build lookup sets and plan map
  const gymDates = useMemo(() => {
    const s = new Set<string>();
    for (const w of workoutHistory) {
      s.add(getDateString(new Date(w.completedAt)));
    }
    return s;
  }, [workoutHistory]);

  const runDates = useMemo(() => {
    const s = new Set<string>();
    for (const r of runHistory) {
      s.add(getDateString(new Date(r.completedAt)));
    }
    return s;
  }, [runHistory]);

  const planMap = useMemo(() => {
    const m = new Map<number, DayActivity>();
    for (const day of weeklySchedule) {
      m.set(day.dayOfWeek, day.activity);
    }
    return m;
  }, [weeklySchedule]);

  // Build grid cells
  const { cells, completedCount, plannedCount } = useMemo(() => {
    const daysInMonth = getDaysInMonth(new Date(year, monthIndex));
    const firstDayJS = getDay(new Date(year, monthIndex, 1)); // 0=Sun..6=Sat
    const todayStr = getDateString(new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result: { state: CellState; isToday: boolean; activity: DayActivity | null }[] = [];
    let completed = 0;
    let planned = 0;

    // Leading padding
    for (let i = 0; i < firstDayJS; i++) {
      result.push({ state: 'outside', isToday: false, activity: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dateStr = getDateString(date);
      const isToday = dateStr === todayStr;
      const isPast = date < today && !isToday;
      const planDayIndex = jsDayToPlanDay(getDay(date));
      const activity = planMap.get(planDayIndex);

      const hasGym = gymDates.has(dateStr);
      const hasRun = runDates.has(dateStr);

      let state: CellState;

      if (hasGym && hasRun) {
        state = 'completed_both';
        completed += 2;
        planned += 2;
      } else if (hasGym) {
        state = 'completed_gym';
        completed += 1;
        planned += 1;
      } else if (hasRun) {
        state = 'completed_run';
        completed += 1;
        planned += 1;
      } else if (!activity || activity === 'rest' || activity === 'nutrition_only') {
        state = 'rest';
      } else if (isPast) {
        state = 'missed';
        planned += 1;
      } else {
        state = 'scheduled';
        planned += 1;
      }

      result.push({ state, isToday, activity: activity ?? null });
    }

    // Trailing padding
    const totalCells = result.length;
    const remainder = totalCells % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        result.push({ state: 'outside', isToday: false, activity: null });
      }
    }

    return { cells: result, completedCount: completed, plannedCount: planned };
  }, [year, monthIndex, gymDates, runDates, planMap]);

  const monthLabel = format(new Date(year, monthIndex, 1), 'MMMM yyyy');
  const rows: { state: CellState; isToday: boolean; activity: DayActivity | null }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <Card variant="info">
      {/* Title row */}
      <View style={titleRow}>
        <Text variant="heading.sm">This Month</Text>
        <Text variant="caption" color={colors.textSecondary}>
          {monthLabel}
        </Text>
      </View>

      {/* Day headers */}
      <View style={headerRow}>
        {DAY_HEADERS.map((label, i) => (
          <View key={i} style={[headerCell, { width: cellSize }]}>
            <Text variant="caption" color={colors.textMuted}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={gridContainer}>
        {rows.map((row, rowIndex) => (
          <Animated.View key={rowIndex} entering={FadeIn.delay(rowIndex * 50).duration(250)} style={gridRow}>
            {row.map((cell, colIndex) => (
              <GridCell
                key={colIndex}
                state={cell.state}
                isToday={cell.isToday}
                size={cellSize}
                activity={cell.activity}
              />
            ))}
          </Animated.View>
        ))}
      </View>

      {/* Summary */}
      <Text variant="body.sm" color={colors.textSecondary} style={summaryText}>
        {completedCount}/{plannedCount} sessions completed
      </Text>
    </Card>
  );
}

function getEmoji(state: CellState, activity: DayActivity | null): string {
  if (state === 'completed_gym' || (state === 'scheduled' && activity === 'gym')) return '💪';
  if (state === 'completed_run' || (state === 'scheduled' && activity === 'run')) return '👟';
  if (state === 'completed_both') return '💪';
  return '';
}

function GridCell({
  state,
  isToday,
  size,
  activity,
}: {
  state: CellState;
  isToday: boolean;
  size: number;
  activity: DayActivity | null;
}) {
  if (state === 'outside') {
    return <View style={{ width: size, height: size }} />;
  }

  const innerSize = isToday ? size - 4 : size;
  const innerStyle = getCellStyle(state, innerSize);
  const emoji = getEmoji(state, activity);

  const cellContent = emoji ? (
    <RNText style={{ fontSize: 14, lineHeight: 18 }}>{emoji}</RNText>
  ) : state === 'rest' ? (
    <View style={restDash} />
  ) : null;

  if (isToday) {
    return (
      <View
        style={[
          todayRing,
          { width: size, height: size, borderRadius: CELL_RADIUS + 1 },
        ]}
      >
        <View style={innerStyle}>{cellContent}</View>
      </View>
    );
  }

  return <View style={innerStyle}>{cellContent}</View>;
}

function getCellStyle(state: CellState, size: number): ViewStyle {
  const base: ViewStyle = {
    width: size,
    height: size,
    borderRadius: CELL_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  };

  switch (state) {
    case 'completed_gym':
    case 'completed_run':
    case 'completed_both':
      return { ...base, backgroundColor: 'rgba(48, 209, 88, 0.15)' };
    case 'rest':
      return { ...base };
    case 'scheduled':
      return { ...base, backgroundColor: 'rgba(120, 120, 128, 0.12)' };
    case 'missed':
      return { ...base, backgroundColor: 'rgba(255, 59, 48, 0.15)' };
    default:
      return base;
  }
}

// ── Styles ──

const titleRow: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.md,
};

const headerRow: ViewStyle = {
  flexDirection: 'row',
  gap: CELL_GAP,
  marginBottom: spacing.xs,
};

const headerCell: ViewStyle = {
  alignItems: 'center',
};

const gridContainer: ViewStyle = {
  gap: CELL_GAP,
};

const gridRow: ViewStyle = {
  flexDirection: 'row',
  gap: CELL_GAP,
};

const todayRing: ViewStyle = {
  borderWidth: 1.5,
  borderColor: colors.accent,
  alignItems: 'center',
  justifyContent: 'center',
};

const restDash: ViewStyle = {
  width: 8,
  height: 2,
  borderRadius: 1,
  backgroundColor: colors.cardBorder,
};

const summaryText: TextStyle = {
  marginTop: spacing.md,
};
