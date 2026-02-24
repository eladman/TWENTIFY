import React, { ReactNode } from 'react';
import {
  Pressable,
  ActivityIndicator,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'text';

interface ButtonProps {
  variant?: ButtonVariant;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const BUTTON_RADIUS = 14;

export function Button({
  variant = 'primary',
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    if (isDisabled) return;
    scale.value = withTiming(0.97, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const textColor =
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'text'
        ? colors.accent
        : colors.textPrimary;

  const indicatorColor =
    variant === 'primary' ? '#FFFFFF' : colors.accent;

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={({ pressed }) => [
          getContainerStyle(variant, pressed, disabled),
          fullWidth && { width: '100%' },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={indicatorColor} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              variant={variant === 'text' ? 'body.md' : 'body.lg'}
              color={textColor}
              style={{
                fontFamily: 'DMSans_600SemiBold',
                fontSize: variant === 'text' ? 14 : 16,
              }}
            >
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function getContainerStyle(
  variant: ButtonVariant,
  pressed: boolean,
  disabled: boolean,
): ViewStyle {
  const base: ViewStyle = {
    borderRadius: BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: disabled ? 0.4 : 1,
  };

  switch (variant) {
    case 'primary':
      return {
        ...base,
        height: 52,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing['3xl'],
        backgroundColor: pressed ? colors.accentDark : colors.accent,
      };
    case 'secondary':
      return {
        ...base,
        height: 52,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing['3xl'],
        backgroundColor: pressed ? colors.background : 'transparent',
        borderWidth: 1.5,
        borderColor: colors.cardBorder,
      };
    case 'text':
      return {
        ...base,
        paddingHorizontal: 0,
      };
  }
}

const styles = {
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  icon: {
    marginRight: spacing.sm,
  },
};
