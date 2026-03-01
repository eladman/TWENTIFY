import React, { useEffect, useRef } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ExerciseTransitionProps {
  exerciseKey: number;
  children: React.ReactNode;
}

export function ExerciseTransition({ exerciseKey, children }: ExerciseTransitionProps) {
  const opacity = useSharedValue(1);
  const prevKey = useRef(exerciseKey);

  useEffect(() => {
    if (exerciseKey !== prevKey.current) {
      prevKey.current = exerciseKey;
      opacity.value = 0;
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    }
  }, [exerciseKey, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    flex: 1,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
