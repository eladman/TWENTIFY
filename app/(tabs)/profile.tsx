import { useState } from 'react';
import { ScrollView, Switch, Alert, Pressable, Linking, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ProfileRow } from '@/components/profile/ProfileRow';
import { EmailAuthSheet } from '@/components/auth/EmailAuthSheet';
import { useUserStore } from '@/stores/useUserStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { toast } from '@/utils/toast';
import { signInWithApple, signOut } from '@/services/auth';
import {
  requestNotificationPermission,
  rescheduleReminders,
  cancelAllReminders,
} from '@/services/notifications';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';
import { analytics } from '@/services/analytics';

// ── Display name mappings ──

const goalLabels: Record<string, string> = {
  fat_loss: 'Fat loss',
  muscle_build: 'Build muscle',
  maintenance: 'Stay healthy',
};

const fitnessLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const equipmentLabels: Record<string, string> = {
  full_gym: 'Full gym',
  dumbbells: 'Dumbbells only',
  bodyweight: 'Bodyweight',
};

const gymPlanLabels: Record<string, string> = {
  gym_2day: '2-Day Full Body',
  gym_3day: '3-Day Full Body',
  gym_4day: '4-Day Upper/Lower',
};

const runPlanLabels: Record<string, string> = {
  run_1day: '1-Day Running',
  run_2day: '2-Day Running',
  run_3day: '3-Day Running',
};

const nutritionGoalLabels: Record<string, string> = {
  fat_loss: 'Cut',
  muscle_build: 'Bulk',
  maintenance: 'Maintain',
};

