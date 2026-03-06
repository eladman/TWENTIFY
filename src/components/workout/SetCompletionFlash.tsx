import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

interface SetCompletionFlashProps {
  visible: boolean;
}

export function SetCompletionFlash({ visible }: SetCompletionFlashProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(0.2, { duration: 150 }),
        withTiming(0, { duration: 150 }),
      );
      scale.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0.5, { duration: 150 }),
      );
    }
  }, [visible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.overlay, animatedStyle]} pointerEvents="none">
      <Text variant="data.xl" color={colors.accent}>
        {'\u2713'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 245, 255, 0.85)',
  },
});
