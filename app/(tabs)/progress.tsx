import { ScrollView, RefreshControl, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { ConsistencyGrid } from '@/components/progress/ConsistencyGrid';
import { TrendChart } from '@/components/progress/TrendChart';
import { RunStats } from '@/components/progress/RunStats';
import { useProgress } from '@/components/progress/useProgress';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';

export default function ProgressScreen() {
  const {
    hasGymDomain,
    hasRunningDomain,
    units,
    trendCharts,
    hasWorkoutHistory,
    hasRunHistory,
    refreshing,
    onRefresh,
  } = useProgress();

  const runningDelay = hasGymDomain ? 160 : 80;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <Text variant="heading.xl">Progress</Text>

        <Animated.View
          entering={FadeInDown.delay(0).duration(250).easing(Easing.out(Easing.ease))}
          style={styles.section}
        >
          <ConsistencyGrid />
        </Animated.View>

        {hasGymDomain && (
          <Animated.View
            entering={FadeInDown.delay(80).duration(250).easing(Easing.out(Easing.ease))}
            style={styles.section}
          >
            <Text variant="heading.md" style={styles.sectionHeading}>
              Strength
            </Text>
            {trendCharts.length > 0 ? (
              <View style={styles.chartsContainer}>
                {trendCharts.map((chart) => (
                  <TrendChart
                    key={chart.exerciseId}
                    exerciseId={chart.exerciseId}
                    title={chart.title}
                    unit={units}
                  />
                ))}
              </View>
            ) : (
              <Card variant="info">
                <Text
                  variant="body.md"
                  color={colors.textSecondary}
                  style={styles.emptyText}
                >
                  Complete your first workout to start tracking strength trends.
                </Text>
              </Card>
            )}
          </Animated.View>
        )}

        {hasRunningDomain && (
          <Animated.View
            entering={FadeInDown.delay(runningDelay).duration(250).easing(Easing.out(Easing.ease))}
            style={styles.section}
          >
            {hasRunHistory ? (
              <RunStats unit={units} />
            ) : (
              <Card variant="info">
                <Text
                  variant="body.md"
                  color={colors.textSecondary}
                  style={styles.emptyText}
                >
                  Complete your first run to start tracking running stats.
                </Text>
              </Card>
            )}
          </Animated.View>
        )}
      </ScrollView>
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
  section: {
    marginTop: spacing['2xl'],
  },
  sectionHeading: {
    marginBottom: spacing.md,
  },
  chartsContainer: {
    gap: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
});