export default function ProfileScreen() {
  const router = useRouter();

  // Individual selectors
  const domains = useUserStore((s) => s.domains);
  const goal = useUserStore((s) => s.goal);
  const fitnessLevel = useUserStore((s) => s.fitnessLevel);
  const profile = useUserStore((s) => s.profile);
  const settings = useUserStore((s) => s.settings);
  const subscriptionTier = useUserStore((s) => s.subscriptionTier);
  const updateSettings = useUserStore((s) => s.updateSettings);

  const authUserId = useUserStore((s) => s.authUserId);
  const authEmail = useUserStore((s) => s.authEmail);
  const [emailSheetVisible, setEmailSheetVisible] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const gymPlan = usePlanStore((s) => s.gymPlan);
  const runPlan = usePlanStore((s) => s.runPlan);

  const hasGym = domains.includes('gym');
  const hasRunning = domains.includes('running');
  const hasNutrition = domains.includes('nutrition');

  const handleResetPlan = () => {
    Alert.alert(
      'Reset Your Plan?',
      'This will restart your onboarding. Your workout history will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            useUserStore.getState().reset();
            usePlanStore.getState().clearPlan();
            router.replace('/(onboarding)/domains');
          },
        },
      ],
    );
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const user = await signInWithApple();
      if (user) toast.success('Signed in!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Sign in failed');
    } finally {
      setAppleLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Your data will stay on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            toast.show('Signed out');
            router.replace('/(auth)/welcome');
          } catch (err: any) {
            toast.error(err?.message ?? 'Sign out failed');
          }
        },
      },
    ]);
  };

  const programLabel =
    gymPlan ? gymPlanLabels[gymPlan.type] ?? gymPlan.type :
    runPlan ? runPlanLabels[runPlan.type] ?? runPlan.type :
    undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="heading.xl" style={styles.title}>Profile</Text>

        {/* ── Your Domains ── */}
        <Text variant="heading.md" style={styles.sectionTitle}>Your Domains</Text>
        <Card variant="info">
          {hasGym && (
            <ProfileRow
              label={`✅ 🏋️ Gym · ${profile?.gymDaysPerWeek ?? '–'} days/week`}
              showDivider={hasRunning || hasNutrition}
            />
          )}
          {hasRunning && (
            <ProfileRow
              label={`✅ 🏃 Running · ${profile?.runDaysPerWeek ?? '–'} days/week`}
              showDivider={hasNutrition}
            />
          )}
          {hasNutrition && (
            <ProfileRow
              label={`✅ 🍽 Nutrition · ${goal ? nutritionGoalLabels[goal] ?? goal : '–'}`}
              showDivider={false}
            />
          )}
        </Card>
        <Button
          variant="text"
          label="Edit domains"
          onPress={() => toast.show('Coming soon — re-run onboarding to change domains')}
          style={styles.textButton}
        />

        {/* ── Plan ── */}
        <Text variant="heading.md" style={styles.sectionTitle}>Plan</Text>
        <Card variant="info">
          <ProfileRow
            label="Goal"
            value={goal ? goalLabels[goal] ?? goal : '–'}
          />
          <ProfileRow
            label="Fitness level"
            value={fitnessLevel ? fitnessLabels[fitnessLevel] ?? fitnessLevel : '–'}
          />
          {hasGym && (
            <ProfileRow
              label="Equipment"
              value={profile?.equipmentAccess ? equipmentLabels[profile.equipmentAccess] ?? profile.equipmentAccess : '–'}
            />
          )}
          <ProfileRow
            label="Program"
            value={programLabel ?? '–'}
            showDivider={false}
          />
        </Card>
        <Button
          variant="text"
          label="Reset plan"
          onPress={handleResetPlan}
          style={styles.textButton}
        />

        {/* ── Settings ── */}
        <Text variant="heading.md" style={styles.sectionTitle}>Settings</Text>
        <Card variant="info">
          <ProfileRow
            label="Units"
            right={
              <SegmentedControl
                options={['Metric', 'Imperial']}
                selectedIndex={settings.units === 'metric' ? 0 : 1}
                onChange={(index) => {
                  const newValue = index === 0 ? 'metric' : 'imperial';
                  analytics.track('units_changed', { from: settings.units, to: newValue });
                  updateSettings({ units: newValue });
                }}
              />
            }
          />
          <ProfileRow
            label="Notifications"
            right={
              <Switch
                value={settings.notifications}
                onValueChange={async (val) => {
                  analytics.track('notifications_toggled', { enabled: val });
                  if (val) {
                    const granted = await requestNotificationPermission();
                    if (!granted) {
                      toast.show('Enable notifications in your device Settings to get workout reminders.');
                      return;
                    }
                    updateSettings({ notifications: true });
                    rescheduleReminders();
                  } else {
                    updateSettings({ notifications: false });
                    cancelAllReminders();
                  }
                }}
                trackColor={{ false: colors.cardBorder, true: colors.accent }}
                thumbColor="#FFF"
              />
            }
          />
          <ProfileRow
            label="Reminder time"
            value={settings.reminderTime}
            onPress={() => toast.show('Coming soon')}
            showDivider={false}
          />
        </Card>

        {/* ── Account ── */}
        <Text variant="heading.md" style={styles.sectionTitle}>Account</Text>
        {authUserId ? (
          <Card variant="info">
            <Text variant="body.sm" color={colors.textSecondary}>Signed in as</Text>
            <Text variant="body.md">{authEmail}</Text>
            <View style={{ height: 12 }} />
            <Button variant="text" label="Sign out" onPress={handleSignOut} />
          </Card>
        ) : (
          <Card variant="info">
            <Text variant="body.md">Sign in to back up your data</Text>
            <Text variant="body.sm" color={colors.textSecondary}>
              Your workouts stay on this device until you sign in.
            </Text>
            <View style={{ height: 16 }} />
            <Button
              variant="primary"
              fullWidth
              label="Continue with Apple"
              onPress={handleAppleSignIn}
              loading={appleLoading}
            />
            <View style={{ height: 8 }} />
            <Button
              variant="secondary"
              fullWidth
              label="Sign in with Email"
              onPress={() => setEmailSheetVisible(true)}
            />
          </Card>
        )}

        {/* ── Subscription ── */}
        <Text variant="heading.md" style={styles.sectionTitle}>Subscription</Text>
        <Card variant="info">
          <ProfileRow
            label="Plan"
            value={subscriptionTier === 'pro' ? 'Pro' : 'Free'}
            showDivider={false}
          />
          {subscriptionTier === 'free' ? (
            <Button
              variant="primary"
              label="Upgrade to Pro →"
              onPress={() => router.push('/paywall')}
              fullWidth
              style={styles.upgradeButton}
            />
          ) : (
            <View style={styles.proSection}>
              <Text variant="body.sm" color={colors.success}>Pro member</Text>
              <Button
                variant="text"
                label="Manage subscription"
                onPress={() => toast.show('Coming soon')}
              />
            </View>
          )}
        </Card>

        {/* ── About ── */}
        <Text variant="heading.md" style={styles.sectionTitle}>About</Text>
        <View>
          <ProfileRow
            label="Research sources"
            onPress={() => toast.show('Coming soon')}
          />
          <ProfileRow
            label="Privacy policy"
            onPress={() => Linking.openURL('https://twentify.app/privacy')}
          />
          <ProfileRow
            label="Terms of service"
            onPress={() => Linking.openURL('https://twentify.app/terms')}
          />
          <ProfileRow
            label="Contact support"
            onPress={() => Linking.openURL('mailto:support@twentify.app')}
            showDivider={false}
          />
        </View>

        <Text
          variant="caption"
          color={colors.textMuted}
          align="center"
          style={styles.version}
        >
          Twentify v1.0.0
        </Text>
      </ScrollView>

      <EmailAuthSheet
        visible={emailSheetVisible}
        onDismiss={() => setEmailSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: screenPadding.top,
    paddingBottom: screenPadding.bottom + 20,
  },
  title: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  textButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  upgradeButton: {
    marginTop: spacing.md,
  },
  proSection: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  version: {
    marginTop: spacing['3xl'],
    marginBottom: spacing.lg,
  },
});
