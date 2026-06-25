import { View, ActivityIndicator } from "react-native";

import { COLORS } from "../utils/constants";

/**
 * Renders briefly while AuthGuard hydrates and performs its redirect.
 * No redirect logic lives here — that's AuthGuard's job exclusively.
 */
export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );
}
