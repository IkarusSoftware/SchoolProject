import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";
import { SectionCard } from "./SectionCard";

type RequestStateMode = "loading" | "error" | "empty";

interface RequestStateProps {
  title: string;
  subtitle?: string;
  mode: RequestStateMode;
  message?: string;
  onRetry?: () => void;
}

export function RequestState({
  title,
  subtitle,
  mode,
  message,
  onRetry,
}: RequestStateProps) {
  const isLoading = mode === "loading";
  const hasRetry = !isLoading && typeof onRetry === "function";

  return (
    <SectionCard title={title} subtitle={subtitle}>
      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.accentBlue} />
        ) : null}

        <Text style={styles.message}>
          {message ||
            (isLoading
              ? "Data is loading..."
              : mode === "empty"
                ? "No records found."
                : "Request failed.")}
        </Text>

        {hasRetry ? (
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed ? styles.retryButtonPressed : null,
            ]}
            onPress={onRetry}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#d3e2ee",
    backgroundColor: "#f6fbff",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
    textAlign: "center",
    lineHeight: 18,
  },
  retryButton: {
    marginTop: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.accentBlueStrong,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.xs + 2,
  },
  retryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  retryText: {
    color: colors.textWhite,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
});
