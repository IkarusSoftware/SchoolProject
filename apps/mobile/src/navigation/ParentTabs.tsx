import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text } from "react-native";
import { AnnouncementsScreen } from "../features/parent/screens/AnnouncementsScreen";
import { AttendanceScreen } from "../features/parent/screens/AttendanceScreen";
import { DashboardScreen } from "../features/parent/screens/DashboardScreen";
import { MealsScreen } from "../features/parent/screens/MealsScreen";
import { MessagesScreen } from "../features/parent/screens/MessagesScreen";
import { colors, radius, spacing, typography } from "../theme";
import type { ParentTabParamList } from "./types";

const Tab = createBottomTabNavigator<ParentTabParamList>();

const tabMeta: Record<keyof ParentTabParamList, { short: string; label: string }> = {
  Dashboard: { short: "HM", label: "Home" },
  Attendance: { short: "AT", label: "Attend" },
  Announcements: { short: "AN", label: "News" },
  Meals: { short: "ML", label: "Meals" },
  Messages: { short: "MS", label: "Inbox" },
};

export function ParentTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => {
        const meta = tabMeta[route.name as keyof ParentTabParamList];
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#d7f0ff",
          tabBarInactiveTintColor: "#85b7d4",
          tabBarLabelStyle: styles.label,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.icon, { color, opacity: focused ? 1 : 0.82 }]}>
              {meta.short}
            </Text>
          ),
        };
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: tabMeta.Dashboard.label }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: tabMeta.Attendance.label }}
      />
      <Tab.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{ title: tabMeta.Announcements.label }}
      />
      <Tab.Screen
        name="Meals"
        component={MealsScreen}
        options={{ title: tabMeta.Meals.label }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
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
    height: 74,
    borderTopWidth: 0,
    borderRadius: radius.lg,
    backgroundColor: colors.tabBg,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
  },
  tabItem: {
    borderRadius: radius.md,
  },
  icon: {
    fontSize: 11,
    fontFamily: typography.fontDisplay,
    marginTop: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: typography.fontDisplay,
    marginBottom: 2,
  },
});

