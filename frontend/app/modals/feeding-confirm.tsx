import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Utensils, X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { DeviceApi } from "../../api";
import { GlassCard } from "../../components/common/GlassCard";
import { NeonButton } from "../../components/common/NeonButton";
import { useBabyStore } from "../../store/baby.store";
import { useDeviceStore } from "../../store/device.store";
import { COLORS, RADIUS, SPACING } from "../../utils/constants";

export default function FeedingConfirmModal() {
  const router = useRouter();
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const setDeviceState = useDeviceStore((s) => s.setState);
  const queryClient = useQueryClient();

  const feedMutation = useMutation({
    mutationFn: () => DeviceApi.triggerFeed(selectedBabyId!, true),
    onSuccess: (data) => {
      setDeviceState({ feedingActive: data.feeding_active });
      queryClient.invalidateQueries({ queryKey: ["baby-status", selectedBabyId] });
      router.back();
    },
  });

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
                backgroundColor: COLORS.primaryMuted,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: SPACING.md,
              }}
            >
              <Utensils color={COLORS.primary} size={28} />
            </View>
            <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 20 }}>
              Start feeding sequence?
            </Text>
            <Text
              style={{
                color: COLORS.textSecondary,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                textAlign: "center",
                marginTop: SPACING.sm,
                paddingHorizontal: SPACING.xl,
              }}
            >
              This will activate the feeding mechanism. Make sure the bottle is loaded and positioned correctly.
            </Text>
          </View>

          <NeonButton
            label="Confirm & start"
            onPress={() => feedMutation.mutate()}
            loading={feedMutation.isPending}
          />

          <Pressable onPress={() => router.back()} style={{ marginTop: SPACING.md, alignItems: "center" }}>
            <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 14 }}>
              Cancel
            </Text>
          </Pressable>
        </GlassCard>
      </Animated.View>
    </View>
  );
}
