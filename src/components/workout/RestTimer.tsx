import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
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
  const startTimeRef = useRef(Date.now());
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const completedRef = useRef(false);
  const hapticsAt10Ref = useRef(false);
  const progress = useSharedValue(1);
  const timerScale = useSharedValue(1);

  const computeRemaining = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    return Math.max(0, Math.ceil(totalSeconds - elapsed));
  }, [totalSeconds]);

  // Wall-clock countdown ticker (500ms for responsiveness)
  useEffect(() => {
    const tick = () => {
      const remaining = computeRemaining();
      setSecondsLeft(remaining);
      progress.value = remaining / totalSeconds;
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [computeRemaining, totalSeconds, progress]);

  // AppState listener — immediately update on foreground return
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const remaining = computeRemaining();
        setSecondsLeft(remaining);
        progress.value = remaining / totalSeconds;
      }
    });
    return () => sub.remove();
  }, [computeRemaining, totalSeconds, progress]);

  // Haptics and completion
  useEffect(() => {
    if (secondsLeft <= 10 && !hapticsAt10Ref.current) {
      hapticsAt10Ref.current = true;
      haptics.light();
    }

    if (secondsLeft === 0 && !completedRef.current) {
      completedRef.current = true;
      timerScale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withTiming(1.0, { duration: 150 }),
      );
      haptics.success();
      setTimeout(onComplete, 300);
    }
  }, [secondsLeft, onComplete, timerScale]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const timerPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
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

        <Animated.View style={timerPulseStyle}>
          <Text variant="data.xl" style={styles.timer}>
            {formatTime(secondsLeft)}
          </Text>
        </Animated.View>

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
