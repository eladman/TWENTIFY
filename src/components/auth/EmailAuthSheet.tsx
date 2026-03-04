import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { signInWithEmail, signUpWithEmail } from '@/services/auth';
import { toast } from '@/utils/toast';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

interface EmailAuthSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailAuthSheet({ visible, onDismiss }: EmailAuthSheetProps) {
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailValid = EMAIL_REGEX.test(email);
  const isPasswordValid = password.length >= 8;
  const canSubmit = isEmailValid && isPasswordValid && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      if (mode === 'sign_in') {
        await signInWithEmail(email, password);
        toast.success('Signed in!');
      } else {
        await signUpWithEmail(email, password);
        toast.success('Account created!');
      }
      setEmail('');
      setPassword('');
      onDismiss();
    } catch (err: any) {
      toast.error(err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'sign_in' ? 'sign_up' : 'sign_in'));
  };

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss} snapPoints={['55%']}>
      <View style={styles.container}>
        <Text variant="heading.lg" style={styles.title}>
          {mode === 'sign_in' ? 'Sign In' : 'Create Account'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />

        {password.length > 0 && !isPasswordValid && (
          <Text variant="caption" color={colors.error} style={styles.hint}>
            Password must be at least 8 characters
          </Text>
        )}

        <Button
          variant="primary"
          fullWidth
          label={mode === 'sign_in' ? 'Sign In' : 'Create Account'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
          style={styles.submitButton}
        />

        <Button
          variant="text"
          label={
            mode === 'sign_in'
              ? "Don't have an account? Create one"
              : 'Already have an account? Sign in'
          }
          onPress={toggleMode}
          style={styles.toggleButton}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  title: {
    marginBottom: spacing.xl,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: colors.textPrimary,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  hint: {
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  toggleButton: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
});
