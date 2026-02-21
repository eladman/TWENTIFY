/**
 * Twentify Color System
 * Apple-clean palette. Light mode only for MVP.
 */

export const colors = {
    // ── Core ──
    background: '#F5F5F7',
    card: '#FFFFFF',
    cardBorder: '#D2D2D7',
  
    // ── Accent ──
    accent: '#0071E3',
    accentDark: '#0058B0',
    accentLight: '#EBF5FF',
  
    // ── Text ──
    textPrimary: '#1D1D1F',
    textSecondary: '#6E6E73',
    textMuted: '#AEAEB2',
  
    // ── Semantic ──
    success: '#30D158',
    warning: '#FF9500',
    error: '#FF3B30',
  
    // ── Dividers ──
    divider: 'rgba(29, 29, 31, 0.06)',
    dividerStrong: '#D2D2D7',
  
    // ── Overlays ──
    backdrop: 'rgba(0, 0, 0, 0.3)',
    sheetHandle: '#D2D2D7',
  
    // ── Gradient (icon/marketing only — never use in app UI) ──
    accentGradient: ['#0071E3', '#0058B0'] as const,
  
    // ── Transparent variants ──
    accentAlpha08: 'rgba(0, 113, 227, 0.08)',
    accentAlpha15: 'rgba(0, 113, 227, 0.15)',
    textAlpha06: 'rgba(29, 29, 31, 0.06)',
  } as const;
  
  export type ColorToken = keyof typeof colors;