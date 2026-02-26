import { View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';

type BadgeVariant = 'accent' | 'success' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const bgColors: Record<BadgeVariant, string> = {
  accent: colors.accentLight,
  success: '#E8F9EE',
  muted: '#F0F0F2',
};

const textColors: Record<BadgeVariant, string> = {
  accent: colors.accent,
  success: colors.success,
  muted: colors.textSecondary,
};

export function Badge({ label, variant = 'accent' }: BadgeProps) {
  return (
    <View style={[badgeContainer, { backgroundColor: bgColors[variant] }]}>
      <Text variant="overline" style={{ color: textColors[variant] }}>
        {label}
      </Text>
    </View>
  );
}

const badgeContainer: ViewStyle = {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: radius.xs,
  alignSelf: 'flex-start',
};
