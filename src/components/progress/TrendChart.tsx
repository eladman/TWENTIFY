import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  type SharedValue,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { kgToDisplayWeight, getUnitLabel } from '@/utils/formatters';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { Units } from '@/types/user';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TrendChartProps {
  exerciseId: string;
  title: string;
  unit: Units;
}

const CHART_HEIGHT = 120;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 12;
const DRAW_DURATION = 800;

export function TrendChart({ exerciseId, title, unit }: TrendChartProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const history = useWorkoutStore((s) => s.history);

  const dataPoints = useMemo(() => {
    const points: number[] = [];

    for (const session of history) {
      const exercise = session.exercises.find(
        (e) => e.exerciseId === exerciseId,
      );
      if (!exercise) continue;

      const completedWeights = exercise.sets
        .filter((s) => s.completed)
        .map((s) => s.weightKg);

      if (completedWeights.length === 0) continue;
      points.push(Math.max(...completedWeights));
    }

    // Take last 12 sessions max
    return points.slice(-12);
  }, [history, exerciseId]);

  const displayPoints = useMemo(
    () => dataPoints.map((kg) => kgToDisplayWeight(kg, unit)),
    [dataPoints, unit],
  );

  const unitLabel = getUnitLabel(unit);

  const handleLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  // Animation shared values
  const lineProgress = useSharedValue(0);

  useEffect(() => {
    if (chartWidth > 0 && displayPoints.length >= 2) {
      lineProgress.value = 0;
      lineProgress.value = withTiming(1, {
        duration: DRAW_DURATION,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [chartWidth, displayPoints.length, lineProgress]);

  // Edge case: 0 data points
  if (displayPoints.length === 0) {
    return (
      <Card variant="info">
        <Text variant="heading.sm">{title}</Text>
        <Text
          variant="body.sm"
          color={colors.textSecondary}
          style={styles.emptyText}
        >
          Complete 2+ sessions to see trends
        </Text>
      </Card>
    );
  }

  // Edge case: 1 data point
  if (displayPoints.length === 1) {
    return (
      <Card variant="info">
        <Text variant="heading.sm">{title}</Text>
        <Text
          variant="body.sm"
          color={colors.textSecondary}
          style={styles.emptyText}
        >
          First session: {displayPoints[0]}
          {unitLabel}
        </Text>
      </Card>
    );
  }

  // 2+ data points — render chart
  const minWeight = Math.min(...displayPoints);
  const maxWeight = Math.max(...displayPoints);
  const isFlat = minWeight === maxWeight;

  const drawWidth = chartWidth - PAD_LEFT - PAD_RIGHT;
  const drawHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const getX = (i: number) =>
    PAD_LEFT + (drawWidth / (displayPoints.length - 1)) * i;

  const getY = (val: number) => {
    if (isFlat) return PAD_TOP + drawHeight / 2;
    return PAD_TOP + drawHeight - ((val - minWeight) / (maxWeight - minWeight)) * drawHeight;
  };

  // Build SVG path
  const linePoints = displayPoints.map((val, i) => `${getX(i)},${getY(val)}`);
  const linePath = `M${linePoints.join(' L')}`;

  // Closed path for gradient fill
  const fillPath = `${linePath} L${getX(displayPoints.length - 1)},${CHART_HEIGHT - PAD_BOTTOM} L${getX(0)},${CHART_HEIGHT - PAD_BOTTOM} Z`;

  // Estimate total path length for stroke animation
  let pathLength = 0;
  for (let i = 1; i < displayPoints.length; i++) {
    const dx = getX(i) - getX(i - 1);
    const dy = getY(displayPoints[i]) - getY(displayPoints[i - 1]);
    pathLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Summary
  const first = displayPoints[0];
  const last = displayPoints[displayPoints.length - 1];
  const diff = Math.round((last - first) * 10) / 10;
  const increased = last > first;

  return (
    <Card variant="info">
      <Text variant="heading.sm">{title}</Text>
      <View style={styles.chartArea} onLayout={handleLayout}>
        {chartWidth > 0 && (
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.accent} stopOpacity={0.1} />
                <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            {/* Gradient fill */}
            <Path d={fillPath} fill="url(#areaGrad)" />

            {/* Animated trend line */}
            <AnimatedLinePath
              d={linePath}
              pathLength={pathLength}
              progress={lineProgress}
            />

            {/* Animated data point circles */}
            {displayPoints.map((val, i) => (
              <AnimatedDataPoint
                key={i}
                cx={getX(i)}
                cy={getY(val)}
                index={i}
                total={displayPoints.length}
                progress={lineProgress}
              />
            ))}

            {/* Y-axis labels */}
            <SvgText
              x={PAD_LEFT - 4}
              y={isFlat ? PAD_TOP + drawHeight / 2 + 4 : PAD_TOP + 4}
              textAnchor="end"
              fontSize={10}
              fill={colors.textSecondary}
            >
              {maxWeight}
            </SvgText>
            {!isFlat && (
              <SvgText
                x={PAD_LEFT - 4}
                y={CHART_HEIGHT - PAD_BOTTOM}
                textAnchor="end"
                fontSize={10}
                fill={colors.textSecondary}
              >
                {minWeight}
              </SvgText>
            )}
          </Svg>
        )}
      </View>

      {/* Summary text */}
      {increased ? (
        <Text variant="body.sm" color={colors.success}>
          {'\u2191'} {diff}
          {unitLabel} over {displayPoints.length} sessions
        </Text>
      ) : (
        <Text variant="body.sm" color={colors.textSecondary}>
          {displayPoints.length} sessions tracked
        </Text>
      )}
    </Card>
  );
}

function AnimatedLinePath({
  d,
  pathLength,
  progress,
}: {
  d: string;
  pathLength: number;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - progress.value),
  }));

  return (
    <AnimatedPath
      d={d}
      stroke={colors.accent}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
      strokeDasharray={pathLength}
      animatedProps={animatedProps}
    />
  );
}

function AnimatedDataPoint({
  cx,
  cy,
  index,
  total,
  progress,
}: {
  cx: number;
  cy: number;
  index: number;
  total: number;
  progress: SharedValue<number>;
}) {
  // Each point appears when the line drawing reaches its x-position
  const threshold = total > 1 ? index / (total - 1) : 0;

  const animatedProps = useAnimatedProps(() => {
    const scale = progress.value >= threshold
      ? Math.min(1, (progress.value - threshold) * total)
      : 0;
    return {
      r: 3 * scale,
    };
  });

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      fill={colors.accent}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({
  chartArea: {
    height: CHART_HEIGHT,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  emptyText: {
    marginTop: spacing.sm,
  },
});
