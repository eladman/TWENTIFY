import { useEffect, useRef, useState } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface RunTimerProps {
  startedAt: Date;
  paused: boolean;
}

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

export function RunTimer({ startedAt, paused }: RunTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const totalPausedMsRef = useRef(0);
  const pauseStartRef = useRef<number | null>(null);
  const opacity = useSharedValue(1);

  // Track pause accumulation
  useEffect(() => {
    if (paused) {
      pauseStartRef.current = Date.now();
    } else if (pauseStartRef.current !== null) {
      totalPausedMsRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
  }, [paused]);

  // Tick interval
  useEffect(() => {
    if (paused) return;

    const tick = () => {
      const now = Date.now();
      const raw = now - startedAt.getTime() - totalPausedMsRef.current;
      setElapsedSeconds(Math.floor(raw / 1000));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [paused, startedAt]);

  // Pulse animation when paused
  useEffect(() => {
    if (paused) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [paused, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[container, animatedStyle]}>
      <Text variant="data.xl" color={colors.textPrimary} align="center">
        {formatTimerDisplay(elapsedSeconds)}
      </Text>
      <Text
        variant="caption"
        color={colors.textSecondary}
        align="center"
        style={label}
      >
        elapsed
      </Text>
    </Animated.View>
  );
}

const container: ViewStyle = {
  alignItems: 'center',
  paddingVertical: spacing.lg,
};

const label: TextStyle = {
  marginTop: spacing.xs,
};
