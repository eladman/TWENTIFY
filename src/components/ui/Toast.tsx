import { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  onHide: () => void;
}

export function Toast({ message, visible, duration = 2000, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 250 });

      // Auto-dismiss
      translateY.value = withDelay(
        duration,
        withTiming(100, { duration: 200 }, () => {
          runOnJS(onHide)();
        })
      );
      opacity.value = withDelay(duration, withTiming(0, { duration: 200 }));
    }
  }, [visible, duration, onHide, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        toastContainer,
        { bottom: 83 + 24 + insets.bottom }, // above tab bar
        animatedStyle,
      ]}
    >
      <Text variant="body.md" color="#FFFFFF" style={{ fontFamily: 'DMSans_500Medium' }}>
        {message}
      </Text>
    </Animated.View>
  );
}

const toastContainer: ViewStyle = {
  position: 'absolute',
  left: 20,
  right: 20,
  backgroundColor: colors.textPrimary,
  borderRadius: radius.sm,
  paddingHorizontal: 20,
  paddingVertical: 14,
  alignItems: 'center',
  alignSelf: 'center',
};
