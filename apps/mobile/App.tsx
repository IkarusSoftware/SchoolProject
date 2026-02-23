import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, useFonts as useManropeFonts } from "@expo-google-fonts/manrope";
import { Sora_600SemiBold, Sora_700Bold, useFonts as useSoraFonts } from "@expo-google-fonts/sora";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/features/auth/AuthProvider";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { colors, typography } from "./src/theme";

export default function App() {
  const [soraLoaded] = useSoraFonts({
    Sora_600SemiBold,
    Sora_700Bold,
  });
  const [manropeLoaded] = useManropeFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  if (!soraLoaded || !manropeLoaded) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <View style={styles.bootContainer}>
            <ActivityIndicator size="large" color={colors.textLight} />
            <Text style={styles.bootText}>Preparing EduSync Design System...</Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gradientTop,
    gap: 12,
  },
  bootText: {
    color: colors.textLight,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
  },
});
