import { useEffect, useState, useCallback } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { toastEmitter, type ToastEvent, type ToastType } from '@/utils/toast';

export function ToastRoot() {
  const [current, setCurrent] = useState<ToastEvent | null>(null);
  const translateY = useSharedValue(12);
  const opacity = useSharedValue(0);

  const animateIn = useCallback(
    (duration: number) => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);

      translateY.value = withSequence(
        withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) }),
        withDelay(duration, withTiming(12, { duration: 250 }))
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 250 }),
        withDelay(duration, withTiming(0, { duration: 250 }))
      );
    },
    [translateY, opacity]
  );

  useEffect(() => {
    const unsubscribe = toastEmitter.subscribe((event) => {
      setCurrent(event);
      animateIn(event.duration);
    });
    return unsubscribe;
  }, [animateIn]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!current) return null;

  return (
    <View style={wrapperStyle} pointerEvents="none">
      <Animated.View style={[containerStyle, animatedStyle]}>
        {current.type !== 'default' && (
          <View style={[dot, dotColor[current.type]]} />
        )}
        <Text variant="body.sm" color="#FFFFFF">
          {current.message}
        </Text>
      </Animated.View>
    </View>
  );
}

const wrapperStyle: ViewStyle = {
  position: 'absolute',
  bottom: 100,
  left: 0,
  right: 0,
  alignItems: 'center',
};

const containerStyle: ViewStyle = {
  maxWidth: '90%',
  backgroundColor: colors.textPrimary,
  borderRadius: radius.sm,
  paddingHorizontal: 20,
  paddingVertical: 12,
  flexDirection: 'row',
  alignItems: 'center',
};

const dot: ViewStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
  marginRight: 8,
};

const dotColor: Record<Exclude<ToastType, 'default'>, ViewStyle> = {
  success: { backgroundColor: colors.success },
  error: { backgroundColor: colors.error },
};
