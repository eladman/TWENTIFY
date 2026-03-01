import { Pressable, View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { haptics } from '@/utils/haptics';
import type { WeekDay } from './useToday';

interface WeekStripProps {
  weekDays: WeekDay[];
  completedCount: number;
  totalScheduled: number;
  onSelectDay: (dayIndex: number) => void;
}

const SQUARE_SIZE = 36;

function getActivityEmoji(day: WeekDay): string {
  if (day.status === 'completed_gym') return '\u{1F3CB}';
  if (day.status === 'completed_run') return '\u{1F3C3}';
  if (day.activity === 'gym') return '\u{1F4AA}';
  if (day.activity === 'run') return '\u{1F45F}';
  return '';
}

export function WeekStrip({ weekDays, completedCount, totalScheduled, onSelectDay }: WeekStripProps) {
  return (
    <Card variant="info">
      <Text variant="heading.sm">This Week</Text>

      <View style={styles.stripRow}>
        {weekDays.map((day) => {
          const emoji = getActivityEmoji(day);

          return (
            <Pressable
              key={day.dayIndex}
              onPress={() => {
                haptics.selection();
                onSelectDay(day.dayIndex);
              }}
              style={styles.dayColumn}
            >
              <Text
                variant="caption"
                color={day.isSelected ? colors.accent : day.isToday ? colors.textPrimary : colors.textMuted}
                style={[styles.dayLabel, day.isSelected && styles.dayLabelSelected]}
              >
                {day.label}
              </Text>
              <View
                style={[
                  styles.square,
                  getSquareStyle(day.status),
                  day.isSelected && styles.selectedRing,
                  day.isToday && !day.isSelected && styles.todayDot,
                ]}
              >
                {emoji ? (
                  <Text variant="caption" style={styles.emoji}>{emoji}</Text>
                ) : day.status === 'rest' ? (
                  <View style={styles.restDash} />
                ) : null}
              </View>
              {day.isToday && !day.isSelected && (
                <View style={styles.todayIndicator} />
              )}
              {day.isToday && day.isSelected && (
                <View style={styles.todayIndicator} />
              )}
            </Pressable>
          );
        })}
      </View>

      <Text variant="body.sm" color={colors.textSecondary} style={styles.footer}>
        {completedCount}/{totalScheduled} sessions this week
      </Text>
    </Card>
  );
}

function getSquareStyle(status: WeekDay['status']) {
  switch (status) {
    case 'completed_gym':
      return { backgroundColor: colors.accentLight };
    case 'completed_run':
      return { backgroundColor: 'rgba(48, 209, 88, 0.12)' };
    case 'scheduled':
      return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.cardBorder };
    case 'missed':
      return { backgroundColor: colors.textMuted, opacity: 0.3 };
    case 'rest':
      return { backgroundColor: 'transparent' };
  }
}

const styles = StyleSheet.create({
  stripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  dayColumn: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayLabel: {
    textAlign: 'center',
  },
  dayLabelSelected: {
    fontFamily: 'DMSans_700Bold',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRing: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  todayDot: {},
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
  emoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  restDash: {
    width: 14,
    height: 2,
    backgroundColor: colors.textMuted,
    borderRadius: 1,
    opacity: 0.4,
  },
  footer: {
    marginTop: spacing.md,
  },
});
