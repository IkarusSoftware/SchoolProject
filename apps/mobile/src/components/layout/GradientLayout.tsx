import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "../../theme";

interface GradientLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function GradientLayout({
  title,
  subtitle,
  children,
  refreshing = false,
  onRefresh,
}: GradientLayoutProps) {
  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.page}
    >
      <StatusBar style="light" />

      {/* Ambient glow orbs */}
      <View pointerEvents="none" style={styles.bgLayer}>
        <View style={[styles.orb, styles.orbTopRight]} />
        <View style={[styles.orb, styles.orbBottomLeft]} />
        <View style={[styles.orb, styles.orbMidRight]} />
      </View>

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.hero}>
          <View style={styles.chip}>
            <View style={styles.chipDot} />
            <Text style={styles.chipText}>EDUSYNC</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.textLight}
                colors={[colors.textLight]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  bgLayer: { ...StyleSheet.absoluteFillObject },
  orb: { position: "absolute", borderRadius: 999 },
  orbTopRight: {
    width: 340, height: 340, top: -160, right: -120,
    backgroundColor: "rgba(16,185,129,0.05)",
  },
  orbBottomLeft: {
    width: 280, height: 280, bottom: 60, left: -110,
    backgroundColor: "rgba(99,102,241,0.04)",
  },
  orbMidRight: {
    width: 180, height: 180, top: "38%", right: -60,
    backgroundColor: "rgba(245,158,11,0.025)",
  },
  safe: { flex: 1 },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg + 2,
    marginBottom: spacing.lg,
    gap: spacing.xs + 2,
  },
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
  },
  chipDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: "#10b981",
  },
  chipText: {
    color: "rgba(255,255,255,0.40)",
    fontSize: typography.bodyXS,
    letterSpacing: 2.2,
    fontFamily: typography.fontDisplayMedium,
  },
  title: {
    color: colors.textWhite,
    fontSize: typography.titleXL,
    lineHeight: 34,
    fontFamily: typography.fontDisplay,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.38)",
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
    lineHeight: 18,
  },
  scroll: { flex: 1 },
  scrollInner: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
    gap: spacing.md,
  },
});
