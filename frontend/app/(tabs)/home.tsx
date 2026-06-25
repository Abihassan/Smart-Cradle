import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Music, Utensils, Waves, Thermometer, Droplets } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { BabyApi, DeviceApi } from "../../api";
import { BabyStatusCard } from "../../components/cards/BabyStatusCard";
import { DeviceCard } from "../../components/cards/DeviceCard";
import { GlassCard } from "../../components/common/GlassCard";
import { Header } from "../../components/common/Header";
import { Skeleton } from "../../components/common/Skeleton";
import { useBabyStore } from "../../store/baby.store";
import { useDeviceStore } from "../../store/device.store";
import { COLORS, SPACING } from "../../utils/constants";
import { fmtHumidity, fmtTemperature } from "../../utils/format";

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const setSelectedBaby = useBabyStore((s) => s.setSelectedBaby);
  const sensors = useBabyStore((s) => s.sensors);
  const isCrying = useBabyStore((s) => s.isCrying);
  const lastCryEvent = useBabyStore((s) => s.lastCryEvent);
  const device = useDeviceStore();
  const setDeviceState = useDeviceStore((s) => s.setState);

  // Ensure a baby is selected (first one found) — Phase 2 adds a picker for multi-baby.
  const babiesQuery = useQuery({
    queryKey: ["babies"],
    queryFn: BabyApi.list,
  });

  useEffect(() => {
    if (!selectedBabyId && babiesQuery.data && babiesQuery.data.length > 0) {
      setSelectedBaby(babiesQuery.data[0].id);
    }
  }, [babiesQuery.data, selectedBabyId]);

  const statusQuery = useQuery({
    queryKey: ["baby-status", selectedBabyId],
    queryFn: () => BabyApi.status(selectedBabyId!),
    enabled: !!selectedBabyId,
    refetchInterval: 15000,
  });

  // Seed device store from initial status fetch so toggles work before any WS message arrives.
  useEffect(() => {
    if (statusQuery.data) {
      setDeviceState({
        swingOn: statusQuery.data.swing_on,
        musicOn: statusQuery.data.music_on,
        feedingActive: statusQuery.data.feeding_active,
      });
    }
  }, [statusQuery.data]);

  const swingMutation = useMutation({
    mutationFn: (on: boolean) => DeviceApi.setSwing(selectedBabyId!, on),
    onSuccess: (data) =>
      setDeviceState({ swingOn: data.swing_on, swingIntensity: data.swing_intensity }),
  });

  const musicMutation = useMutation({
    mutationFn: (on: boolean) => DeviceApi.setMusic(selectedBabyId!, on),
    onSuccess: (data) => setDeviceState({ musicOn: data.music_on, musicTrack: data.music_track }),
  });

  const feedMutation = useMutation({
    mutationFn: () => DeviceApi.triggerFeed(selectedBabyId!, true),
    onSuccess: (data) => setDeviceState({ feedingActive: data.feeding_active }),
  });

  const baby = statusQuery.data?.baby;
  const currentTemp = sensors.temperature ?? statusQuery.data?.latest_temperature ?? null;
  const currentHumidity = sensors.humidity ?? statusQuery.data?.latest_humidity ?? null;
  const currentMoisture = sensors.moisture ?? statusQuery.data?.latest_moisture ?? null;
  const currentlyCrying = isCrying || statusQuery.data?.is_crying || false;
  const cryReason = lastCryEvent?.reason ?? statusQuery.data?.cry_reason ?? null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={
        <RefreshControl
          refreshing={statusQuery.isRefetching}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ["baby-status", selectedBabyId] })}
          tintColor={COLORS.primary}
        />
      }
    >
      <Header title="NurseEye" subtitle="Live nursery overview" />

      <View style={{ paddingHorizontal: SPACING.xl, gap: SPACING.lg }}>
        {statusQuery.isLoading || !baby ? (
          <Skeleton height={200} radius={24} />
        ) : (
          <View>
            <Pressable onLongPress={() => router.push("/modals/device-control")} delayLongPress={350}>
              <BabyStatusCard
                babyName={baby.name}
                birthDate={baby.birth_date}
                isCrying={currentlyCrying}
                cryReason={cryReason}
              />
            </Pressable>
            <Text
              style={{
                color: COLORS.textTertiary,
                fontFamily: "Inter_400Regular",
                fontSize: 11,
                textAlign: "center",
                marginTop: SPACING.sm,
              }}
            >
              Hold to open quick controls
            </Text>
          </View>
        )}

        {/* Environment readouts */}
        <View style={{ flexDirection: "row", gap: SPACING.md }}>
          <GlassCard style={{ flex: 1, alignItems: "center" }}>
            <Thermometer color={COLORS.primary} size={20} />
            <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 20, marginTop: SPACING.sm }}>
              {fmtTemperature(currentTemp)}
            </Text>
            <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
              Temperature
            </Text>
          </GlassCard>

          <GlassCard style={{ flex: 1, alignItems: "center" }}>
            <Droplets color={COLORS.calm} size={20} />
            <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 20, marginTop: SPACING.sm }}>
              {fmtHumidity(currentHumidity)}
            </Text>
            <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
              Humidity
            </Text>
          </GlassCard>

          <GlassCard style={{ flex: 1, alignItems: "center" }}>
            <Droplets color={currentMoisture && currentMoisture > 50 ? COLORS.warning : COLORS.textSecondary} size={20} />
            <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 20, marginTop: SPACING.sm }}>
              {currentMoisture != null ? `${Math.round(currentMoisture)}%` : "--%"}
            </Text>
            <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
              Moisture
            </Text>
          </GlassCard>
        </View>

        {/* Quick actions */}
        <View>
          <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: SPACING.sm }}>
            Quick actions
          </Text>
          <View style={{ flexDirection: "row", gap: SPACING.md }}>
            <DeviceCard
              icon={Waves}
              label="Swing"
              active={device.swingOn}
              onToggle={() => swingMutation.mutate(!device.swingOn)}
            />
            <DeviceCard
              icon={Music}
              label="Music"
              active={device.musicOn}
              onToggle={() => musicMutation.mutate(!device.musicOn)}
            />
            <DeviceCard
              icon={Utensils}
              label="Feed"
              active={device.feedingActive}
              onToggle={() => {
                if (!device.feedingActive) {
                  router.push("/modals/feeding-confirm");
                } else {
                  feedMutation.mutate();
                }
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
