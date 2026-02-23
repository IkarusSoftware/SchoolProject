import { StyleSheet, Text, View } from "react-native";
import type { BadgeTone } from "../../types/parent";
import { colors, radius, spacing, typography } from "../../theme";

interface InfoRowProps {
  title: string;
  detail: string;
  badgeText?: string;
  badgeTone?: BadgeTone;
}

const badgeStyles: Record<BadgeTone, { bg: string; text: string }> = {
  info: { bg: colors.badgeInfoBg, text: colors.badgeInfoText },
  warn: { bg: colors.badgeWarnBg, text: colors.badgeWarnText },
  hot: { bg: colors.badgeHotBg, text: colors.badgeHotText },
  ok: { bg: colors.badgeOkBg, text: colors.badgeOkText },
};

export function InfoRow({
  title,
  detail,
  badgeText,
  badgeTone = "info",
}: InfoRowProps) {
  const tone = badgeStyles[badgeTone];

  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      {badgeText ? (
        <Text style={[styles.badge, { color: tone.text, backgroundColor: tone.bg }]}>
          {badgeText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontDisplay,
  },
  detail: {
    color: colors.textSecondary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
    marginTop: 2,
  },
  badge: {
    borderRadius: radius.pill,
    overflow: "hidden",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontDisplay,
  },
});

