import { useEffect } from 'react';
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
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={containerStyle}
      >
        <Animated.View style={[backdrop, backdropStyle]}>
          <Pressable style={containerStyle} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[sheetContainer, sheetStyle]}>
          <View style={handleContainer}>
            <View style={handle} />
          </View>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
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
  maxHeight: SCREEN_HEIGHT * 0.85,
  marginTop: 'auto',
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
