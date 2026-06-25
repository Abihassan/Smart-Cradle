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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, error, setUser, setLoading, setError } = useAuthStore();

  const handleRegister = async () => {
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.register(name.trim(), email.trim(), password);
      setUser(user);
    } catch (err: any) {
      const message =
        err?.response?.status === 409
          ? "An account with this email already exists."
          : err?.response?.data?.detail ?? "Couldn't create your account. Please try again.";
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
            Create account
          </GradientText>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              marginTop: SPACING.sm,
              textAlign: "center",
            }}
          >
            Set up NurseEye to start monitoring.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <FormField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
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
            placeholder="At least 8 characters"
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

          <NeonButton label="Create account" onPress={handleRegister} loading={loading} />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: SPACING.xl }}>
            <Text style={{ color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Text style={{ color: COLORS.primary, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                Sign in
              </Text>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
