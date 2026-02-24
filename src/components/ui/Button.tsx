import {
  Pressable,
  PressableProps,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'text';
type ButtonSize = 'standard' | 'compact';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  haptic?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'standard',
  loading = false,
  haptic = true,
  onPress,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  const textColor = variant === 'primary' ? 'white' : variant === 'text' ? 'accent' : 'primary';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getContainerStyle(variant, size, pressed, !!disabled),
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : colors.accent}
          size="small"
        />
      ) : (
        <Text
          variant={variant === 'text' ? 'body.md' : 'body.lg'}
          color={textColor}
          style={getTextStyle(variant)}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

function getContainerStyle(
  variant: ButtonVariant,
  size: ButtonSize,
  pressed: boolean,
  disabled: boolean
): ViewStyle {
  const base: ViewStyle = {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    opacity: disabled ? 0.5 : 1,
  };

  switch (variant) {
    case 'primary':
      return {
        ...base,
        height: size === 'standard' ? 52 : 48,
        backgroundColor: pressed ? colors.accentDark : colors.accent,
      };
    case 'secondary':
      return {
        ...base,
        height: size === 'standard' ? 52 : 48,
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

function getTextStyle(variant: ButtonVariant): TextStyle {
  return {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: variant === 'text' ? 14 : 16,
  };
}
