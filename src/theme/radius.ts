/**
 * Twentify Border Radius System
 */

export const radius = {
    xs: 8,       // Tags, badges, inline buttons
    sm: 12,      // Buttons, inputs, small cards
    md: 16,      // Standard cards, sheets
    lg: 18,      // Large cards (workout card, main content)
    xl: 24,      // Bottom sheets, modals
    full: 9999,  // Pills, circular buttons, toggles
  } as const;
  
  export type RadiusToken = keyof typeof radius;