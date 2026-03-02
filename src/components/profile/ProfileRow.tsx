import { ReactNode } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ProfileRowProps {
  label: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
}

export function ProfileRow({
  label,
  value,
  right,
  onPress,
  showDivider = true,
}: ProfileRowProps) {
  const content = (
    <View style={[styles.row, showDivider && styles.divider]}>
      <Text variant="body.md">{label}</Text>
      <View style={styles.rightSide}>
        {right ?? (
          value ? (
            <Text variant="body.md" color={colors.textSecondary}>
              {value}
            </Text>
          ) : null
        )}
        {onPress && (
          <Text variant="body.md" color={colors.textMuted} style={styles.chevron}>
            ›
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: spacing.md,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chevron: {
    marginLeft: spacing.sm,
    fontSize: 18,
  },
});
