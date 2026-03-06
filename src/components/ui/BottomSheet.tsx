import { useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Pressable,
  ViewStyle,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  snapPoints?: string[];
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function parseSnapPoint(snap: string): number {
  if (snap.endsWith('%')) {
    return (parseFloat(snap) / 100) * SCREEN_HEIGHT;
  }
  return parseFloat(snap);
}

export function BottomSheet({
  visible,
  onDismiss,
  children,
  snapPoints = ['50%'],
}: BottomSheetProps) {
  const sheetHeight = useMemo(
    () => parseSnapPoint(snapPoints[0]),
    [snapPoints],
  );

  const translateY = useSharedValue(sheetHeight);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      translateY.value = withTiming(sheetHeight, { duration: 250 });
    }
  }, [visible, translateY, sheetHeight]);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const draggedPast25 = translateY.value > sheetHeight * 0.25;
      const fastFlick = event.velocityY > 500;

      if (draggedPast25 || fastFlick) {
        translateY.value = withTiming(sheetHeight, { duration: 250 });
        runOnJS(onDismiss)();
      } else {
        translateY.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: sheetHeight,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetHeight], [1, 0]),
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <GestureHandlerRootView style={containerStyle}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={containerStyle}
        >
          <Animated.View style={[backdrop, backdropStyle]}>
            <Pressable style={containerStyle} onPress={onDismiss} />
          </Animated.View>

          <GestureDetector gesture={pan}>
            <Animated.View style={[sheetContainer, sheetStyle]}>
              <View style={handleContainer}>
                <View style={handle} />
              </View>
              {children}
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const containerStyle: ViewStyle = {
  flex: 1,
};

const backdrop: ViewStyle = {
  ...containerStyle,
  backgroundColor: colors.backdrop,
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const sheetContainer: ViewStyle = {
  backgroundColor: colors.card,
  borderTopLeftRadius: radius.xl,
  borderTopRightRadius: radius.xl,
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  paddingBottom: 34,
  ...shadows.lg,
};

const handleContainer: ViewStyle = {
  alignItems: 'center',
  paddingTop: 12,
  paddingBottom: 8,
};

const handle: ViewStyle = {
  width: 36,
  height: 4,
  borderRadius: 2,
  backgroundColor: colors.sheetHandle,
};
