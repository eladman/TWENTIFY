import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { haptics } from '@/utils/haptics';

interface QuickReplyBarProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function QuickReplyBar({ suggestions, onSelect, disabled }: QuickReplyBarProps) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      {suggestions.map((text, index) => (
        <Pressable
          key={index}
          onPress={() => {
            haptics.selection();
            onSelect(text);
          }}
          disabled={disabled}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.chipPressed,
            disabled && styles.chipDisabled,
          ]}
        >
          <Text variant="body.sm" color={colors.accent}>
            {text}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.accentAlpha08,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentAlpha15,
  },
  chipPressed: {
    backgroundColor: colors.accentAlpha15,
  },
  chipDisabled: {
    opacity: 0.5,
  },
});
