import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

interface KpiTileProps {
  value: string;
  label: string;
  tone: "blue" | "green" | "orange";
}

const toneMap: Record<KpiTileProps["tone"], [string, string]> = {
  blue: ["#dff2ff", "#f6fbff"],
  green: ["#def7ec", "#f8fcfa"],
  orange: ["#ffedd7", "#fffaf4"],
} as const;

export function KpiTile({ value, label, tone }: KpiTileProps) {
  return (
    <LinearGradient
      colors={toneMap[tone]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.tile}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.dot} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#d2e2ee",
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 4,
    minHeight: 86,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.accentBlue,
    opacity: 0.6,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.titleXL,
    fontFamily: typography.fontDisplayMedium,
    lineHeight: 34,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
    lineHeight: 16,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
