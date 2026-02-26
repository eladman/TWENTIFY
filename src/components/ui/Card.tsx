import { View, Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';

type CardVariant = 'workout' | 'info';

interface CardProps {
  variant?: CardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function Card({ variant = 'info', onPress, style, children }: CardProps) {
  const baseStyle = variant === 'workout' ? workoutStyle : infoStyle;

  if (!onPress) {
    return <View style={[baseStyle, style]}>{children}</View>;
  }

  return <PressableCard baseStyle={baseStyle} style={style} onPress={onPress}>{children}</PressableCard>;
}

function PressableCard({
  baseStyle,
  style,
  onPress,
  children,
}: {
  baseStyle: ViewStyle;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[baseStyle, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const workoutStyle: ViewStyle = {
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.cardBorder,
  borderRadius: radius.lg,
  padding: 22,
  ...shadows.sm,
};

const infoStyle: ViewStyle = {
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.cardBorder,
  borderRadius: radius.sm,
  padding: 16,
};
