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
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.page}
    >
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.glowOrb, styles.glowOrbTop]} />
        <View style={[styles.glowOrb, styles.glowOrbBottom]} />
        <View style={[styles.glowOrb, styles.glowOrbAccent]} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.hero}>
          <View style={styles.kickerChip}>
            <Text style={styles.kicker}>EDUSYNC MOBILE</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
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
  page: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  glowOrb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(162, 219, 255, 0.18)",
  },
  glowOrbTop: {
    width: 320,
    height: 320,
    top: -130,
    right: -110,
  },
  glowOrbBottom: {
    width: 250,
    height: 250,
    bottom: 130,
    left: -100,
    backgroundColor: "rgba(135, 222, 186, 0.13)",
  },
  glowOrbAccent: {
    width: 180,
    height: 180,
    bottom: 240,
    right: -70,
    backgroundColor: "rgba(255, 199, 130, 0.14)",
  },
  safeArea: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  kickerChip: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(169, 216, 246, 0.55)",
    backgroundColor: "rgba(6, 28, 45, 0.24)",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
  },
  kicker: {
    color: "#a8d8f8",
    fontSize: typography.bodyXS,
    letterSpacing: 1.2,
    fontFamily: typography.fontDisplay,
  },
  title: {
    color: colors.textWhite,
    fontSize: typography.titleXL,
    lineHeight: 38,
    fontFamily: typography.fontDisplay,
  },
  subtitle: {
    color: colors.textLight,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontBody,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 136,
    gap: spacing.lg,
  },
});
