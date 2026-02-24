/**
 * Twentify Typography System
 * DM Sans (display + body) + IBM Plex Mono (data/timers)
 */

export const fontFamilies = {
    display: 'DMSans_700Bold',
    displayHeavy: 'DMSans_800ExtraBold',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodySemiBold: 'DMSans_600SemiBold',
    bodyBold: 'DMSans_700Bold',
    mono: 'IBMPlexMono_400Regular',
    monoMedium: 'IBMPlexMono_500Medium',
    monoSemiBold: 'IBMPlexMono_600SemiBold',
  } as const;
  
  export const typeScale = {
    heading: {
      xl: {
        fontFamily: fontFamilies.displayHeavy,
        fontSize: 32,
        letterSpacing: -1.0,
        lineHeight: 35,
      },
      lg: {
        fontFamily: fontFamilies.display,
        fontSize: 24,
        letterSpacing: -0.5,
        lineHeight: 28,
      },
      md: {
        fontFamily: fontFamilies.display,
        fontSize: 20,
        letterSpacing: -0.3,
        lineHeight: 24,
      },
      sm: {
        fontFamily: fontFamilies.bodySemiBold,
        fontSize: 17,
        letterSpacing: -0.2,
        lineHeight: 21,
      },
    },
  
    body: {
      lg: {
        fontFamily: fontFamilies.body,
        fontSize: 16,
        letterSpacing: 0,
        lineHeight: 25,
      },
      md: {
        fontFamily: fontFamilies.body,
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 21,
      },
      sm: {
        fontFamily: fontFamilies.bodyMedium,
        fontSize: 13,
        letterSpacing: 0,
        lineHeight: 19,
      },
    },
  
    caption: {
      fontFamily: fontFamilies.bodyMedium,
      fontSize: 12,
      letterSpacing: 0,
      lineHeight: 17,
    },
  
    overline: {
      fontFamily: fontFamilies.bodySemiBold,
      fontSize: 10,
      letterSpacing: 2.0,
      lineHeight: 10,
      textTransform: 'uppercase' as const,
    },
  
    data: {
      xl: {
        fontFamily: fontFamilies.monoSemiBold,
        fontSize: 48,
        letterSpacing: -2.0,
        lineHeight: 48,
      },
      lg: {
        fontFamily: fontFamilies.display,
        fontSize: 36,
        letterSpacing: -1.0,
        lineHeight: 36,
      },
      md: {
        fontFamily: fontFamilies.monoMedium,
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 14,
      },
      sm: {
        fontFamily: fontFamilies.mono,
        fontSize: 11,
        letterSpacing: 0,
        lineHeight: 11,
      },
    },
  } as const;
  
  /**
   * Font loading config for Expo
   *
   * Usage:
   * ```tsx
   * import { useFonts } from 'expo-font';
   * import { fontsToLoad } from './theme/typography';
   *
   * const [fontsLoaded] = useFonts(fontsToLoad);
   * ```
   */
  export const fontsToLoad = {
    DMSans_400Regular: require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
    DMSans_500Medium: require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
    DMSans_600SemiBold: require('@expo-google-fonts/dm-sans/600SemiBold/DMSans_600SemiBold.ttf'),
    DMSans_700Bold: require('@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf'),
    DMSans_800ExtraBold: require('@expo-google-fonts/dm-sans/800ExtraBold/DMSans_800ExtraBold.ttf'),
    IBMPlexMono_400Regular: require('@expo-google-fonts/ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf'),
    IBMPlexMono_500Medium: require('@expo-google-fonts/ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf'),
    IBMPlexMono_600SemiBold: require('@expo-google-fonts/ibm-plex-mono/600SemiBold/IBMPlexMono_600SemiBold.ttf'),
  };