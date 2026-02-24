import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Twentify',
  slug: 'twentify',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'twentify',
  userInterfaceStyle: 'light', // Light mode only for MVP
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#F5F5F7',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.twentify.app',
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F5F5F7',
    },
    package: 'com.twentify.app',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#0071E3',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    REVENUECAT_IOS_KEY: process.env.REVENUECAT_IOS_KEY,
    REVENUECAT_ANDROID_KEY: process.env.REVENUECAT_ANDROID_KEY,
  },
});