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
      <View style={[styles.indicator, { backgroundColor: tone.text }]} />
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
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#d2e1ec",
    backgroundColor: "#f8fcff",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  indicator: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: radius.pill,
    opacity: 0.9,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontBodyStrong,
  },
  detail: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
    marginTop: 4,
    lineHeight: 17,
  },
  badge: {
    borderRadius: radius.pill,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyStrong,
  },
});
