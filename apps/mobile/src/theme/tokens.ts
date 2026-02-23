import { Platform } from "react-native";

const iosDisplay = "AvenirNext-Bold";
const iosBody = "AvenirNext-Regular";
const androidDisplay = "sans-serif-condensed";
const androidBody = "sans-serif";

export const colors = {
  gradientTop: "#051f2d",
  gradientMid: "#0e3b57",
  gradientBottom: "#1a6186",
  surface: "rgba(255,255,255,0.96)",
  surfaceSoft: "#f2f8fd",
  borderSoft: "#dbe9f4",
  textPrimary: "#0c2f44",
  textSecondary: "#537186",
  textLight: "#d7ecff",
  textWhite: "#ffffff",
  accentBlue: "#1677b3",
  accentGreen: "#1a8f5b",
  accentOrange: "#ca7a0f",
  tabBg: "rgba(6,26,38,0.93)",
  tabActive: "#145676",
  badgeInfoBg: "#d8eeff",
  badgeInfoText: "#0f4f73",
  badgeWarnBg: "#ffe9cc",
  badgeWarnText: "#8c4e00",
  badgeHotBg: "#ffe0e0",
  badgeHotText: "#8b1d1d",
  badgeOkBg: "#dbf7e9",
  badgeOkText: "#0d6e43",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export const typography = {
  fontDisplay:
    Platform.OS === "ios"
      ? iosDisplay
      : Platform.OS === "android"
        ? androidDisplay
        : undefined,
  fontBody:
    Platform.OS === "ios"
      ? iosBody
      : Platform.OS === "android"
        ? androidBody
        : undefined,
  titleXL: 30,
  titleLG: 20,
  titleMD: 17,
  bodyMD: 14,
  bodySM: 12,
  bodyXS: 11,
} as const;

