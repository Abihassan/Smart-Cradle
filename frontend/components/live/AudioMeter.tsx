import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { COLORS, RADIUS } from "../../utils/constants";

const BAR_COUNT = 24;

function Bar({ index, active }: { index: number; active: boolean }) {
  const height = useSharedValue(4);

  useEffect(() => {
    if (active) {
      height.value = withRepeat(
        withSequence(
          withDelay(index * 40, withTiming(8 + Math.random() * 24, { duration: 280 })),
          withTiming(4, { duration: 280 })
        ),
        -1,
        false
      );
    } else {
      height.value = withTiming(4, { duration: 200 });
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          borderRadius: 2,
          backgroundColor: active ? COLORS.calm : COLORS.surfaceAlt,
        },
        style,
      ]}
    />
  );
}

interface AudioMeterProps {
  active: boolean;
}

/**
 * Visual audio-level meter. Bars animate when `active` is true (live
 * connection present). Real amplitude data would come from the hardware's
 * audio stream via WebSocket — this renders an ambient animation as a
 * placeholder until that's wired up.
 */
export function AudioMeter({ active }: AudioMeterProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        height: 32,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <Bar key={i} index={i} active={active} />
      ))}
    </View>
  );
}
