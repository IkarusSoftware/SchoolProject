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

export function RequestState({ title, subtitle, mode, message, onRetry }: RequestStateProps) {
  const isLoading = mode === "loading";
  const hasRetry = !isLoading && typeof onRetry === "function";

  return (
    <SectionCard title={title} subtitle={subtitle}>
      <View style={styles.wrap}>
        {isLoading ? <ActivityIndicator size="small" color="#10b981" /> : null}
        <Text style={styles.msg}>
          {message || (isLoading ? "Yükleniyor..." : mode === "empty" ? "Kayıt bulunamadı." : "İstek başarısız.")}
        </Text>
        {hasRetry ? (
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={onRetry}
          >
            <Text style={styles.btnText}>Tekrar Dene</Text>
          </Pressable>
        ) : null}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    alignItems: "center", gap: spacing.sm,
  },
  msg: {
    color: colors.textMuted, fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular, textAlign: "center", lineHeight: 18,
  },
  btn: {
    marginTop: spacing.xs, borderRadius: radius.pill,
    backgroundColor: "#059669",
    paddingHorizontal: spacing.md + 4, paddingVertical: spacing.xs + 3,
  },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  btnText: {
    color: colors.textWhite, fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
});
