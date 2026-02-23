import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  children: ReactNode;
}

export function SectionCard({
  title,
  subtitle,
  rightLabel,
  children,
}: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: "#072336",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.titleMD,
    fontFamily: typography.fontDisplay,
  },
  subtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
  },
  rightLabel: {
    color: colors.accentGreen,
    fontSize: typography.bodySM,
    fontFamily: typography.fontDisplay,
  },
  body: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
});

