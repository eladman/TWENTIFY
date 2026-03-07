import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { EmailAuthSheet } from '@/components/auth/EmailAuthSheet';
import { signInWithApple } from '@/services/auth';
import { useUserStore } from '@/stores/useUserStore';
import { toast } from '@/utils/toast';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';

export default function WelcomeScreen() {
  const router = useRouter();
  const [emailSheetVisible, setEmailSheetVisible] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const navigateAfterAuth = () => {
    const { onboardingCompleted } = useUserStore.getState();
    if (onboardingCompleted) {
      router.replace('/(tabs)/today');
    } else {
      router.replace('/(onboarding)/domains');
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const user = await signInWithApple();
      if (user) {
        toast.success('Signed in!');
        navigateAfterAuth();
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Sign in failed');
    } finally {
      setAppleLoading(false);
    }
  };

  const handleEmailDismiss = () => {
    setEmailSheetVisible(false);
    // Check if user got authenticated while the sheet was open
    const { authUserId } = useUserStore.getState();
    if (authUserId) {
      navigateAfterAuth();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top: Branding */}
        <View style={styles.top}>
          <Text
            variant="heading.xl"
            style={styles.appName}
          >
            Twentify
          </Text>
          <Text
            variant="body.lg"
            color={colors.textSecondary}
            align="center"
          >
            the 20% that drives 80% of your results
          </Text>
        </View>

        {/* Bottom: Auth buttons */}
        <View style={styles.bottom}>
          <Button
            variant="primary"
            fullWidth
            label="Continue with Apple"
            onPress={handleAppleSignIn}
            loading={appleLoading}
          />
          <View style={{ height: spacing.md }} />
          <Button
            variant="secondary"
            fullWidth
            label="Sign in with Email"
            onPress={() => setEmailSheetVisible(true)}
          />
        </View>
      </View>

      <EmailAuthSheet
        visible={emailSheetVisible}
        onDismiss={handleEmailDismiss}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: screenPadding.horizontal,
    justifyContent: 'space-between',
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 40,
    lineHeight: 52,
    marginBottom: spacing.sm,
  },
  bottom: {
    paddingBottom: spacing['3xl'],
  },
});
