import { StyleSheet, Text, View } from "react-native";
import type { BadgeTone } from "../../types/parent";
import { colors, radius, spacing, typography } from "../../theme";

interface InfoRowProps {
  title: string;
  detail: string;
  badgeText?: string;
  badgeTone?: BadgeTone;
}

const tones: Record<BadgeTone, { bg: string; fg: string }> = {
  info: { bg: colors.badgeInfoBg, fg: colors.badgeInfoText },
  warn: { bg: colors.badgeWarnBg, fg: colors.badgeWarnText },
  hot:  { bg: colors.badgeHotBg,  fg: colors.badgeHotText },
  ok:   { bg: colors.badgeOkBg,   fg: colors.badgeOkText },
};

export function InfoRow({ title, detail, badgeText, badgeTone = "info" }: InfoRowProps) {
  const t = tones[badgeTone];
  return (
    <View style={styles.row}>
      <View style={[styles.bar, { backgroundColor: t.fg }]} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.detail} numberOfLines={2}>{detail}</Text>
      </View>
      {badgeText ? (
        <View style={[styles.badge, { backgroundColor: t.bg }]}>
          <Text style={[styles.badgeText, { color: t.fg }]}>{badgeText}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    gap: spacing.sm + 2, borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 3,
  },
  bar: {
    width: 3, alignSelf: "stretch",
    borderRadius: radius.pill, opacity: 0.45,
  },
  content: { flex: 1 },
  title: {
    color: colors.textPrimary, fontSize: typography.bodyMD,
    fontFamily: typography.fontBodyStrong, letterSpacing: -0.1,
  },
  detail: {
    color: colors.textMuted, fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular, marginTop: 3, lineHeight: 17,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: typography.bodyXS, fontFamily: typography.fontBodyStrong,
    letterSpacing: 0.2,
  },
});
