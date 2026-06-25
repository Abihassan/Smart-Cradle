export const COLORS = {
  bg: "#0B0E1A",
  surface: "#151A2E",
  surfaceAlt: "#1C2238",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",

  textPrimary: "#F4F5FA",
  textSecondary: "#8E96B8",
  textTertiary: "#5A6182",

  primary: "#6E7BFF",
  primaryMuted: "rgba(110,123,255,0.16)",
  accent: "#9B6BFF",
  accentMuted: "rgba(155,107,255,0.16)",

  calm: "#4ECDC4",
  calmMuted: "rgba(78,205,196,0.16)",

  warning: "#FFB84E",
  warningMuted: "rgba(255,184,78,0.16)",

  danger: "#FF6B8B",
  dangerMuted: "rgba(255,107,139,0.16)",
};

export const GRADIENTS = {
  primary: ["#6E7BFF", "#9B6BFF"] as const,
  calm: ["#4ECDC4", "#6E7BFF"] as const,
  danger: ["#FF6B8B", "#9B6BFF"] as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 24,
  full: 999,
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ?? "ws://localhost:8000";

export const CRY_REASON_LABELS: Record<string, string> = {
  hunger: "Hungry",
  tired: "Tired",
  pain: "In pain",
  discomfort: "Uncomfortable",
  unknown: "Unknown",
};
