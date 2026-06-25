import { useQuery } from "@tanstack/react-query";
import { Volume2, VolumeX } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { BabyApi } from "../../api";
import { AudioMeter } from "../../components/live/AudioMeter";
import { CameraFeed } from "../../components/live/CameraFeed";
import { GlassCard } from "../../components/common/GlassCard";
import { Header } from "../../components/common/Header";
import { useBabyStore } from "../../store/baby.store";
import { CRY_REASON_LABELS, COLORS, SPACING } from "../../utils/constants";
import { fmtHumidity, fmtTemperature } from "../../utils/format";

export default function LiveScreen() {
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const sensors = useBabyStore((s) => s.sensors);
  const isCrying = useBabyStore((s) => s.isCrying);
  const lastCryEvent = useBabyStore((s) => s.lastCryEvent);
  const [audioOn, setAudioOn] = useState(true);

  const statusQuery = useQuery({
    queryKey: ["baby-status", selectedBabyId],
    queryFn: () => BabyApi.status(selectedBabyId!),
    enabled: !!selectedBabyId,
    refetchInterval: 15000,
  });

  const temp = sensors.temperature ?? statusQuery.data?.latest_temperature ?? null;
  const humidity = sensors.humidity ?? statusQuery.data?.latest_humidity ?? null;
  const cryReason = lastCryEvent?.reason ?? statusQuery.data?.cry_reason ?? null;
  const currentlyCrying = isCrying || statusQuery.data?.is_crying || false;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingBottom: 120 }}>
      <Header title="Live" subtitle="Real-time room view" />

      <View style={{ paddingHorizontal: SPACING.xl, gap: SPACING.lg }}>
        <CameraFeed streamUrl={null} nightVision />

        {/* Status overlay info */}
        <GlassCard>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                Temperature
              </Text>
              <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 18, marginTop: 4 }}>
                {fmtTemperature(temp)}
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: COLORS.border }} />
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                Humidity
              </Text>
              <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 18, marginTop: 4 }}>
                {fmtHumidity(humidity)}
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: COLORS.border }} />
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                Status
              </Text>
              <Text
                style={{
                  color: currentlyCrying ? COLORS.danger : COLORS.calm,
                  fontFamily: "Manrope_700Bold",
                  fontSize: 18,
                  marginTop: 4,
                }}
              >
                {currentlyCrying ? CRY_REASON_LABELS[cryReason ?? "unknown"] : "Calm"}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Audio stream */}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: SPACING.sm,
            }}
          >
            <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
              Audio stream
            </Text>
            <Pressable onPress={() => setAudioOn((v) => !v)}>
              {audioOn ? (
                <Volume2 color={COLORS.primary} size={20} />
              ) : (
                <VolumeX color={COLORS.textTertiary} size={20} />
              )}
            </Pressable>
          </View>
          <AudioMeter active={audioOn} />
        </View>
      </View>
    </ScrollView>
  );
}
