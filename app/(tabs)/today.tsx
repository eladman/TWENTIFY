import { ScrollView, RefreshControl, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';
import { formatDate } from '@/utils/formatters';
import { useToday } from '@/components/today/useToday';
import { ActivityCard } from '@/components/today/ActivityCard';
import { NutritionCard } from '@/components/today/NutritionCard';
import { WeekStrip } from '@/components/today/WeekStrip';

export default function TodayScreen() {
  const data = useToday();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={data.refreshing}
            onRefresh={data.onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Text variant="heading.xl">Today's 20%</Text>
          <Text variant="body.sm" color={colors.textSecondary}>
            {formatDate(data.selectedDate)}
          </Text>
        </View>

        <Animated.View
          entering={FadeInDown.delay(0).duration(250).easing(Easing.out(Easing.ease))}
          style={styles.cardSpacing}
        >
          <ActivityCard
            state={data.state}
            todayPlan={data.todayPlan}
            completedWorkout={data.completedWorkout}
            completedRun={data.completedRun}
          />
        </Animated.View>

        {data.hasNutritionDomain && (
          <Animated.View
            entering={FadeInDown.delay(80).duration(250).easing(Easing.out(Easing.ease))}
            style={styles.cardSpacing}
          >
            <NutritionCard
              proteinLogged={data.proteinLogged}
              proteinTarget={data.proteinTarget}
              onLogProtein={data.onLogProtein}
            />
          </Animated.View>
        )}

        {data.state !== 'no_plan' && (
          <Animated.View
            entering={FadeInDown.delay(160).duration(250).easing(Easing.out(Easing.ease))}
            style={styles.cardSpacing}
          >
            <WeekStrip
              weekDays={data.weekDays}
              completedCount={data.completedCount}
              totalScheduled={data.totalScheduled}
              onSelectDay={data.onSelectDay}
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xl,
  },
  cardSpacing: {
    marginBottom: spacing.lg,
  },
});
