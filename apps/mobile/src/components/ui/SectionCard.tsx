import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  children: ReactNode;
  animateDelayMs?: number;
}

export function SectionCard({
  title, subtitle, rightLabel, children, animateDelayMs = 0,
}: SectionCardProps) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(enter, {
      toValue: 1, duration: 400, delay: animateDelayMs,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    });
    anim.start();
    return () => { anim.stop(); };
  }, [animateDelayMs, enter]);

  return (
    <Animated.View style={[styles.card, {
      opacity: enter,
      transform: [{ translateY: enter.interpolate({ inputRange: [0,1], outputRange: [12,0] }) }],
    }]}>
      <View style={styles.accent} />
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightLabel ? (
            <View style={styles.labelPill}>
              <View style={styles.labelDot} />
              <Text style={styles.labelText}>{rightLabel}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>{children}</View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 3,
  },
  accent: {
    width: 3,
    backgroundColor: "#10b981",
    opacity: 0.6,
  },
  inner: { flex: 1, padding: spacing.md + 2 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  headerLeft: { flex: 1 },
  title: {
    color: colors.textPrimary,
    fontSize: typography.titleMD,
    fontFamily: typography.fontDisplayMedium,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
  labelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16,185,129,0.06)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
  },
  labelDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: "#10b981",
  },
  labelText: {
    color: "#059669",
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyStrong,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  body: { marginTop: spacing.md, gap: spacing.sm + 2 },
});
