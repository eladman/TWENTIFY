import { View, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type TargetZone =
  | 'zone2'
  | 'tempo'
  | 'interval_work'
  | 'interval_recovery'
  | 'walk'
  | 'run';

type BadgeVariant = 'accent' | 'success' | 'muted' | 'warning' | 'error';

interface ZoneIndicatorProps {
  targetZone: TargetZone;
  hasHrMonitor: boolean;
  currentHR?: number;
  targetHR?: { low: number; high: number };
}

interface ZoneConfig {
  label: string;
  badgeVariant: BadgeVariant;
  talkTest: string;
}

const ZONE_CONFIG: Record<TargetZone, ZoneConfig> = {
  zone2: {
    label: 'ZONE 2 — EASY',
    badgeVariant: 'accent',
    talkTest: 'Can you speak in full sentences? ✅ Yes = on target',
  },
  tempo: {
    label: 'TEMPO',
    badgeVariant: 'warning',
    talkTest: 'Comfortably hard. Short phrases only.',
  },
  interval_work: {
    label: 'WORK',
    badgeVariant: 'error',
    talkTest: 'Hard effort. Only a few words.',
  },
  interval_recovery: {
    label: 'RECOVERY',
    badgeVariant: 'success',
    talkTest: 'Easy. Full conversation possible.',
  },
  walk: {
    label: 'WALK',
    badgeVariant: 'muted',
    talkTest: 'Walking pace. Relax.',
  },
  run: {
    label: 'RUN',
    badgeVariant: 'accent',
    talkTest: 'Comfortable jog. Breathe easy.',
  },
};

function getHRColor(
  currentHR: number,
  targetHR: { low: number; high: number },
): string {
  if (currentHR >= targetHR.low && currentHR <= targetHR.high) {
    return colors.success;
  }
  const distance = currentHR < targetHR.low
    ? targetHR.low - currentHR
    : currentHR - targetHR.high;
  if (distance <= 10) {
    return colors.warning;
  }
  return colors.error;
}

export function ZoneIndicator({
  targetZone,
  hasHrMonitor,
  currentHR,
  targetHR,
}: ZoneIndicatorProps) {
  const config = ZONE_CONFIG[targetZone];

  return (
    <Card variant="info">
      <Badge label={config.label} variant={config.badgeVariant} />

      {hasHrMonitor && currentHR != null && targetHR ? (
        <View style={hrSection}>
          <Text
            variant="data.lg"
            color={getHRColor(currentHR, targetHR)}
            style={hrValue}
          >
            {currentHR}
          </Text>
          <Text variant="caption" color={colors.textSecondary}>
            bpm
          </Text>
          <Text variant="body.sm" color={colors.textMuted} style={hrRange}>
            Target: {targetHR.low}–{targetHR.high} bpm
          </Text>
        </View>
      ) : (
        <View style={talkTestSection}>
          <Text variant="body.sm" color={colors.textSecondary}>
            {config.talkTest}
          </Text>
        </View>
      )}
    </Card>
  );
}

const hrSection: ViewStyle = {
  marginTop: spacing.md,
  alignItems: 'center',
};

const hrValue: TextStyle = {
  marginBottom: spacing.xs,
};

const hrRange: TextStyle = {
  marginTop: spacing.sm,
};

const talkTestSection: ViewStyle = {
  marginTop: spacing.md,
};
