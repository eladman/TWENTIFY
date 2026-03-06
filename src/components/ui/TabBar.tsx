import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  type SharedValue,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/typography';
import { analytics } from '@/services/analytics';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ICON_SIZE = 22;
const TIMING = { duration: 200 };

// ── SVG Icons ──

function CalendarIcon({ progress }: { progress: SharedValue<number> }) {
  const strokeProps = useAnimatedProps(() => {
    const color = interpolateColor(progress.value, [0, 1], [colors.textMuted, colors.accent]);
    return { stroke: color };
  });

  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 22 22" fill="none">
      <AnimatedRect
        x={2.5}
        y={4}
        width={17}
        height={15}
        rx={2}
        strokeWidth={1.6}
        animatedProps={strokeProps}
      />
      <AnimatedLine x1={7} y1={2} x2={7} y2={5.5} strokeWidth={1.6} strokeLinecap="round" animatedProps={strokeProps} />
      <AnimatedLine x1={15} y1={2} x2={15} y2={5.5} strokeWidth={1.6} strokeLinecap="round" animatedProps={strokeProps} />
      <AnimatedLine x1={2.5} y1={9} x2={19.5} y2={9} strokeWidth={1.6} animatedProps={strokeProps} />
    </Svg>
  );
}

function TrendIcon({ progress }: { progress: SharedValue<number> }) {
  const strokeProps = useAnimatedProps(() => {
    const color = interpolateColor(progress.value, [0, 1], [colors.textMuted, colors.accent]);
    return { stroke: color };
  });

  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 22 22" fill="none">
      <AnimatedPath
        d="M3 17L9 11L13 14L19 5"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={strokeProps}
      />
      <AnimatedPath
        d="M15 5H19V9"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={strokeProps}
      />
    </Svg>
  );
}

function ProfileIcon({ progress }: { progress: SharedValue<number> }) {
  const strokeProps = useAnimatedProps(() => {
    const color = interpolateColor(progress.value, [0, 1], [colors.textMuted, colors.accent]);
    return { stroke: color };
  });

  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 22 22" fill="none">
      <AnimatedCircle cx={11} cy={8} r={3.5} strokeWidth={1.6} animatedProps={strokeProps} />
      <AnimatedPath
        d="M4 19.5C4 15.5 7 13.5 11 13.5C15 13.5 18 15.5 18 19.5"
        strokeWidth={1.6}
        strokeLinecap="round"
        animatedProps={strokeProps}
      />
    </Svg>
  );
}

const ICONS: Record<string, React.FC<{ progress: SharedValue<number> }>> = {
  today: CalendarIcon,
  progress: TrendIcon,
  profile: ProfileIcon,
};

// ── Tab Item ──

function TabItem({
  route,
  label,
  isFocused,
  navigation,
}: {
  route: { key: string; name: string };
  label: string;
  isFocused: boolean;
  navigation: BottomTabBarProps['navigation'];
}) {
  const progress = useDerivedValue<number>(() =>
    withTiming(isFocused ? 1 : 0, TIMING),
  );

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.textMuted, colors.accent]),
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  const IconComponent = ICONS[route.name];

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
      analytics.track('tab_switched', { tab_name: route.name });
    }
  };

  const onLongPress = () => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
    >
      {IconComponent && <IconComponent progress={progress} />}
      <Animated.View style={[styles.dot, dotStyle]} />
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
    </Pressable>
  );
}

// ── Tab Bar ──

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title ?? route.name;
        const isFocused = state.index === index;

        return (
          <TabItem
            key={route.key}
            route={route}
            label={label}
            isFocused={isFocused}
            navigation={navigation}
          />
        );
      })}
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 0.5,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: fontFamilies.bodyMedium,
    marginTop: 2,
    marginBottom: 4,
  },
});
