import { View, ViewProps, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';

type CardVariant = 'workout' | 'info';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  children: React.ReactNode;
}

export function Card({ variant = 'info', style, children, ...props }: CardProps) {
  return (
    <View
      style={[variant === 'workout' ? workoutStyle : infoStyle, style]}
      {...props}
    >
      {children}
    </View>
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
  borderRadius: 14,
  padding: 16,
};
