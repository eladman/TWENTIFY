import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { haptics } from '@/utils/haptics';

interface RestTimerProps {
  totalSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
  nextSetInfo: {
    exerciseName: string;
    setNumber: number;
    totalSets: number;
    targetReps: { min: number; max: number };
  };
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export function RestTimer({
  totalSeconds,
  onComplete,
  onSkip,
  nextSetInfo,
}: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const completedRef = useRef(false);
  const progress = useSharedValue(1);

  // Start progress bar animation on mount
  useEffect(() => {
    progress.value = withTiming(0, {
      duration: totalSeconds * 1000,
      easing: Easing.linear,
    });
  }, [totalSeconds, progress]);

  // Countdown interval
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Haptics and completion
  useEffect(() => {
    if (secondsLeft === 10) {
      haptics.light();
    }

    if (secondsLeft === 0 && !completedRef.current) {
      completedRef.current = true;
      haptics.success();
      setTimeout(onComplete, 300);
    }
  }, [secondsLeft, onComplete]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="overline" color={colors.textSecondary}>
          REST
        </Text>

        <Text variant="data.xl" style={styles.timer}>
          {formatTime(secondsLeft)}
        </Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressBarStyle]} />
        </View>

        <View style={styles.nextSetInfo}>
          <Text variant="body.md" color={colors.textSecondary}>
            Next: Set {nextSetInfo.setNumber} of {nextSetInfo.totalSets}
          </Text>
          <Text
            variant="body.sm"
            color={colors.textSecondary}
            style={styles.exerciseDetail}
          >
            {nextSetInfo.exerciseName} · {nextSetInfo.targetReps.min}-
            {nextSetInfo.targetReps.max} reps
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Button variant="text" label="Skip Rest →" onPress={handleSkip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    marginTop: spacing.lg,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: radius.full,
    marginTop: spacing['2xl'],
    marginHorizontal: 40,
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
  nextSetInfo: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  exerciseDetail: {
    marginTop: spacing.xs,
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: spacing['4xl'],
  },
});
