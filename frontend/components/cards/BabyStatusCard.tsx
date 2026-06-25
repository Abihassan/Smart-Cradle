import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { GlassCard } from "../common/GlassCard";
import { COLORS, CRY_REASON_LABELS, GRADIENTS, SPACING } from "../../utils/constants";
import { fmtBabyAge } from "../../utils/format";

interface BabyStatusCardProps {
  babyName: string;
  birthDate: string;
  isCrying: boolean;
  cryReason: string | null;
}

export function BabyStatusCard({ babyName, birthDate, isCrying, cryReason }: BabyStatusCardProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.18 }],
    opacity: 0.35 - pulse.value * 0.2,
  }));

  const statusColor = isCrying ? COLORS.danger : COLORS.calm;
  const statusGradient = isCrying ? GRADIENTS.danger : GRADIENTS.calm;
  const statusLabel = isCrying
    ? `Crying${cryReason ? ` · ${CRY_REASON_LABELS[cryReason] ?? cryReason}` : ""}`
    : "Sleeping peacefully";

  return (
    <GlassCard style={{ alignItems: "center", paddingVertical: SPACING.xl }}>
      <View style={{ width: 96, height: 96, alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 2,
              borderColor: statusColor,
            },
            ringStyle,
          ]}
        />
        <LinearGradient
          colors={statusGradient}
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: "Manrope_800ExtraBold", fontSize: 28, color: "#fff" }}>
            {babyName.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
      </View>

      <Text
        style={{
          color: COLORS.textPrimary,
          fontFamily: "Manrope_700Bold",
          fontSize: 22,
          marginTop: SPACING.lg,
        }}
      >
        {babyName}
      </Text>
      <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 }}>
        {fmtBabyAge(birthDate)}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: SPACING.md,
          paddingHorizontal: SPACING.lg,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: isCrying ? COLORS.dangerMuted : COLORS.calmMuted,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: statusColor,
            marginRight: SPACING.sm,
          }}
        />
        <Text style={{ color: statusColor, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
          {statusLabel}
        </Text>
      </View>
    </GlassCard>
  );
}
