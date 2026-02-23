import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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
import { colors, radius, spacing, typography } from "../../../theme";
import { getErrorMessage } from "../../../utils/errors";
import { useAuth } from "../AuthProvider";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:4000/api/v1"
    : "http://localhost:4000/api/v1");

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("veli@demo-okulu.com");
  const [password, setPassword] = useState("Demo1234!");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.formWrap}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.hero}>
            <Text style={styles.kicker}>EDUSYNC MOBILE</Text>
            <Text style={styles.title}>Parent Login</Text>
            <Text style={styles.subtitle}>Sign in to access attendance, meals and messages.</Text>
          </View>

          <View style={styles.card}>
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
              style={[styles.button, submitting ? styles.buttonDisabled : null]}
              disabled={submitting}
              onPress={handleLogin}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>

            <View style={styles.helperBox}>
              <Text style={styles.helperTitle}>Demo account</Text>
              <Text style={styles.helperText}>Email: veli@demo-okulu.com</Text>
              <Text style={styles.helperText}>Password: Demo1234!</Text>
            </View>

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
  kicker: {
    color: "#9dd4ff",
    fontSize: typography.bodyXS,
    letterSpacing: 1.6,
    fontFamily: typography.fontDisplay,
  },
  title: {
    color: colors.textWhite,
    fontSize: typography.titleXL,
    lineHeight: 34,
    fontFamily: typography.fontDisplay,
  },
  subtitle: {
    color: colors.textLight,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
  },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: "#042237",
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 10,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontDisplay,
  },
  input: {
    height: 44,
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
    color: "#b01818",
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
  },
  button: {
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.accentBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontDisplay,
  },
  helperBox: {
    borderRadius: radius.md,
    backgroundColor: "#eaf5ff",
    borderWidth: 1,
    borderColor: "#cee6fb",
    padding: spacing.sm + 2,
    gap: 2,
  },
  helperTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontDisplay,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
  },
  endpointText: {
    color: colors.textSecondary,
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBody,
  },
});
