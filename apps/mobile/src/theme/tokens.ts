import { Platform } from "react-native";

const iosDisplay = "Sora_700Bold";
const iosBody = "Manrope_500Medium";
const androidDisplay = "Sora_700Bold";
const androidBody = "Manrope_500Medium";
const webDisplay = "Sora_700Bold";
const webBody = "Manrope_500Medium";

export const colors = {
  gradientTop: "#051422",
  gradientMid: "#0a2a44",
  gradientBottom: "#16608a",
  surface: "rgba(255, 255, 255, 0.95)",
  surfaceSoft: "#edf4fb",
  surfaceElevated: "#ffffff",
  borderSoft: "#c9d9e8",
  borderStrong: "#aec6db",
  textPrimary: "#0b2337",
  textSecondary: "#3f5f77",
  textMuted: "#638098",
  textLight: "#d8ebfb",
  textWhite: "#ffffff",
  accentBlue: "#1479b8",
  accentBlueStrong: "#0c5f92",
  accentCyan: "#149ab5",
  accentGreen: "#1c9268",
  accentOrange: "#b77922",
  accentCoral: "#b74848",
  tabBg: "rgba(5, 18, 30, 0.92)",
  tabActive: "rgba(26, 132, 198, 0.2)",
  badgeInfoBg: "#dbf0ff",
  badgeInfoText: "#14597f",
  badgeWarnBg: "#ffebcd",
  badgeWarnText: "#8f5706",
  badgeHotBg: "#ffe1e1",
  badgeHotText: "#8e2626",
  badgeOkBg: "#dff6eb",
  badgeOkText: "#146d47",
  shadow: "#021423",
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  fontDisplay:
    Platform.OS === "ios"
      ? iosDisplay
      : Platform.OS === "android"
        ? androidDisplay
        : webDisplay,
  fontDisplayMedium:
    Platform.OS === "ios"
      ? "Sora_600SemiBold"
      : Platform.OS === "android"
        ? "Sora_600SemiBold"
        : "Sora_600SemiBold",
  fontBody:
    Platform.OS === "ios"
      ? iosBody
      : Platform.OS === "android"
        ? androidBody
        : webBody,
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
  titleXL: 32,
  titleLG: 23,
  titleMD: 18,
  bodyMD: 15,
  bodySM: 13,
  bodyXS: 11,
} as const;
