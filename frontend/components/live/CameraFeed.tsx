import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { COLORS, RADIUS, SPACING } from "../../utils/constants";

interface CameraFeedProps {
  /**
   * HLS/WebRTC stream URL from the hardware bridge. When null, shows a
   * placeholder "awaiting connection" state — Phase 4 wires this to
   * expo-av <Video> or a WebRTC view once the camera module is integrated.
   */
  streamUrl?: string | null;
  nightVision?: boolean;
}

export function CameraFeed({ streamUrl, nightVision = true }: CameraFeedProps) {
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View
      style={{
        aspectRatio: 4 / 3,
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        backgroundColor: "#05070D",
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      {nightVision && (
        <LinearGradient
          colors={["rgba(78,205,196,0.08)", "rgba(11,14,26,0.3)"]}
          style={{ position: "absolute", width: "100%", height: "100%" }}
        />
      )}

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {streamUrl ? (
          // Phase 4: replace with <Video source={{ uri: streamUrl }} ... />
          <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_400Regular" }}>
            Streaming…
          </Text>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 13 }}>
              Awaiting camera connection
            </Text>
            <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 }}>
              Pair your NurseEye hardware to start streaming
            </Text>
          </View>
        )}
      </View>

      {/* LIVE badge */}
      <View
        style={{
          position: "absolute",
          top: SPACING.md,
          left: SPACING.md,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(11,14,26,0.6)",
          borderRadius: 999,
          paddingHorizontal: SPACING.sm,
          paddingVertical: 4,
          gap: 6,
        }}
      >
        <Animated.View
          style={[
            { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.danger },
            dotStyle,
          ]}
        />
        <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 11 }}>LIVE</Text>
      </View>

      {nightVision && (
        <View
          style={{
            position: "absolute",
            top: SPACING.md,
            right: SPACING.md,
            backgroundColor: "rgba(11,14,26,0.6)",
            borderRadius: 999,
            paddingHorizontal: SPACING.sm,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: COLORS.calm, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
            Night vision
          </Text>
        </View>
      )}
    </View>
  );
}
