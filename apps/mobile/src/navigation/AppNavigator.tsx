import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { LoginScreen } from "../features/auth/screens/LoginScreen";
import { useAuth } from "../features/auth/AuthProvider";
import { colors, typography } from "../theme";
import { ParentTabs } from "./ParentTabs";
import { TeacherTabs } from "./TeacherTabs";
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

function UnsupportedRoleScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.unsupportedContainer}>
      <Text style={styles.unsupportedTitle}>Unsupported Role</Text>
      <Text style={styles.unsupportedText}>
        This mobile build supports only parent and teacher roles for now.
      </Text>
      <Text style={styles.unsupportedText}>Current role: {user?.role || "UNKNOWN"}</Text>
      <Pressable
        style={styles.unsupportedButton}
        onPress={() => {
          void signOut();
        }}
      >
        <Text style={styles.unsupportedButtonText}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

export function AppNavigator() {
  const { status, user } = useAuth();

  const role = user?.role;
  const isParent = role === "PARENT";
  const isTeacher = role === "TEACHER";

  return (
    <NavigationContainer theme={navTheme}>
      {status === "loading" ? (
        <BootScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
          {status === "authenticated" ? (
            <>
              {isParent ? <Stack.Screen name="ParentTabs" component={ParentTabs} /> : null}
              {isTeacher ? <Stack.Screen name="TeacherTabs" component={TeacherTabs} /> : null}
              {!isParent && !isTeacher ? <Stack.Screen name="Login" component={UnsupportedRoleScreen} /> : null}
            </>
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
  unsupportedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a3248",
    paddingHorizontal: 24,
    gap: 12,
  },
  unsupportedTitle: {
    color: colors.textWhite,
    fontSize: typography.titleLG,
    fontFamily: typography.fontDisplay,
  },
  unsupportedText: {
    color: colors.textLight,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBody,
    textAlign: "center",
  },
  unsupportedButton: {
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: colors.accentBlue,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  unsupportedButtonText: {
    color: colors.textWhite,
    fontSize: typography.bodySM,
    fontFamily: typography.fontDisplay,
  },
});
