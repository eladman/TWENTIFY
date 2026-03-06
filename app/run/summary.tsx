import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';
import { useRunStore } from '@/stores/useRunStore';
import { useUserStore } from '@/stores/useUserStore';
import { formatDuration, formatDistance } from '@/utils/formatters';
import { runSessions, walkRunProgression } from '@/data/runTemplates';
import type { RunSessionType, RunSession } from '@/types/run';

// ── Helpers ─────────────────────────────────────────────────────────────

function lookupSession(
  templateId: string,
  sessionType: RunSessionType,
): RunSession | undefined {
  if (sessionType === 'walk_run') {
    const match = templateId.match(/^wr_w(\d+)_s(\d+)$/);
    if (match) {
      const week = parseInt(match[1], 10);
      const sessionNum = parseInt(match[2], 10);
      const weekData = walkRunProgression.find((w) => w.week === week);
      return weekData?.sessions[sessionNum - 1];
    }
    return undefined;
  }
  return runSessions[templateId];
}

function getSessionLabel(
  sessionType: RunSessionType,
  session?: RunSession,
): string {
  switch (sessionType) {
    case 'easy':
      return 'Easy / Zone 2';
    case 'tempo':
      return 'Tempo Run';
    case 'intervals': {
      if (session) {
        const workSegments = session.segments.filter((s) => s.type === 'work');
        if (workSegments.length > 0) {
          const workDurMin = Math.round(
            workSegments[0].durationSeconds / 60,
          );
          return `Intervals ${workSegments.length}\u00D7${workDurMin}min`;
        }
      }
      return 'Intervals';
    }
    case 'walk_run': {
      const match = session?.id.match(/^wr_w(\d+)_s(\d+)$/);
      if (match) return `Walk/Run W${match[1]}D${match[2]}`;
      return 'Walk/Run';
    }
  }
}

function getSegmentInfo(
  sessionType: RunSessionType,
  session?: RunSession,
): string | null {
  if (!session) return null;
  if (sessionType === 'intervals') {
    const workCount = session.segments.filter((s) => s.type === 'work').length;
    if (workCount > 0) return `${workCount}/${workCount} intervals`;
    return null;
  }
  if (sessionType === 'walk_run') {
    const coreSegments = session.segments.filter(
      (s) => s.type !== 'warmup' && s.type !== 'cooldown',
    );
    const rounds = Math.floor(coreSegments.length / 2);
    if (rounds > 0) return `${rounds}/${rounds} rounds`;
    return null;
  }
  return null;
}

function getContextualMessage(
  sessionType: RunSessionType,
  session?: RunSession,
): string {
  switch (sessionType) {
    case 'easy':
      return '80% of your running should feel this easy. That\u2019s how the best get better. \u2014 Seiler, 2010';
    case 'tempo':
      return 'The tempo run develops your lactate threshold \u2014 the engine behind race performance.';
    case 'intervals':
      return 'High intensity in controlled doses. This is the 20% that accelerates fitness.';
    case 'walk_run': {
      const match = session?.id.match(/^wr_w(\d+)/);
      const week = match ? match[1] : '';
      return `Week ${week} done. You\u2019re building the foundation. Consistency is everything. \u2014 Pedisic, 2020`;
    }
  }
}

// ── Fade-in hook ────────────────────────────────────────────────────────

function useFadeIn(delay: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const config = { duration: 350, easing: Easing.out(Easing.ease) };
    opacity.value = withDelay(delay, withTiming(1, config));
    translateY.value = withDelay(delay, withTiming(0, config));
  }, [delay, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return style;
}

// ── Stat Card ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.statCard}>
      <Text variant="overline" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="heading.md" style={styles.statValue}>
        {value}
      </Text>
    </Card>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────

export default function RunSummaryScreen() {
  const router = useRouter();
  const history = useRunStore((s) => s.history);
  const units = useUserStore((s) => s.settings.units);

  const run = history[history.length - 1];

  const headingAnim = useFadeIn(0);
  const gridAnim = useFadeIn(100);
  const bottomAnim = useFadeIn(200);

  const handleDone = () => {
    router.dismissAll();
  };

  // Edge case: no run history
  if (!run) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.fallback}>
          <Text variant="heading.lg" align="center">
            No Run Data
          </Text>
          <Text
            variant="body.md"
            color={colors.textSecondary}
            align="center"
            style={styles.fallbackSub}
          >
            Complete a run to see your summary.
          </Text>
          <Button variant="primary" label="Done" onPress={handleDone} fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  const session = lookupSession(run.templateId, run.sessionType);
  const typeLabel = getSessionLabel(run.sessionType, session);
  const segmentInfo = getSegmentInfo(run.sessionType, session);
  const contextMessage = getContextualMessage(run.sessionType, session);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Animated.View style={[styles.headingSection, headingAnim]}>
          <Text variant="heading.lg" align="center">
            Run Complete
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View style={[styles.grid, gridAnim]}>
          <View style={styles.gridRow}>
            <StatCard
              label="DURATION"
              value={formatDuration(run.durationSeconds)}
            />
            <StatCard
              label="DISTANCE"
              value={
                run.distanceMeters
                  ? formatDistance(run.distanceMeters, units)
                  : '\u2014'
              }
            />
          </View>
          <View style={styles.gridRow}>
            <StatCard label="TYPE" value={typeLabel} />
            <StatCard
              label="AVG HR"
              value={run.avgHr ? `${run.avgHr} bpm` : '\u2014'}
            />
          </View>
        </Animated.View>

        {/* Segment completion (intervals / walk_run only) */}
        {segmentInfo && (
          <Animated.View style={[styles.segmentRow, gridAnim]}>
            <Text variant="body.md" color={colors.textSecondary}>
              {segmentInfo}
            </Text>
          </Animated.View>
        )}

        {/* Contextual message */}
        <Animated.View style={[styles.messageSection, bottomAnim]}>
          <Text
            variant="body.md"
            color={colors.textSecondary}
            align="center"
            style={styles.messageText}
          >
            {contextMessage}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Done button */}
      <Animated.View style={[styles.bottom, bottomAnim]}>
        <Button
          variant="primary"
          label="Done \u2192"
          onPress={handleDone}
          fullWidth
        />
      </Animated.View>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing['4xl'],
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  grid: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    marginTop: spacing.xs,
  },
  segmentRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  messageSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  messageText: {
    fontStyle: 'italic',
  },
  bottom: {
    paddingHorizontal: screenPadding.horizontal,
    paddingBottom: spacing.xl,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: screenPadding.horizontal,
  },
  fallbackSub: {
    marginTop: spacing.sm,
    marginBottom: spacing['3xl'],
  },
});
