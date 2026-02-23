import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";
import { ToastProvider } from "../components/feedback/ToastProvider";
import { AnnouncementsScreen } from "../features/parent/screens/AnnouncementsScreen";
import { AttendanceScreen } from "../features/parent/screens/AttendanceScreen";
import { ParentMockProvider } from "../features/parent/mock/ParentMockProvider";
import { DashboardScreen } from "../features/parent/screens/DashboardScreen";
import { MealsScreen } from "../features/parent/screens/MealsScreen";
import { MessagesScreen } from "../features/parent/screens/MessagesScreen";
import { colors, radius, spacing, typography } from "../theme";
import type { ParentTabParamList } from "./types";

const Tab = createBottomTabNavigator<ParentTabParamList>();

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabMeta: Record<
  keyof ParentTabParamList,
  { label: string; icon: IconName; activeIcon: IconName }
> = {
  Dashboard: { label: "Ana Sayfa", icon: "home-outline", activeIcon: "home" },
  Attendance: {
    label: "Yoklama",
    icon: "checkmark-done-outline",
    activeIcon: "checkmark-done",
  },
  Announcements: {
    label: "Duyurular",
    icon: "megaphone-outline",
    activeIcon: "megaphone",
  },
  Meals: { label: "Yemek", icon: "restaurant-outline", activeIcon: "restaurant" },
  Messages: { label: "Mesaj", icon: "mail-outline", activeIcon: "mail" },
};

export function ParentTabs() {
  return (
    <ToastProvider>
      <ParentMockProvider>
        <Tab.Navigator
          initialRouteName="Dashboard"
          screenOptions={({ route }) => {
            const meta = tabMeta[route.name as keyof ParentTabParamList];
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
      </ParentMockProvider>
    </ToastProvider>
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
