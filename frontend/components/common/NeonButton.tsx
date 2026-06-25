import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { GRADIENTS, RADIUS } from "../../utils/constants";
import { haptics } from "../../utils/haptics";

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "calm" | "danger";
  style?: ViewStyle;
}

const VARIANT_GRADIENTS = {
  primary: GRADIENTS.primary,
  calm: GRADIENTS.calm,
  danger: GRADIENTS.danger,
};

export function NeonButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: NeonButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 });
        }}
        onPress={() => {
          if (isDisabled) return;
          haptics.light();
          onPress();
        }}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={VARIANT_GRADIENTS[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: RADIUS.md,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            opacity: isDisabled ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontFamily: "Manrope_700Bold", fontSize: 16 }}>{label}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
