import { AlertTriangle, Baby as BabyIcon, Droplet, Utensils } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { GlassCard } from "../common/GlassCard";
import { COLORS, CRY_REASON_LABELS, RADIUS, SPACING } from "../../utils/constants";
import { fmtRelativeTime } from "../../utils/format";
import { AlertType } from "../../api";

interface AlertCardProps {
  type: AlertType;
  reason: string | null;
  confidence: number | null;
  timestamp: string;
  read: boolean;
  onPress?: () => void;
}

const ICONS: Record<AlertType, typeof BabyIcon> = {
  cry: BabyIcon,
  urination: Droplet,
  feeding: Utensils,
  emergency: AlertTriangle,
};

const TITLES: Record<AlertType, string> = {
  cry: "Cry detected",
  urination: "Wetness detected",
  feeding: "Feeding event",
  emergency: "Emergency alert",
};

export function AlertCard({ type, reason, confidence, timestamp, read, onPress }: AlertCardProps) {
  const Icon = ICONS[type];
  const isUrgent = type === "emergency";

  return (
    <Pressable onPress={onPress}>
      <GlassCard
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: SPACING.md,
          opacity: read ? 0.6 : 1,
          borderColor: isUrgent ? COLORS.danger : COLORS.border,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: RADIUS.sm,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isUrgent ? COLORS.dangerMuted : COLORS.accentMuted,
            marginRight: SPACING.md,
          }}
        >
          <Icon color={isUrgent ? COLORS.danger : COLORS.accent} size={20} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
            {TITLES[type]}
            {reason ? ` · ${CRY_REASON_LABELS[reason] ?? reason}` : ""}
          </Text>
          <Text style={{ color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
            {fmtRelativeTime(timestamp)}
            {confidence != null ? ` · ${Math.round(confidence * 100)}% confidence` : ""}
          </Text>
        </View>

        {!read && (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary }} />
        )}
      </GlassCard>
    </Pressable>
  );
}
