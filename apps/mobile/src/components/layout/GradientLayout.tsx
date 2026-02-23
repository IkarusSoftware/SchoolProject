import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../../theme";

interface GradientLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function GradientLayout({ title, subtitle, children }: GradientLayoutProps) {
  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.page}
    >
      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>EDUSYNC MOBILE</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
  safeArea: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  kicker: {
    color: "#9dd4ff",
    fontSize: typography.bodyXS,
    letterSpacing: 1.7,
    fontFamily: typography.fontDisplay,
  },
  title: {
    marginTop: 3,
    color: colors.textWhite,
    fontSize: typography.titleXL,
    lineHeight: 34,
    fontFamily: typography.fontDisplay,
  },
  subtitle: {
    marginTop: 3,
    color: colors.textLight,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 126,
    gap: spacing.md,
  },
});

