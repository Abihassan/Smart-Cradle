import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { AuthService } from "../../auth/auth.service";
import { FormField } from "../../components/common/FormField";
import { GradientText } from "../../components/common/GradientText";
import { NeonButton } from "../../components/common/NeonButton";
import { useAuthStore } from "../../store/auth.store";
import { COLORS, SPACING } from "../../utils/constants";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, error, setUser, setLoading, setError } = useAuthStore();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await AuthService.login(email.trim(), password);
      setUser(user);
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? "Couldn't sign in. Check your details and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: SPACING.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(500)} style={{ marginBottom: SPACING.xxl, alignItems: "center" }}>
          <GradientText style={{ fontFamily: "Manrope_800ExtraBold", fontSize: 36 }}>
            NurseEye
          </GradientText>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              marginTop: SPACING.sm,
            }}
          >
            Watching over nap time, so you don't have to.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          {error && (
            <Text
              style={{
                color: COLORS.danger,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                marginBottom: SPACING.md,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          )}

          <NeonButton label="Sign in" onPress={handleLogin} loading={loading} />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: SPACING.xl }}>
            <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
              New here?{" "}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Text style={{ color: COLORS.primary, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                Create an account
              </Text>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
