import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { COLORS, GRADIENTS, RADIUS } from "../../utils/constants";
import { haptics } from "../../utils/haptics";

const TRACK_HEIGHT = 220;
const THUMB_SIZE = 44;

interface SwingSliderProps {
  value: number; // 0-100
  active: boolean;
  onChange: (value: number) => void;
}

/**
 * Vertical slider — drag up to increase swing intensity. Snaps to nearest 5%
 * on release and calls onChange. Designed for one-handed nighttime use:
 * large touch target, haptic tick every 10%.
 */
export function SwingSlider({ value, active, onChange }: SwingSliderProps) {
  const usableHeight = TRACK_HEIGHT - THUMB_SIZE;
  const position = useSharedValue(usableHeight - (value / 100) * usableHeight);
  const lastHapticStep = useSharedValue(Math.round(value / 10));

  useEffect(() => {
    position.value = withTiming(usableHeight - (value / 100) * usableHeight, { duration: 200 });
  }, [value]);

  const commitValue = (pct: number) => {
    onChange(Math.round(pct / 5) * 5);
  };

  const maybeHaptic = (pct: number) => {
    const step = Math.round(pct / 10);
    if (step !== lastHapticStep.value) {
      lastHapticStep.value = step;
      haptics.selection();
    }
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const next = Math.min(Math.max(e.y - THUMB_SIZE / 2, 0), usableHeight);
      position.value = next;
      const pct = ((usableHeight - next) / usableHeight) * 100;
      runOnJS(maybeHaptic)(pct);
    })
    .onEnd(() => {
      const pct = ((usableHeight - position.value) / usableHeight) * 100;
      runOnJS(commitValue)(pct);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: position.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    height: usableHeight - position.value + THUMB_SIZE / 2,
  }));

  return (
    <View style={{ alignItems: "center" }}>
      <GestureDetector gesture={pan}>
        <View
          style={{
            width: 64,
            height: TRACK_HEIGHT,
            borderRadius: RADIUS.lg,
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.border,
            overflow: "hidden",
            justifyContent: "flex-end",
          }}
        >
          <Animated.View style={[{ position: "absolute", bottom: 0, left: 0, right: 0 }, fillStyle]}>
            <LinearGradient
              colors={active ? GRADIENTS.primary : [COLORS.surfaceAlt, COLORS.surfaceAlt]}
              style={{ flex: 1 }}
            />
          </Animated.View>

          <Animated.View
            style={[
              {
                position: "absolute",
                left: 10,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
              },
              thumbStyle,
            ]}
          >
            <Text style={{ fontFamily: "Manrope_700Bold", fontSize: 13, color: COLORS.bg }}>
              {Math.round(value)}
            </Text>
          </Animated.View>
        </View>
      </GestureDetector>

      <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 12 }}>
        Swing intensity
      </Text>
    </View>
  );
}
