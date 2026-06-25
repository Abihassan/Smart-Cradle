import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Music, Utensils, Waves, X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { DeviceApi } from "../../api";
import { GlassCard } from "../../components/common/GlassCard";
import { useBabyStore } from "../../store/baby.store";
import { useDeviceStore } from "../../store/device.store";
import { COLORS, RADIUS, SPACING } from "../../utils/constants";
import { haptics } from "../../utils/haptics";

/**
 * Quick-access device panel, presented as a modal (e.g. from a long-press
 * on the Home status card). Mirrors the Control tab's three primary
 * toggles for fast access without navigating away from Home/Live.
 */
export default function DeviceControlModal() {
  const router = useRouter();
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const device = useDeviceStore();
  const setDeviceState = useDeviceStore((s) => s.setState);

  const swingMutation = useMutation({
    mutationFn: (on: boolean) => DeviceApi.setSwing(selectedBabyId!, on),
    onSuccess: (data) => setDeviceState({ swingOn: data.swing_on, swingIntensity: data.swing_intensity }),
  });

  const musicMutation = useMutation({
    mutationFn: (on: boolean) => DeviceApi.setMusic(selectedBabyId!, on),
    onSuccess: (data) => setDeviceState({ musicOn: data.music_on, musicTrack: data.music_track }),
  });

  const feedMutation = useMutation({
    mutationFn: (trigger: boolean) => DeviceApi.triggerFeed(selectedBabyId!, trigger),
    onSuccess: (data) => setDeviceState({ feedingActive: data.feeding_active }),
  });

  const rows = [
    {
      icon: Waves,
      label: "Swing",
      active: device.swingOn,
      onToggle: () => swingMutation.mutate(!device.swingOn),
    },
    {
      icon: Music,
      label: "Music",
      active: device.musicOn,
      onToggle: () => musicMutation.mutate(!device.musicOn),
    },
    {
      icon: Utensils,
      label: "Feeding",
      active: device.feedingActive,
      onToggle: () => feedMutation.mutate(!device.feedingActive),
    },
  ];

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

          <Text
            style={{
              color: COLORS.textPrimary,
              fontFamily: "Manrope_700Bold",
              fontSize: 18,
              marginBottom: SPACING.lg,
            }}
          >
            Quick controls
          </Text>

          <View style={{ gap: SPACING.sm }}>
            {rows.map((row) => (
              <Pressable
                key={row.label}
                onPress={() => {
                  haptics.light();
                  row.onToggle();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 14,
                  paddingHorizontal: SPACING.lg,
                  borderRadius: RADIUS.md,
                  backgroundColor: row.active ? COLORS.primaryMuted : COLORS.surface,
                  borderWidth: 1,
                  borderColor: row.active ? COLORS.primary : COLORS.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
                  <row.icon color={row.active ? COLORS.primary : COLORS.textSecondary} size={20} />
                  <Text
                    style={{
                      color: row.active ? COLORS.primary : COLORS.textPrimary,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                    }}
                  >
                    {row.label}
                  </Text>
                </View>
                <Text
                  style={{
                    color: row.active ? COLORS.primary : COLORS.textTertiary,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  {row.active ? "On" : "Off"}
                </Text>
              </Pressable>
            ))}
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}
