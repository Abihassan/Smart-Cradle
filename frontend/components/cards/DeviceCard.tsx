import { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { GlassCard } from "../common/GlassCard";
import { COLORS, RADIUS, SPACING } from "../../utils/constants";
import { haptics } from "../../utils/haptics";

interface DeviceCardProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onToggle: () => void;
}

export function DeviceCard({ icon: Icon, label, active, onToggle }: DeviceCardProps) {
  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onToggle();
      }}
      style={{ flex: 1 }}
    >
      <GlassCard
        style={{
          alignItems: "center",
          paddingVertical: SPACING.lg,
          borderColor: active ? COLORS.primary : COLORS.border,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: RADIUS.md,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: active ? COLORS.primaryMuted : COLORS.surfaceAlt,
            marginBottom: SPACING.sm,
          }}
        >
          <Icon color={active ? COLORS.primary : COLORS.textSecondary} size={22} />
        </View>
        <Text style={{ color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
          {label}
        </Text>
        <Text
          style={{
            color: active ? COLORS.primary : COLORS.textTertiary,
            fontFamily: "Inter_400Regular",
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {active ? "On" : "Off"}
        </Text>
      </GlassCard>
    </Pressable>
  );
}
