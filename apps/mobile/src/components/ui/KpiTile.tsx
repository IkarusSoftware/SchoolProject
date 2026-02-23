import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

interface KpiTileProps {
  value: string;
  label: string;
  tone: "blue" | "green" | "orange";
}

const toneMap = {
  blue: "#e2f2ff",
  green: "#ddf9ef",
  orange: "#ffeedb",
} as const;

export function KpiTile({ value, label, tone }: KpiTileProps) {
  return (
    <View style={[styles.tile, { backgroundColor: toneMap[tone] }]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.titleLG,
    fontFamily: typography.fontDisplay,
  },
  label: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
  },
});

