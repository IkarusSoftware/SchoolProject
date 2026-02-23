import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { LoginScreen } from "../features/auth/screens/LoginScreen";
import { useAuth } from "../features/auth/AuthProvider";
import { colors, typography } from "../theme";
import { ParentTabs } from "./ParentTabs";
import type { RootStackParamList } from "./types";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function BootScreen() {
  return (
    <View style={styles.bootContainer}>
      <ActivityIndicator size="large" color={colors.textLight} />
      <Text style={styles.bootText}>Preparing EduSync Mobile...</Text>
    </View>
  );
}

export function AppNavigator() {
  const { status } = useAuth();

  return (
    <NavigationContainer theme={navTheme}>
      {status === "loading" ? (
        <BootScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
          {status === "authenticated" ? (
            <Stack.Screen name="ParentTabs" component={ParentTabs} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bootContainer: {
    flex: 1,
    backgroundColor: "#0a3248",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  bootText: {
    color: colors.textLight,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontBody,
  },
});
