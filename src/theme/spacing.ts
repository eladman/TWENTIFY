/**
 * Twentify Spacing System
 * 4px base grid
 */

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
  } as const;
  
  export const screenPadding = {
    horizontal: 20,
    top: 16,       // Below safe area
    bottom: 16,    // Above tab bar
  } as const;
  
  export type SpacingToken = keyof typeof spacing;