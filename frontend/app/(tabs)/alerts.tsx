import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Alert, AlertApi, AlertType } from "../../api";
import { AlertCard } from "../../components/cards/AlertCard";
import { Header } from "../../components/common/Header";
import { Skeleton } from "../../components/common/Skeleton";
import { useBabyStore } from "../../store/baby.store";
import { COLORS, RADIUS, SPACING } from "../../utils/constants";

const FILTERS: { label: string; value: AlertType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Cry", value: "cry" },
  { label: "Wetness", value: "urination" },
  { label: "Feeding", value: "feeding" },
  { label: "Emergency", value: "emergency" },
];

export default function AlertsScreen() {
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [filter, setFilter] = useState<AlertType | "all">("all");

  const alertsQuery = useQuery({
    queryKey: ["alerts", selectedBabyId, filter],
    queryFn: () =>
      AlertApi.list(selectedBabyId!, { type: filter === "all" ? undefined : filter, limit: 50 }),
    enabled: !!selectedBabyId,
    refetchInterval: 20000,
  });

  const markReadMutation = useMutation({
    mutationFn: (alertIds: string[]) => AlertApi.markRead(selectedBabyId!, alertIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts", selectedBabyId] }),
  });

  const unreadIds = alertsQuery.data?.filter((a: Alert) => !a.read).map((a: Alert) => a.id) ?? [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingBottom: 120 }}>
      <Header
        title="Alerts"
        subtitle="History & notifications"
        right={
          unreadIds.length > 0 ? (
            <Pressable onPress={() => markReadMutation.mutate(unreadIds)}>
              <Text style={{ color: COLORS.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                Mark all read
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.xl, gap: SPACING.sm, paddingBottom: SPACING.lg }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={{
                paddingHorizontal: SPACING.lg,
                paddingVertical: 8,
                borderRadius: RADIUS.full,
                backgroundColor: active ? COLORS.primaryMuted : COLORS.surface,
                borderWidth: 1,
                borderColor: active ? COLORS.primary : COLORS.border,
              }}
            >
              <Text
                style={{
                  color: active ? COLORS.primary : COLORS.textSecondary,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: SPACING.xl, gap: SPACING.md }}>
        {alertsQuery.isLoading ? (
          <>
            <Skeleton height={64} radius={24} />
            <Skeleton height={64} radius={24} />
            <Skeleton height={64} radius={24} />
          </>
        ) : alertsQuery.data && alertsQuery.data.length > 0 ? (
          alertsQuery.data.map((alert: Alert) => (
            <AlertCard
              key={alert.id}
              type={alert.type}
              reason={alert.reason}
              confidence={alert.confidence}
              timestamp={alert.timestamp}
              read={alert.read}
              onPress={() => {
                if (alert.type === "cry") {
                  router.push({
                    pathname: "/modals/cry-details",
                    params: {
                      reason: alert.reason ?? "",
                      confidence: String(alert.confidence ?? ""),
                      timestamp: alert.timestamp,
                    },
                  });
                }
                if (!alert.read) markReadMutation.mutate([alert.id]);
              }}
            />
          ))
        ) : (
          <View style={{ alignItems: "center", marginTop: SPACING.xxl }}>
            <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
              No alerts yet — all quiet 🌙
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
