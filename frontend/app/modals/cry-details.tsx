import { useLocalSearchParams, useRouter } from "expo-router";
import { Baby, X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { GlassCard } from "../../components/common/GlassCard";
import { CRY_REASON_LABELS, COLORS, RADIUS, SPACING } from "../../utils/constants";
import { fmtClock } from "../../utils/format";

const ACTION_COPY: Record<string, string> = {
  hunger: "NurseEye started the feeding sequence automatically.",
  tired: "Swing and soothing sounds were turned on to help baby settle.",
  pain: "An emergency alert was sent — please check on baby right away.",
  discomfort: "Gentle swinging was started and you were notified.",
  unknown: "No automatic action was taken — please check on baby.",
};

export default function CryDetailsModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string; confidence?: string; timestamp?: string }>();

  const reason = params.reason || "unknown";
  const confidence = params.confidence ? Math.round(parseFloat(params.confidence) * 100) : null;
  const timestamp = params.timestamp;

  const isEmergency = reason === "pain";

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(5,7,13,0.7)", justifyContent: "flex-end" }}>
      <Animated.View entering={FadeInUp.duration(250)}>
        <GlassCard
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            paddingTop: SPACING.xl,
            paddingBottom: SPACING.xxl,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{ position: "absolute", top: SPACING.lg, right: SPACING.lg }}
          >
            <X color={COLORS.textTertiary} size={22} />
          </Pressable>

          <View style={{ alignItems: "center", marginBottom: SPACING.lg }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: RADIUS.md,
                backgroundColor: isEmergency ? COLORS.dangerMuted : COLORS.accentMuted,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: SPACING.md,
              }}
            >
              <Baby color={isEmergency ? COLORS.danger : COLORS.accent} size={28} />
            </View>
            <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 20 }}>
              Cry detected · {CRY_REASON_LABELS[reason] ?? reason}
            </Text>
            {timestamp && (
              <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 }}>
                {fmtClock(timestamp)}
              </Text>
            )}
          </View>

          {confidence != null && (
            <View style={{ marginBottom: SPACING.lg }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 13 }}>
                  AI confidence
                </Text>
                <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 13 }}>
                  {confidence}%
                </Text>
              </View>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.surfaceAlt, overflow: "hidden" }}>
                <View
                  style={{
                    height: 8,
                    width: `${confidence}%`,
                    backgroundColor: isEmergency ? COLORS.danger : COLORS.accent,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          )}

          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.md,
              padding: SPACING.lg,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 12, marginBottom: 4 }}>
              What happened
            </Text>
            <Text style={{ color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 }}>
              {ACTION_COPY[reason] ?? ACTION_COPY.unknown}
            </Text>
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}
