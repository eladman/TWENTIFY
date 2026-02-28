import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { haptics } from '@/utils/haptics';
import {
  getQuestionsForDomains,
  type OnboardingQuestion,
} from '@/data/onboardingQuestions';
import { useUserStore } from '@/stores/useUserStore';
import type { Goal, FitnessLevel, UserProfile } from '@/types/user';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ANIM_DURATION = 250;
const ANIM_CONFIG = { duration: ANIM_DURATION, easing: Easing.out(Easing.ease) };

// ── Progress Dots ─────────────────────────────────────────────────────

function QuestionProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        const isCompleted = i < current;
        const bg = isActive
          ? colors.accent
          : isCompleted
            ? 'rgba(0, 113, 227, 0.4)'
            : colors.cardBorder;
        return (
          <View
            key={i}
            style={[dotStyles.dot, { backgroundColor: bg, width: isActive ? 20 : 8 }]}
          />
        );
      })}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing['2xl'],
  },
  dot: {
    height: 8,
    borderRadius: 9999,
  },
});

// ── Single-Select Question ────────────────────────────────────────────

function SingleSelectQuestion({
  question,
  selectedValue,
  onSelect,
}: {
  question: OnboardingQuestion;
  selectedValue: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={selectStyles.container}>
      {(question.options ?? []).map((option, index) => {
        const isSelected = option.value === selectedValue;
        return (
          <Card
            key={`${option.value}-${index}`}
            variant="info"
            onPress={() => {
              haptics.selection();
              onSelect(option.value);
            }}
            style={isSelected ? selectStyles.cardSelected : undefined}
          >
            <View style={selectStyles.row}>
              {option.icon ? (
                <Text variant="heading.md" style={selectStyles.icon}>
                  {option.icon}
                </Text>
              ) : null}
              <Text
                variant="body.lg"
                color={isSelected ? colors.accent : colors.textPrimary}
                style={isSelected ? { fontFamily: 'DMSans_600SemiBold' } : undefined}
              >
                {option.label}
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const selectStyles = StyleSheet.create({
  container: {
    gap: spacing.md,
    width: '100%',
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    lineHeight: 24,
  },
});

// ── Numeric Form Question ─────────────────────────────────────────────

function NumericFormQuestion({
  question,
  formValues,
  onChangeField,
}: {
  question: OnboardingQuestion;
  formValues: Record<string, string>;
  onChangeField: (key: string, value: string) => void;
}) {
  return (
    <View style={formStyles.container}>
      {(question.fields ?? []).map((field) => {
        if (field.key === 'sex') {
          return (
            <View key={field.key} style={formStyles.fieldGroup}>
              <Text variant="caption" color={colors.textSecondary} style={formStyles.fieldLabel}>
                {field.label.toUpperCase()}
              </Text>
              <View style={formStyles.sexToggle}>
                <SexOption
                  label="Male"
                  selected={formValues.sex === 'male'}
                  onPress={() => {
                    haptics.selection();
                    onChangeField('sex', 'male');
                  }}
                />
                <SexOption
                  label="Female"
                  selected={formValues.sex === 'female'}
                  onPress={() => {
                    haptics.selection();
                    onChangeField('sex', 'female');
                  }}
                />
              </View>
            </View>
          );
        }

        return (
          <View key={field.key} style={formStyles.fieldGroup}>
            <Text variant="caption" color={colors.textSecondary} style={formStyles.fieldLabel}>
              {field.label.toUpperCase()}
            </Text>
            <View style={formStyles.inputRow}>
              <TextInput
                style={formStyles.input}
                value={formValues[field.key] ?? ''}
                onChangeText={(t) => onChangeField(field.key, t)}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={field.keyboardType as 'numeric' | 'default'}
                returnKeyType="next"
                autoCorrect={false}
              />
              {field.unit ? (
                <Text variant="body.md" color={colors.textSecondary}>
                  {field.unit}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function SexOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[formStyles.sexBtn, selected && formStyles.sexBtnSelected]}
    >
      <Text
        variant="body.md"
        color={selected ? colors.accent : colors.textSecondary}
        style={selected ? { fontFamily: 'DMSans_600SemiBold' } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const formStyles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    width: '100%',
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    letterSpacing: 1.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  sexToggle: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sexBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  sexBtnSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
});

// ── Assessment Screen ─────────────────────────────────────────────────

export default function AssessmentScreen() {
  const router = useRouter();
  const domains = useUserStore((s) => s.domains);
  const profile = useUserStore((s) => s.profile);
  const setGoal = useUserStore((s) => s.setGoal);
  const setFitnessLevel = useUserStore((s) => s.setFitnessLevel);
  const setProfile = useUserStore((s) => s.setProfile);

  const questions = useMemo(
    () => getQuestionsForDomains(domains),
    [domains],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const isAnimating = useRef(false);
  const translateX = useSharedValue(0);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const canContinue = useMemo(() => {
    if (!question) return false;
    if (question.type === 'single_select') return selectedValue !== null;
    if (question.type === 'numeric_form') {
      return (question.fields ?? []).every(
        (f) => (formValues[f.key] ?? '').trim().length > 0,
      );
    }
    return false;
  }, [question, selectedValue, formValues]);

  // Reset local answer state when moving to next question
  useEffect(() => {
    setSelectedValue(null);
    setFormValues({});
  }, [currentIndex]);

  // ── Store persistence ───────────────────────────────────────────────

  function persistAnswer(q: OnboardingQuestion, value: string | Record<string, string>) {
    if (q.storeKey === 'goal') {
      setGoal(value as Goal);
    } else if (q.storeKey === 'fitnessLevel') {
      setFitnessLevel(value as FitnessLevel);
    } else if (q.storeKey === 'profile') {
      const current: UserProfile = profile ?? {};

      if (q.id === 'gym_days') {
        setProfile({ ...current, gymDaysPerWeek: Number(value) as 3 | 4 });
      } else if (q.id === 'training_days') {
        setProfile({ ...current, trainingDaysPerWeek: Number(value) as 3 | 4 | 5 });
      } else if (q.id === 'equipment') {
        setProfile({ ...current, equipmentAccess: value as UserProfile['equipmentAccess'] });
      } else if (q.id === 'running_level') {
        setProfile({ ...current, runningLevel: value as UserProfile['runningLevel'] });
      } else if (q.id === 'has_hr_monitor') {
        setProfile({ ...current, hasHrMonitor: value === 'true' });
      } else if (q.id === 'body_stats') {
        const v = value as Record<string, string>;
        setProfile({
          ...current,
          age: Number(v.age),
          weightKg: Number(v.weightKg),
          heightCm: Number(v.heightCm),
          sex: v.sex as 'male' | 'female',
        });
      }
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────

  function advanceToNext() {
    isAnimating.current = false;

    if (isLast) {
      router.push('/(onboarding)/preview');
      return;
    }

    // Snap to right (invisible), then slide in
    translateX.value = SCREEN_WIDTH;
    translateX.value = withTiming(0, ANIM_CONFIG);
    setCurrentIndex((i) => i + 1);
  }

  function handleContinue() {
    if (!canContinue || !question || isAnimating.current) return;

    const answerValue = question.type === 'single_select' ? selectedValue! : formValues;
    persistAnswer(question, answerValue);

    if (isLast) {
      router.push('/(onboarding)/preview');
      return;
    }

    isAnimating.current = true;
    translateX.value = withTiming(-SCREEN_WIDTH, ANIM_CONFIG, (finished) => {
      if (finished) runOnJS(advanceToNext)();
    });
  }

  const questionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Guard: no questions (shouldn't happen, but safe)
  if (questions.length === 0) {
    router.replace('/(onboarding)/domains');
    return null;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress dots — fixed, don't slide */}
        <View style={styles.dotsContainer}>
          <QuestionProgressDots total={questions.length} current={currentIndex} />
        </View>

        {/* Animated question panel */}
        <Animated.View style={[styles.questionPanel, questionAnimatedStyle]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text variant="heading.lg" align="center">
              {question.question}
            </Text>

            <View style={styles.spacer} />

            {question.type === 'single_select' ? (
              <SingleSelectQuestion
                question={question}
                selectedValue={selectedValue}
                onSelect={setSelectedValue}
              />
            ) : (
              <NumericFormQuestion
                question={question}
                formValues={formValues}
                onChangeField={(key, value) =>
                  setFormValues((prev) => ({ ...prev, [key]: value }))
                }
              />
            )}
          </ScrollView>
        </Animated.View>

        {/* Bottom button */}
        <View style={styles.bottom}>
          <Button
            variant="primary"
            label={isLast ? 'See My Plan' : 'Continue'}
            onPress={handleContinue}
            disabled={!canContinue}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  dotsContainer: {
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  questionPanel: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  spacer: {
    height: spacing['2xl'],
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
});
