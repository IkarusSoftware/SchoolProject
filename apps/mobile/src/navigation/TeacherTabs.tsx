import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";
import { TeacherAttendanceScreen } from "../features/teacher/screens/TeacherAttendanceScreen";
import { TeacherDashboardScreen } from "../features/teacher/screens/TeacherDashboardScreen";
import { TeacherMessagesScreen } from "../features/teacher/screens/TeacherMessagesScreen";
import { colors, radius, spacing, typography } from "../theme";
import type { TeacherTabParamList } from "./types";

const Tab = createBottomTabNavigator<TeacherTabParamList>();

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabMeta: Record<
  keyof TeacherTabParamList,
  { label: string; icon: IconName; activeIcon: IconName }
> = {
  Dashboard: { label: "Panel", icon: "grid-outline", activeIcon: "grid" },
  Attendance: {
    label: "Yoklama",
    icon: "people-outline",
    activeIcon: "people",
  },
  Messages: { label: "Mesajlar", icon: "chatbox-outline", activeIcon: "chatbox" },
};

export function TeacherTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => {
        const meta = tabMeta[route.name as keyof TeacherTabParamList];
        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#e8f7ff",
          tabBarInactiveTintColor: "#8fb8d2",
          tabBarLabelStyle: styles.label,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarActiveBackgroundColor: colors.tabActive,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? meta.activeIcon : meta.icon}
              size={20}
              color={color}
            />
          ),
        };
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={TeacherDashboardScreen}
        options={{ title: tabMeta.Dashboard.label }}
      />
      <Tab.Screen
        name="Attendance"
        component={TeacherAttendanceScreen}
        options={{ title: tabMeta.Attendance.label }}
      />
      <Tab.Screen
        name="Messages"
        component={TeacherMessagesScreen}
        options={{ title: tabMeta.Messages.label }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    height: 78,
    borderTopWidth: 0,
    borderRadius: radius.lg,
    backgroundColor: colors.tabBg,
    paddingHorizontal: spacing.xs + 1,
    paddingTop: spacing.xs + 1,
    borderWidth: 1,
    borderColor: "rgba(166, 204, 229, 0.2)",
  },
  tabItem: {
    borderRadius: radius.md + 2,
    marginVertical: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: typography.fontBodyStrong,
    marginBottom: 1,
  },
});
