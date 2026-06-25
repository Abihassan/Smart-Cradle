import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Power, Utensils, Waves } from "lucide-react-native";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";

import { DeviceApi } from "../../api";
import { GlassCard } from "../../components/common/GlassCard";
import { Header } from "../../components/common/Header";
import { MusicPlaylist } from "../../components/control/MusicPlaylist";
import { SwingSlider } from "../../components/control/SwingSlider";
import { useBabyStore } from "../../store/baby.store";
import { useDeviceStore } from "../../store/device.store";
import { COLORS, RADIUS, SPACING } from "../../utils/constants";
import { haptics } from "../../utils/haptics";

export default function ControlScreen() {
  const router = useRouter();
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const queryClient = useQueryClient();
  const device = useDeviceStore();
  const setDeviceState = useDeviceStore((s) => s.setState);

  // Fetch full device state (includes auto_mode, not present in BabyStatus).
  useQuery({
    queryKey: ["device-state", selectedBabyId],
    queryFn: async () => {
      const data = await DeviceApi.getState(selectedBabyId!);
      setDeviceState({
        swingOn: data.swing_on,
        swingIntensity: data.swing_intensity,
        musicOn: data.music_on,
        musicTrack: data.music_track,
        feedingActive: data.feeding_active,
        autoMode: data.auto_mode,
      });
      return data;
    },
    enabled: !!selectedBabyId,
  });

  const swingMutation = useMutation({
    mutationFn: ({ on, intensity }: { on: boolean; intensity?: number }) =>
      DeviceApi.setSwing(selectedBabyId!, on, intensity),
    onSuccess: (data) =>
      setDeviceState({ swingOn: data.swing_on, swingIntensity: data.swing_intensity }),
  });

  const musicMutation = useMutation({
    mutationFn: ({ on, track }: { on: boolean; track?: string }) =>
      DeviceApi.setMusic(selectedBabyId!, on, track),
    onSuccess: (data) => setDeviceState({ musicOn: data.music_on, musicTrack: data.music_track }),
  });

  const feedMutation = useMutation({
    mutationFn: (trigger: boolean) => DeviceApi.triggerFeed(selectedBabyId!, trigger),
    onSuccess: (data) => setDeviceState({ feedingActive: data.feeding_active }),
  });

  const autoModeMutation = useMutation({
    mutationFn: (autoMode: boolean) => DeviceApi.setAutoMode(selectedBabyId!, autoMode),
    onSuccess: (data) => setDeviceState({ autoMode: data.auto_mode }),
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingBottom: 120 }}>
      <Header title="Control" subtitle="Swing, sound & feeding" />

      <View style={{ paddingHorizontal: SPACING.xl, gap: SPACING.lg }}>
        {/* Manual override */}
        <GlassCard style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.sm,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: device.autoMode ? COLORS.calmMuted : COLORS.warningMuted,
              }}
            >
              <Power color={device.autoMode ? COLORS.calm : COLORS.warning} size={20} />
            </View>
            <View>
              <Text style={{ color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                {device.autoMode ? "Auto mode" : "Manual override"}
              </Text>
              <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
                {device.autoMode
                  ? "AI responds to cries automatically"
                  : "You're in control — AI won't act"}
              </Text>
            </View>
          </View>
          <Switch
            value={device.autoMode}
            onValueChange={(v) => {
              haptics.selection();
              autoModeMutation.mutate(v);
            }}
            trackColor={{ false: COLORS.surfaceAlt, true: COLORS.primaryMuted }}
            thumbColor={device.autoMode ? COLORS.primary : COLORS.textTertiary}
          />
        </GlassCard>

        {/* Swing control */}
        <GlassCard style={{ alignItems: "center" }}>
          <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.lg }}>
            <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 16 }}>
              Swing
            </Text>
            <Pressable
              onPress={() => {
                haptics.light();
                swingMutation.mutate({ on: !device.swingOn });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: 4,
                  borderRadius: RADIUS.full,
                  backgroundColor: device.swingOn ? COLORS.primaryMuted : COLORS.surfaceAlt,
                }}
              >
                <Waves color={device.swingOn ? COLORS.primary : COLORS.textTertiary} size={14} />
                <Text
                  style={{
                    color: device.swingOn ? COLORS.primary : COLORS.textTertiary,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                  }}
                >
                  {device.swingOn ? "On" : "Off"}
                </Text>
              </View>
            </Pressable>
          </View>

          <SwingSlider
            value={device.swingIntensity}
            active={device.swingOn}
            onChange={(intensity) => swingMutation.mutate({ on: true, intensity })}
          />
        </GlassCard>

        {/* Music playlist */}
        <View>
          <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: SPACING.sm }}>
            Sound
          </Text>
          <MusicPlaylist
            musicOn={device.musicOn}
            currentTrack={device.musicTrack}
            onSelect={(trackId) => musicMutation.mutate({ on: true, track: trackId })}
            onToggle={() => musicMutation.mutate({ on: !device.musicOn })}
          />
        </View>

        {/* Feeding */}
        <Pressable
          onPress={() => {
            if (device.feedingActive) {
              feedMutation.mutate(false);
            } else {
              router.push("/modals/feeding-confirm");
            }
          }}
        >
          <GlassCard
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderColor: device.feedingActive ? COLORS.primary : COLORS.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: RADIUS.sm,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: device.feedingActive ? COLORS.primaryMuted : COLORS.surfaceAlt,
                }}
              >
                <Utensils color={device.feedingActive ? COLORS.primary : COLORS.textSecondary} size={20} />
              </View>
              <Text style={{ color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                {device.feedingActive ? "Feeding in progress" : "Start feeding sequence"}
              </Text>
            </View>
            <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 }}>
              {device.feedingActive ? "Tap to stop" : "Tap to start"}
            </Text>
          </GlassCard>
        </Pressable>
      </View>
    </ScrollView>
  );
}
