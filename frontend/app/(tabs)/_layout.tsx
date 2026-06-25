import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Bell, Home, Sliders, TrendingUp, Video } from "lucide-react-native";
import { Platform, StyleSheet, View } from "react-native";

import { useLiveSocket } from "../../api/useLiveSocket";
import { useBabyStore } from "../../store/baby.store";
import { COLORS } from "../../utils/constants";

export default function TabsLayout() {
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);

  // Single live connection shared across all tabs.
  useLiveSocket(selectedBabyId);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.tabBarTint} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: "Live",
          tabBarIcon: ({ color, size }) => <Video color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="control"
        options={{
          title: "Control",
          tabBarIcon: ({ color, size }) => <Sliders color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === "ios" ? 88 : 68,
    backgroundColor: "transparent",
  },
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11,14,26,0.7)",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
