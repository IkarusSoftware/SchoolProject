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
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
              <Text style={styles.kicker}>EDUSYNC SUITE</Text>
            </View>
            <Text style={styles.title}>Modern School Experience</Text>
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
                    onPress={() => {
                      setDemoRole(role);
                    }}
                    style={({ pressed }) => [
                      styles.roleChip,
                      selected ? styles.roleChipActive : null,
                      pressed ? styles.roleChipPressed : null,
                    ]}
                  >
                    <Ionicons
                      name={role === "PARENT" ? "people-outline" : "school-outline"}
                      size={14}
                      color={selected ? colors.textWhite : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.roleChipText,
                        selected ? styles.roleChipTextActive : null,
                      ]}
                    >
                      {role === "PARENT" ? "Veli" : "Ogretmen"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.roleHint}>{roleHint}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#6d8798"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Your password"
                placeholderTextColor="#6d8798"
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
                colors={[colors.accentBlueStrong, colors.accentBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Sign in</Text>
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
  page: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundOrb: {
    position: "absolute",
    borderRadius: radius.pill,
    backgroundColor: "rgba(151, 215, 255, 0.16)",
  },
  backgroundOrbOne: {
    width: 280,
    height: 280,
    top: -120,
    right: -80,
  },
  backgroundOrbTwo: {
    width: 220,
    height: 220,
    bottom: 100,
    left: -90,
    backgroundColor: "rgba(255, 194, 126, 0.13)",
  },
  safeArea: {
    flex: 1,
  },
  formWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.xs,
  },
  heroChip: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(170, 216, 243, 0.52)",
    backgroundColor: "rgba(8, 32, 49, 0.2)",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
  },
  kicker: {
    color: "#a5d8f5",
    fontSize: typography.bodyXS,
    letterSpacing: 1.1,
    fontFamily: typography.fontDisplayMedium,
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
    lineHeight: 20,
    fontFamily: typography.fontBody,
  },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 10,
  },
  roleSegment: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  roleChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  roleChipActive: {
    borderColor: colors.accentBlue,
    backgroundColor: colors.accentBlue,
  },
  roleChipPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  roleChipText: {
    color: colors.textSecondary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  roleChipTextActive: {
    color: colors.textWhite,
  },
  roleHint: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  input: {
    minHeight: 45,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontBody,
  },
  errorText: {
    color: colors.accentCoral,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
  buttonWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
  },
  button: {
    minHeight: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs + 1,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontDisplayMedium,
  },
  endpointText: {
    color: colors.textMuted,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyRegular,
  },
});
