import { Platform } from "react-native";

const iosDisplay = "Sora_700Bold";
const iosBody = "Manrope_500Medium";
const androidDisplay = "Sora_700Bold";
const androidBody = "Manrope_500Medium";
const webDisplay = "Sora_700Bold";
const webBody = "Manrope_500Medium";

export const colors = {
  /* ─── Background: deep noir → warm charcoal ─── */
  gradientTop: "#0c0c10",
  gradientMid: "#161620",
  gradientBottom: "#1e1e2c",

  /* ─── Surfaces ─── */
  surface: "rgba(255,255,255,0.96)",
  surfaceSoft: "#f6f6f9",
  surfaceElevated: "#ffffff",

  /* ─── Borders ─── */
  borderSoft: "rgba(0,0,0,0.05)",
  borderStrong: "rgba(0,0,0,0.09)",

  /* ─── Text ─── */
  textPrimary: "#111827",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  textLight: "rgba(255,255,255,0.65)",
  textWhite: "#ffffff",

  /* ─── Accent: Emerald ─── */
  accentBlue: "#10b981",
  accentBlueStrong: "#059669",
  accentCyan: "#06b6d4",
  accentGreen: "#10b981",
  accentOrange: "#f59e0b",
  accentCoral: "#ef4444",

  /* ─── Tab ─── */
  tabBg: "rgba(12,12,16,0.94)",
  tabActive: "rgba(16,185,129,0.12)",

  /* ─── Badges ─── */
  badgeInfoBg: "rgba(99,102,241,0.07)",
  badgeInfoText: "#6366f1",
  badgeWarnBg: "rgba(245,158,11,0.08)",
  badgeWarnText: "#d97706",
  badgeHotBg: "rgba(239,68,68,0.07)",
  badgeHotText: "#dc2626",
  badgeOkBg: "rgba(16,185,129,0.07)",
  badgeOkText: "#059669",

  shadow: "rgba(0,0,0,0.10)",
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 36,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  fontDisplay:
    Platform.OS === "ios" ? iosDisplay : Platform.OS === "android" ? androidDisplay : webDisplay,
  fontDisplayMedium:
    Platform.OS === "ios"
      ? "Sora_600SemiBold"
      : Platform.OS === "android"
        ? "Sora_600SemiBold"
        : "Sora_600SemiBold",
  fontBody:
    Platform.OS === "ios" ? iosBody : Platform.OS === "android" ? androidBody : webBody,
  fontBodyRegular:
    Platform.OS === "ios"
      ? "Manrope_400Regular"
      : Platform.OS === "android"
        ? "Manrope_400Regular"
        : "Manrope_400Regular",
  fontBodyStrong:
    Platform.OS === "ios"
      ? "Manrope_600SemiBold"
      : Platform.OS === "android"
        ? "Manrope_600SemiBold"
        : "Manrope_600SemiBold",
  titleXL: 28,
  titleLG: 22,
  titleMD: 17,
  bodyMD: 15,
  bodySM: 13,
  bodyXS: 11,
} as const;
