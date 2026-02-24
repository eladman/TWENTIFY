import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { typeScale } from '@/theme/typography';

type HeadingVariant = 'heading.xl' | 'heading.lg' | 'heading.md' | 'heading.sm';
type BodyVariant = 'body.lg' | 'body.md' | 'body.sm';
type DataVariant = 'data.xl' | 'data.lg' | 'data.md' | 'data.sm';
type OtherVariant = 'caption' | 'overline';
export type TextVariant = HeadingVariant | BodyVariant | DataVariant | OtherVariant;

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'success'
  | 'error'
  | 'warning'
  | 'white';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
}

const colorMap: Record<TextColor, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  accent: colors.accent,
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  white: '#FFFFFF',
};

function getVariantStyle(variant: TextVariant): TextStyle {
  if (variant === 'caption') return typeScale.caption as TextStyle;
  if (variant === 'overline') return typeScale.overline as TextStyle;

  const [group, size] = variant.split('.') as [string, string];
  const groupObj = typeScale[group as 'heading' | 'body' | 'data'];
  if (groupObj && size in groupObj) {
    return (groupObj as Record<string, TextStyle>)[size];
  }

  return typeScale.body.md as TextStyle;
}

export function Text({
  variant = 'body.md',
  color = 'primary',
  align,
  style,
  children,
  ...props
}: TextProps) {
  const variantStyle = getVariantStyle(variant);

  return (
    <RNText
      style={[
        variantStyle,
        { color: colorMap[color] },
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
