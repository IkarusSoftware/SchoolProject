import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

interface KpiTileProps {
  value: string;
  label: string;
  tone: "blue" | "green" | "orange";
}

const cfg: Record<KpiTileProps["tone"], { bg: string; dot: string; lbl: string }> = {
  blue:   { bg: "rgba(99,102,241,0.04)",  dot: "#6366f1", lbl: "#4f46e5" },
  green:  { bg: "rgba(16,185,129,0.04)",   dot: "#10b981", lbl: "#059669" },
  orange: { bg: "rgba(245,158,11,0.04)",   dot: "#f59e0b", lbl: "#d97706" },
};

export function KpiTile({ value, label, tone }: KpiTileProps) {
  const c = cfg[tone];
  return (
    <View style={[styles.tile, { backgroundColor: c.bg }]}>
      <View style={styles.top}>
        <Text style={[styles.label, { color: c.lbl }]}>{label}</Text>
        <View style={[styles.dot, { backgroundColor: c.dot }]} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.borderSoft,
    paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.sm + 4,
    minHeight: 82, justifyContent: "space-between",
  },
  top: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", gap: spacing.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3, opacity: 0.55 },
  value: {
    color: colors.textPrimary,
    fontSize: typography.titleXL,
    fontFamily: typography.fontDisplay,
    lineHeight: 32, letterSpacing: -0.5,
  },
  label: {
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyStrong,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
