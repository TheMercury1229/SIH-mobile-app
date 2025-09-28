import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, useSegments } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { NovaTheme } from "../../theme/NovaTheme";

export default function AppLayout() {
  const { token } = useAuthStore();
  const segments = useSegments();

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check if current route is camera page to hide tab bar
  const isCameraPage =
    segments && segments.some((segment) => segment === "camera");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NovaTheme.components.tabBar.active,
        tabBarInactiveTintColor: NovaTheme.components.tabBar.inactive,
        tabBarStyle: isCameraPage
          ? { display: "none" } // Hide tab bar completely on camera page
          : {
              backgroundColor: NovaTheme.components.tabBar.background,
              borderTopWidth: 0,
              height: 88,
              paddingBottom: 8,
              paddingTop: 8,
              position: "absolute",
              elevation: 0,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={"progress"}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      {/* Hidden tabs - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="assessment"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
      <Tabs.Screen
        name="test/[id]"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
    </Tabs>
  );
}
