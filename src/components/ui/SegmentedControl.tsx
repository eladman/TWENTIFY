import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
}: SegmentedControlProps) {
  const position = useSharedValue(selectedIndex);

  const segmentWidth = containerWidth / options.length;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * segmentWidth }],
    width: segmentWidth,
  }));

  const handlePress = (index: number) => {
    if (index === selectedIndex) return;
    position.value = withTiming(index, { duration: 200 });
    Haptics.selectionAsync();
    onChange(index);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {options.map((option, index) => (
        <Pressable
          key={option}
          style={styles.option}
          onPress={() => handlePress(index)}
        >
          <Text
            variant="body.sm"
            color={index === selectedIndex ? '#FFFFFF' : colors.textSecondary}
            style={index === selectedIndex ? styles.activeText : undefined}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const containerWidth = 160;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.textAlpha06,
    borderRadius: radius.full,
    height: 32,
    padding: 2,
    width: containerWidth,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activeText: {
    fontFamily: 'DMSans_600SemiBold',
  },
});
