import { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { startOfWeek } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useRunStore } from '@/stores/useRunStore';
import { useUserStore } from '@/stores/useUserStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { formatDistance, formatPace } from '@/utils/formatters';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { Units } from '@/types/user';

interface RunStatsProps {
  unit: Units;
}

export function RunStats({ unit }: RunStatsProps) {
  const history = useRunStore((s) => s.history);
  const runningLevel = useUserStore((s) => s.profile?.runningLevel);
  const currentWeek = usePlanStore((s) => s.currentWeek);

  const stats = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const mondayISO = monday.toISOString();

    const thisWeekRuns = history.filter((r) => r.completedAt >= mondayISO);

    // This week duration
    const totalSec = thisWeekRuns.reduce((sum, r) => sum + r.durationSeconds, 0);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const weeklyDuration = totalSec === 0 ? '0min' : h > 0 ? `${h}h ${m}min` : `${m}min`;

    // Weekly distance
    const runsWithGPS = thisWeekRuns.filter((r) => r.distanceMeters !== undefined);
    const weeklyDistance =
      runsWithGPS.length > 0
        ? formatDistance(
            runsWithGPS.reduce((sum, r) => sum + r.distanceMeters!, 0),
            unit,
          )
        : '—';

    // Avg easy pace
    const easyWithGPS = history.filter(
      (r) => r.sessionType === 'easy' && r.distanceMeters !== undefined,
    );
    let avgPace = '—';
    if (easyWithGPS.length > 0) {
      const totalDur = easyWithGPS.reduce((sum, r) => sum + r.durationSeconds, 0);
      const totalDist = easyWithGPS.reduce((sum, r) => sum + r.distanceMeters!, 0);
      if (totalDist > 0) {
        const secPerKm = (totalDur / totalDist) * 1000;
        avgPace = formatPace(secPerKm, unit);
      }
    }

    return { weeklyDuration, weeklyDistance, avgPace };
  }, [history, unit]);

  if (history.length === 0) {
    return (
      <View style={emptyContainer}>
        <Text variant="body.sm" color={colors.textSecondary}>
          Complete your first run to see stats here
        </Text>
      </View>
    );
  }

  const rows: { label: string; value: string }[] = [
    { label: 'This week', value: stats.weeklyDuration },
    { label: 'Weekly distance', value: stats.weeklyDistance },
    { label: 'Avg easy pace', value: stats.avgPace },
    { label: 'Total runs', value: String(history.length) },
  ];

  if (runningLevel === 'cant_run_20min') {
    rows.push({ label: 'Walk/Run Progress', value: `Week ${currentWeek} of 8` });
  }

  return (
    <Card variant="info">
      <Text variant="heading.sm">Running</Text>
      <View style={rowsContainer}>
        {rows.map((row, i) => (
          <View key={row.label}>
            {i > 0 && <View style={divider} />}
            <View style={rowStyle}>
              <Text variant="body.sm" color={colors.textSecondary}>
                {row.label}
              </Text>
              <Text variant="data.sm" color={colors.textPrimary}>
                {row.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const emptyContainer: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: spacing['2xl'],
};

const rowsContainer: ViewStyle = {
  marginTop: spacing.sm,
};

const rowStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: spacing.md,
};

const divider: ViewStyle = {
  height: 1,
  backgroundColor: colors.divider,
};
