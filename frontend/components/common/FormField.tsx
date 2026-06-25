import { Text, TextInput, TextInputProps, View } from "react-native";

import { COLORS, RADIUS, SPACING } from "../../utils/constants";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, style, ...inputProps }: FormFieldProps) {
  return (
    <View style={{ marginBottom: SPACING.lg }}>
      <Text
        style={{
          color: COLORS.textSecondary,
          fontFamily: "Inter_500Medium",
          fontSize: 13,
          marginBottom: SPACING.xs,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={COLORS.textTertiary}
        style={[
          {
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: error ? COLORS.danger : COLORS.border,
            paddingHorizontal: SPACING.lg,
            paddingVertical: 14,
            color: COLORS.textPrimary,
            fontFamily: "Inter_400Regular",
            fontSize: 15,
          },
          style,
        ]}
        {...inputProps}
      />
      {error && (
        <Text style={{ color: COLORS.danger, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
