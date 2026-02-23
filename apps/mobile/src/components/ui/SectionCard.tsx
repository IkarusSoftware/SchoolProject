import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
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
  title,
  subtitle,
  rightLabel,
  children,
  animateDelayMs = 0,
}: SectionCardProps) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(enter, {
      toValue: 1,
      duration: 360,
      delay: animateDelayMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animateDelayMs, enter]);

  const animatedStyle = {
    opacity: enter,
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <LinearGradient
        colors={["rgba(66, 149, 199, 0.28)", "rgba(16, 120, 178, 0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topAccent}
      />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
      </View>
      <View style={styles.body}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 6,
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.titleMD,
    fontFamily: typography.fontDisplayMedium,
  },
  subtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
  },
  rightLabel: {
    color: colors.accentGreen,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyStrong,
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  body: {
    marginTop: spacing.sm + 2,
    gap: spacing.sm,
  },
});
