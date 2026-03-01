import React from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import type { RunSegmentType } from '@/types/run';

interface IntervalProgressProps {
  currentSegmentIndex: number;
  totalSegments: number;
  currentSegmentType: RunSegmentType;
  segmentTimeRemaining: number;
  segmentTotalTime: number;
  nextSegmentType?: RunSegmentType;
  nextSegmentDuration?: number;
}

const SEGMENT_COLORS: Record<RunSegmentType, string> = {
  warmup: colors.textMuted,
  cooldown: colors.textMuted,
  walk: colors.textSecondary,
  run: colors.accent,
  work: colors.error,
  recovery: colors.success,
};

const SEGMENT_LABELS: Record<RunSegmentType, string> = {
  warmup: 'WARMUP',
  cooldown: 'COOLDOWN',
  walk: 'WALK',
  run: 'RUN',
  work: 'WORK',
  recovery: 'RECOVERY',
};

function formatTimerDisplay(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
}

function formatSegmentDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} min`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ProgressDots({
  total,
  currentIndex,
}: {
  total: number;
  currentIndex: number;
}) {
  const maxDots = Math.min(total, 20);

  return (
    <View style={dotsRow}>
      {Array.from({ length: maxDots }, (_, i) => {
        let bgColor: string;
        if (i < currentIndex) {
          bgColor = colors.accent;
        } else if (i === currentIndex) {
          bgColor = colors.accent;
        } else {
          bgColor = colors.textMuted;
        }

        return (
          <View
            key={i}
            style={[
              dotBase,
              { backgroundColor: bgColor },
              i === currentIndex && dotCurrent,
            ]}
          />
        );
      })}
    </View>
  );
}

export function IntervalProgress({
  currentSegmentIndex,
  totalSegments,
  currentSegmentType,
  segmentTimeRemaining,
  nextSegmentType,
  nextSegmentDuration,
}: IntervalProgressProps) {
  const segmentColor = SEGMENT_COLORS[currentSegmentType];

  return (
    <View style={container}>
      <Text variant="overline" color={segmentColor} align="center">
        {SEGMENT_LABELS[currentSegmentType]}
      </Text>

      <Text
        variant="data.xl"
        color={colors.textPrimary}
        align="center"
        style={countdown}
      >
        {formatTimerDisplay(segmentTimeRemaining)}
      </Text>

      <Text variant="body.sm" color={colors.textSecondary} align="center">
        remaining in interval
      </Text>

      <ProgressDots total={totalSegments} currentIndex={currentSegmentIndex} />

      <Text
        variant="caption"
        color={colors.textMuted}
        align="center"
        style={intervalCount}
      >
        Interval {currentSegmentIndex + 1} of {totalSegments}
      </Text>

      {nextSegmentType != null && nextSegmentDuration != null && (
        <Text
          variant="caption"
          color={colors.textSecondary}
          align="center"
          style={nextPreview}
        >
          Next: {SEGMENT_LABELS[nextSegmentType].toLowerCase()}{' '}
          {formatSegmentDuration(nextSegmentDuration)}
        </Text>
      )}
    </View>
  );
}

const container: ViewStyle = {
  alignItems: 'center',
  paddingVertical: spacing.lg,
};

const countdown: TextStyle = {
  marginTop: spacing.sm,
  marginBottom: spacing.xs,
};

const dotsRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: spacing.xl,
  gap: spacing.xs,
};

const dotBase: ViewStyle = {
  width: 8,
  height: 8,
  borderRadius: radius.full,
};

const dotCurrent: ViewStyle = {
  width: 10,
  height: 10,
};

const intervalCount: TextStyle = {
  marginTop: spacing.md,
};

const nextPreview: TextStyle = {
  marginTop: spacing.xs,
};
