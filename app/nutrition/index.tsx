import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { fontFamilies } from '@/theme/typography';
import { motion } from '@/theme/animations';
import { haptics } from '@/utils/haptics';
import { toast } from '@/utils/toast';

interface MacroData {
  calories: { consumed: number; target: number };
  protein: { consumed: number; target: number; color: string; label: string };
  carbs: { consumed: number; target: number; color: string; label: string };
  fat: { consumed: number; target: number; color: string; label: string };
}

const DEFAULT_DATA: MacroData = {
  calories: { consumed: 1420, target: 2100 },
  protein: { consumed: 95, target: 140, color: colors.accent, label: 'Protein' },
  carbs: { consumed: 145, target: 220, color: colors.warning, label: 'Carbs' },
  fat: { consumed: 48, target: 70, color: colors.success, label: 'Fat' },
};

const DEFAULT_JOURNAL = `Breakfast — 2 scrambled eggs, whole wheat toast, black coffee

Snack — Greek yogurt with honey

Lunch — Grilled chicken salad with olive oil dressing, side of rice

Snack — Apple with almond butter`;

const vary = (base: number, range: number) =>
  Math.round(base + (Math.random() - 0.3) * range);

function MacroColumn({
  label,
  consumed,
  target,
  color,
  index,
  valueOpacity,
}: {
  label: string;
  consumed: number;
  target: number;
  color: string;
  index: number;
  valueOpacity: Animated.SharedValue<number>;
}) {
  const pct = Math.min(consumed / target, 1);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = 0;
    barWidth.value = withDelay(
      index * motion.stagger.cards,
      withTiming(pct * 100, { duration: motion.duration.chart, easing: motion.easing.out }),
    );
  }, [consumed, target]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
    backgroundColor: color,
  }));

  const valStyle = useAnimatedStyle(() => ({
    opacity: valueOpacity.value,
  }));

  return (
    <View style={macroStyles.column}>
      <Text variant="caption" color={colors.textSecondary}>{label}</Text>
      <Animated.View style={valStyle}>
        <Text variant="heading.sm">{consumed}g</Text>
      </Animated.View>
      <Text variant="caption" color={colors.textMuted}>/ {target}g</Text>
      <View style={macroStyles.track}>
        <Animated.View style={[macroStyles.fill, fillStyle]} />
      </View>
    </View>
  );
}

export default function NutritionScreen() {
  const router = useRouter();
  const [journal, setJournal] = useState(DEFAULT_JOURNAL);
  const [macroData, setMacroData] = useState<MacroData>(DEFAULT_DATA);
  const [isCalculating, setIsCalculating] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { calories } = macroData;
  const calPct = Math.min(calories.consumed / calories.target, 1);

  const calBarWidth = useSharedValue(0);
  const valueOpacity = useSharedValue(1);

  const macros = [macroData.protein, macroData.carbs, macroData.fat];

  useEffect(() => {
    calBarWidth.value = withTiming(calPct * 100, {
      duration: motion.duration.chart,
      easing: motion.easing.out,
    });
  }, [calPct]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const calFillStyle = useAnimatedStyle(() => ({
    width: `${calBarWidth.value}%`,
  }));

  const calValueStyle = useAnimatedStyle(() => ({
    opacity: valueOpacity.value,
  }));

  const handleCalculate = useCallback(() => {
    if (isCalculating) return;

    setIsCalculating(true);
    haptics.medium();

    // Phase 1: fade out values
    valueOpacity.value = withTiming(0, { duration: 300, easing: motion.easing.out });

    const t1 = setTimeout(() => {
      // Phase 2: swap data
      const newData: MacroData = {
        calories: { consumed: vary(1650, 500), target: 2100 },
        protein: { consumed: vary(120, 60), target: 140, color: colors.accent, label: 'Protein' },
        carbs: { consumed: vary(180, 80), target: 220, color: colors.warning, label: 'Carbs' },
        fat: { consumed: vary(55, 30), target: 70, color: colors.success, label: 'Fat' },
      };
      setMacroData(newData);
      calBarWidth.value = 0;
    }, 500);

    const t2 = setTimeout(() => {
      // Phase 3: fade in new values
      valueOpacity.value = withTiming(1, { duration: 300, easing: motion.easing.out });
    }, 700);

    const t3 = setTimeout(() => {
      // Phase 4: done
      setIsCalculating(false);
      toast.success('Macros updated!');
      haptics.success();
    }, 2500);

    timersRef.current.push(t1, t2, t3);
  }, [isCalculating]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text variant="body.lg" color={colors.accent}>{'< Back'}</Text>
          </Pressable>
          <Text variant="heading.md">Today's Food</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Calorie overview */}
          <View style={styles.calorieSection}>
            <Animated.View style={calValueStyle}>
              <Text variant="data.xl" align="center">{calories.consumed.toLocaleString()}</Text>
            </Animated.View>
            <Text variant="body.md" color={colors.textSecondary} align="center">
              of {calories.target.toLocaleString()} kcal
            </Text>
            <View style={styles.calBarTrack}>
              <Animated.View style={[styles.calBarFill, calFillStyle]} />
            </View>
          </View>

          {/* 3-column macro breakdown */}
          <View style={styles.macroRow}>
            {macros.map((m, i) => (
              <MacroColumn key={m.label} {...m} index={i} valueOpacity={valueOpacity} />
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Food Journal */}
          <Text variant="heading.sm" style={styles.journalHeading}>Food Journal</Text>
          <View style={styles.journalContainer}>
            <TextInput
              style={styles.journalInput}
              value={journal}
              onChangeText={setJournal}
              multiline
              scrollEnabled={false}
              placeholder="Log your meals here..."
              placeholderTextColor={colors.textMuted}
              textAlignVertical="top"
            />
          </View>

          {/* Calculate button */}
          <Button
            variant="primary"
            label="Calculate Macros"
            onPress={handleCalculate}
            loading={isCalculating}
            fullWidth
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerSpacer: {
    width: 60,
  },
  scrollContent: {
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.xl,
    paddingBottom: 40,
  },
  calorieSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  calBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  calBarFill: {
    height: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing['2xl'],
  },
  journalHeading: {
    marginBottom: spacing.md,
  },
  journalContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.lg,
  },
  journalInput: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    lineHeight: 28,
    color: colors.textPrimary,
    padding: 0,
  },
});

const macroStyles = StyleSheet.create({
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  track: {
    width: '100%',
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: {
    height: 4,
    borderRadius: radius.full,
  },
});
