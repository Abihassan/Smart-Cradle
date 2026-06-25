import { useMemo } from "react";
import { Text, View } from "react-native";

import { Alert } from "../../api";
import { COLORS, CRY_REASON_LABELS, SPACING } from "../../utils/constants";

const REASON_COLORS: Record<string, string> = {
  hunger: COLORS.warning,
  tired: COLORS.primary,
  pain: COLORS.danger,
  discomfort: COLORS.accent,
  unknown: COLORS.textTertiary,
};

interface CryTimelineProps {
  events: Alert[];
  hoursSpan?: number;
}

/**
 * Plots cry events as dots along a 24h horizontal track, positioned by
 * time-of-day. Tapping isn't wired here — purely a visual summary; full
 * detail is available via the Alerts tab.
 */
export function CryTimeline({ events, hoursSpan = 24 }: CryTimelineProps) {
  const points = useMemo(() => {
    const now = Date.now();
    const spanMs = hoursSpan * 60 * 60 * 1000;
    const start = now - spanMs;

    return events
      .map((e) => {
        const t = new Date(e.timestamp).getTime();
        const pct = Math.min(Math.max((t - start) / spanMs, 0), 1);
        return { ...e, pct };
      })
      .filter((e) => e.pct >= 0 && e.pct <= 1);
  }, [events, hoursSpan]);

  return (
    <View>
      <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: SPACING.md }}>
        Cry pattern (last {hoursSpan}h)
      </Text>

      <View
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS.surfaceAlt,
          position: "relative",
          marginHorizontal: 6,
        }}
      >
        {points.map((p, i) => (
          <View
            key={`${p.id}-${i}`}
            style={{
              position: "absolute",
              left: `${p.pct * 100}%`,
              top: -4,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: REASON_COLORS[p.reason ?? "unknown"] ?? COLORS.textTertiary,
              borderWidth: 2,
              borderColor: COLORS.bg,
              transform: [{ translateX: -6 }],
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.sm }}>
        <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11 }}>
          {hoursSpan}h ago
        </Text>
        <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11 }}>Now</Text>
      </View>

      {points.length === 0 ? (
        <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: SPACING.md }}>
          No cries recorded — great night! 🎉
        </Text>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginTop: SPACING.lg }}>
          {Object.entries(REASON_COLORS).map(([reason, color]) => (
            <View key={reason} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
              <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11 }}>
                {CRY_REASON_LABELS[reason] ?? reason}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
