import { useQuery } from "@tanstack/react-query";
import { ScrollView, Text, View } from "react-native";

import { BabyApi } from "../../api";
import { CryTimeline } from "../../components/charts/CryTimeline";
import { SleepChart } from "../../components/charts/SleepChart";
import { TempGraph } from "../../components/charts/TempGraph";
import { GlassCard } from "../../components/common/GlassCard";
import { Header } from "../../components/common/Header";
import { Skeleton } from "../../components/common/Skeleton";
import { useBabyStore } from "../../store/baby.store";
import { COLORS, SPACING } from "../../utils/constants";

export default function ReportsScreen() {
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);

  const reportsQuery = useQuery({
    queryKey: ["reports", selectedBabyId],
    queryFn: () => BabyApi.reports(selectedBabyId!),
    enabled: !!selectedBabyId,
    refetchInterval: 60000,
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingBottom: 120 }}>
      <Header title="Reports" subtitle="Last 24 hours" />

      <View style={{ paddingHorizontal: SPACING.xl, gap: SPACING.lg }}>
        {reportsQuery.isLoading || !reportsQuery.data ? (
          <>
            <Skeleton height={220} radius={24} />
            <Skeleton height={160} radius={24} />
            <Skeleton height={160} radius={24} />
          </>
        ) : (
          <>
            <GlassCard>
              <SleepChart sleepMinutesToday={reportsQuery.data.sleep_minutes_today} />
            </GlassCard>

            <GlassCard>
              <CryTimeline events={reportsQuery.data.cry_events} />
            </GlassCard>

            <GlassCard>
              <TempGraph
                title="Temperature"
                series={reportsQuery.data.temperature_series}
                color={COLORS.primary}
                unit="°C"
              />
            </GlassCard>

            <GlassCard>
              <TempGraph
                title="Humidity"
                series={reportsQuery.data.humidity_series}
                color={COLORS.calm}
                unit="%"
              />
            </GlassCard>

            {reportsQuery.data.temperature_series.length === 0 &&
              reportsQuery.data.cry_events.length === 0 && (
                <Text
                  style={{
                    color: COLORS.textTertiary,
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    textAlign: "center",
                    marginTop: SPACING.md,
                  }}
                >
                  No data yet — reports populate as sensors and the AI engine come online.
                </Text>
              )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
