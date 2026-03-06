import { useEffect } from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
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
    talkTest: 'Can you speak in full sentences? \u2705 Yes = on target',
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

// Subtle background tints for each zone
const ZONE_BG_COLORS: Record<TargetZone, string> = {
  zone2: 'transparent',
  tempo: 'rgba(255, 204, 0, 0.06)',
  interval_work: 'rgba(255, 59, 48, 0.06)',
  interval_recovery: 'rgba(48, 209, 88, 0.06)',
  walk: 'transparent',
  run: 'rgba(0, 122, 255, 0.06)',
};

// Map zone to numeric index for interpolation
const ZONE_INDEX: Record<TargetZone, number> = {
  walk: 0,
  zone2: 1,
  run: 2,
  tempo: 3,
  interval_recovery: 4,
  interval_work: 5,
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
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    // Reset and fade in when zone changes
    bgOpacity.value = 0;
    bgOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
  }, [targetZone, bgOpacity]);

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: ZONE_BG_COLORS[targetZone],
    opacity: bgOpacity.value,
  }));

  return (
    <Animated.View style={[cardOverlay, animatedBgStyle]}>
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
              Target: {targetHR.low}\u2013{targetHR.high} bpm
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
    </Animated.View>
  );
}

const cardOverlay: ViewStyle = {
  borderRadius: 16,
  overflow: 'hidden',
};

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
