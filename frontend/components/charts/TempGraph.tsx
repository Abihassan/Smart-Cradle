import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { COLORS, SPACING } from "../../utils/constants";
import { SensorReading } from "../../api";

interface TempGraphProps {
  title: string;
  series: SensorReading[];
  color: string;
  unit: string;
  height?: number;
}

/**
 * Renders a smooth area chart from a sensor reading series.
 * Path is derived at render time via useMemo — not in a useEffect that
 * sets state — to avoid double renders on the Reports screen.
 */
export function TempGraph({ title, series, color, unit, height = 140 }: TempGraphProps) {
  const width = 320;

  const { linePath, areaPath, latest, min, max } = useMemo(() => {
    if (series.length < 2) {
      return { linePath: "", areaPath: "", latest: null as number | null, min: 0, max: 0 };
    }

    const values = series.map((s) => s.value);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const range = maxV - minV || 1;

    const stepX = width / (series.length - 1);

    const points = series.map((point, i) => {
      const x = i * stepX;
      const y = height - ((point.value - minV) / range) * (height - 16) - 8;
      return [x, y];
    });

    const line = points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(" ");

    const area = `${line} L ${width} ${height} L 0 ${height} Z`;

    return { linePath: line, areaPath: area, latest: values[values.length - 1], min: minV, max: maxV };
  }, [series, height]);

  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.sm }}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
          {title}
        </Text>
        {latest != null && (
          <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_700Bold", fontSize: 14 }}>
            {latest.toFixed(1)}
            {unit}
          </Text>
        )}
      </View>

      {series.length < 2 ? (
        <View style={{ height, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 }}>
            Not enough data yet
          </Text>
        </View>
      ) : (
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.3} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill={`url(#grad-${title})`} stroke="none" />
          <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        </Svg>
      )}

      {series.length >= 2 && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11 }}>
            Min {min.toFixed(1)}
            {unit}
          </Text>
          <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11 }}>
            Max {max.toFixed(1)}
            {unit}
          </Text>
        </View>
      )}
    </View>
  );
}
