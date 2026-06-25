import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { COLORS, GRADIENTS, SPACING } from "../../utils/constants";

interface SleepChartProps {
  sleepMinutesToday: number;
  size?: number;
}

const DAY_MINUTES = 24 * 60;

/**
 * Radial progress showing today's tracked sleep out of 24h.
 *
 * `sleepMinutesToday` is currently a Phase 3 placeholder (always 0) — the
 * decision/sensor pipeline doesn't yet derive sleep state from motion +
 * cry data. Once that lands, this component needs no changes.
 */
export function SleepChart({ sleepMinutesToday, size = 160 }: SleepChartProps) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(sleepMinutesToday / DAY_MINUTES, 1);
  const dashoffset = circumference * (1 - progress);

  const hours = Math.floor(sleepMinutesToday / 60);
  const minutes = sleepMinutesToday % 60;

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: SPACING.md }}>
        Sleep today
      </Text>

      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.surfaceAlt}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={GRADIENTS.calm[0]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        <View style={{ position: "absolute", alignItems: "center" }}>
          <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_800ExtraBold", fontSize: 28 }}>
            {hours}h {minutes}m
          </Text>
          <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
            of 24h tracked
          </Text>
        </View>
      </View>
    </View>
  );
}
