import { BlurView } from "expo-blur";
import { StyleSheet, View, ViewStyle } from "react-native";

import { COLORS, RADIUS } from "../../utils/constants";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 30 }: GlassCardProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(21,26,46,0.55)",
  },
  content: {
    padding: 16,
  },
});
