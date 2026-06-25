import { Text, View } from "react-native";

import { COLORS, SPACING } from "../../utils/constants";

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function Header({ title, subtitle, right }: HeaderProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
      }}
    >
      <View>
        <Text style={{ color: COLORS.textPrimary, fontFamily: "Manrope_800ExtraBold", fontSize: 28 }}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              color: COLORS.textSecondary,
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}
