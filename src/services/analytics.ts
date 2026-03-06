import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.POSTHOG_API_KEY as string | undefined;

let posthog: PostHog | null = null;

export async function initAnalytics(): Promise<void> {
  if (!apiKey) return;
  posthog = new PostHog(apiKey, {
    host: 'https://us.i.posthog.com',
  });
  await posthog.ready();
}

export const analytics = {
  track(event: string, properties?: Record<string, any>): void {
    posthog?.capture(event, properties);
  },
  identify(userId: string, traits?: Record<string, any>): void {
    posthog?.identify(userId, traits);
  },
  reset(): void {
    posthog?.reset();
  },
};
