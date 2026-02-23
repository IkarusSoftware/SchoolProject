import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../../config/api";
import { colors, radius, spacing, typography } from "../../../theme";
import { getErrorMessage } from "../../../utils/errors";
import { useAuth } from "../AuthProvider";

type DemoRole = "PARENT" | "TEACHER";

const demoCredentials: Record<DemoRole, { email: string; password: string }> = {
  PARENT: { email: "veli@demo-okulu.com", password: "Demo1234!" },
  TEACHER: { email: "ogretmen@demo-okulu.com", password: "Demo1234!" },
};

export function LoginScreen() {
  const { signIn } = useAuth();
  const [activeRole, setActiveRole] = useState<DemoRole>("PARENT");
  const [email, setEmail] = useState(demoCredentials.PARENT.email);
  const [password, setPassword] = useState(demoCredentials.PARENT.password);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleHint = useMemo(
    () =>
      activeRole === "PARENT"
        ? "Veli deneyimi: bildirim, yoklama, yemek, mesaj"
        : "Ogretmen deneyimi: yoklama alma ve mesajlasma",
    [activeRole]
  );

  const setDemoRole = (role: DemoRole) => {
    setActiveRole(role);
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
  };

  const handleLogin = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Login failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.page}
    >
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.backgroundOrb, styles.backgroundOrbOne]} />
        <View style={[styles.backgroundOrb, styles.backgroundOrbTwo]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.formWrap}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.hero}>
            <View style={styles.heroChip}>
              <View style={styles.heroChipDot} />
              <Text style={styles.kicker}>EDUSYNC</Text>
            </View>
            <Text style={styles.title}>Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>
              Tek uygulamada veli ve ogretmen akislarini premium mobil deneyimle yonetin.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.roleSegment}>
              {(["PARENT", "TEACHER"] as const).map((role) => {
                const selected = role === activeRole;
                return (
                  <Pressable
                    key={role}
                    onPress={() => { setDemoRole(role); }}
                    style={({ pressed }) => [
                      styles.roleChip,
                      selected ? styles.roleChipActive : null,
                      pressed ? styles.roleChipPressed : null,
                    ]}
                  >
                    <Ionicons
                      name={role === "PARENT" ? "people-outline" : "school-outline"}
                      size={14}
                      color={selected ? colors.textWhite : colors.textMuted}
                    />
                    <Text
                      style={[styles.roleChipText, selected ? styles.roleChipTextActive : null]}
                    >
                      {role === "PARENT" ? "Veli" : "Ogretmen"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.roleHint}>{roleHint}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="ornek@mail.com"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Şifreniz"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.buttonWrap,
                submitting ? styles.buttonDisabled : null,
                pressed ? styles.buttonPressed : null,
              ]}
              disabled={submitting}
              onPress={handleLogin}
            >
              <LinearGradient
                colors={["#059669", "#10b981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Giriş Yap</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Text style={styles.endpointText}>API: {API_BASE_URL}</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  backgroundLayer: { ...StyleSheet.absoluteFillObject },
  backgroundOrb: { position: "absolute", borderRadius: radius.pill },
  backgroundOrbOne: {
    width: 300, height: 300, top: -140, right: -90,
    backgroundColor: "rgba(16,185,129,0.05)",
  },
  backgroundOrbTwo: {
    width: 240, height: 240, bottom: 80, left: -100,
    backgroundColor: "rgba(99,102,241,0.04)",
  },
  safeArea: { flex: 1 },
  formWrap: {
    flex: 1, justifyContent: "center",
    paddingHorizontal: spacing.xl, gap: spacing.lg,
  },
  hero: { gap: spacing.xs + 2 },
  heroChip: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center",
    gap: spacing.xs, borderRadius: radius.pill,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.xs,
  },
  heroChipDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: "#10b981",
  },
  kicker: {
    color: "rgba(255,255,255,0.40)",
    fontSize: typography.bodyXS, letterSpacing: 2.2,
    fontFamily: typography.fontDisplayMedium,
  },
  title: {
    color: colors.textWhite, fontSize: typography.titleXL,
    lineHeight: 34, fontFamily: typography.fontDisplay, letterSpacing: -0.5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.38)", fontSize: typography.bodySM,
    lineHeight: 19, fontFamily: typography.fontBody,
  },
  card: {
    borderRadius: radius.xl, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderSoft,
    padding: spacing.lg, gap: spacing.md,
    shadowColor: "#000", shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 }, shadowRadius: 28, elevation: 8,
  },
  roleSegment: { flexDirection: "row", gap: spacing.xs },
  roleChip: {
    flex: 1, minHeight: 40, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: spacing.xs,
  },
  roleChipActive: {
    borderColor: "#10b981", backgroundColor: "#10b981",
  },
  roleChipPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  roleChipText: {
    color: colors.textSecondary, fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  roleChipTextActive: { color: colors.textWhite },
  roleHint: {
    color: colors.textMuted, fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
  inputGroup: { gap: spacing.xs },
  label: {
    color: colors.textPrimary, fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  input: {
    minHeight: 46, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary, fontSize: typography.bodyMD,
    fontFamily: typography.fontBody,
  },
  errorText: {
    color: colors.accentCoral, fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
  buttonWrap: { borderRadius: radius.md, overflow: "hidden" },
  button: {
    minHeight: 48, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: spacing.xs + 1,
  },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: colors.textWhite, fontSize: typography.bodyMD,
    fontFamily: typography.fontDisplayMedium,
  },
  endpointText: {
    color: colors.textMuted, fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyRegular, textAlign: "center",
  },
});
