import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { typeScale } from '@/theme/typography';

type HeadingVariant = 'heading.xl' | 'heading.lg' | 'heading.md' | 'heading.sm';
type BodyVariant = 'body.lg' | 'body.md' | 'body.sm';
type DataVariant = 'data.xl' | 'data.lg' | 'data.md' | 'data.sm';
type OtherVariant = 'caption' | 'overline';
export type TextVariant = HeadingVariant | BodyVariant | DataVariant | OtherVariant;

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
}

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
  color = colors.textPrimary,
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
        { color },
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

export default Text;
