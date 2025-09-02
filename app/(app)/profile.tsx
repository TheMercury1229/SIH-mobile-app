import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";

export default function ProfileScreen() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert(
      "Coming Soon",
      "Edit profile functionality will be available soon!"
    );
  };

  if (!token) {
    return <Redirect href={"/(auth)/login"} />;
  }

  const profileSections = [
    {
      title: "Account Settings",
      items: [
        {
          icon: "👤",
          label: "Personal Information",
          action: handleEditProfile,
        },
        {
          icon: "🔔",
          label: "Notifications",
          action: () =>
            Alert.alert(
              "Coming Soon",
              "Notification settings will be available soon!"
            ),
        },
        {
          icon: "🔒",
          label: "Privacy & Security",
          action: () =>
            Alert.alert(
              "Coming Soon",
              "Privacy settings will be available soon!"
            ),
        },
      ],
    },
    {
      title: "Fitness",
      items: [
        {
          icon: "🎯",
          label: "Goals & Targets",
          action: () =>
            Alert.alert(
              "Coming Soon",
              "Goals settings will be available soon!"
            ),
        },
        {
          icon: "📊",
          label: "Activity History",
          action: () =>
            Alert.alert(
              "Coming Soon",
              "Activity history will be available soon!"
            ),
        },
        {
          icon: "⚙️",
          label: "Workout Preferences",
          action: () =>
            Alert.alert(
              "Coming Soon",
              "Workout preferences will be available soon!"
            ),
        },
      ],
    },
  ];

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header */}
          <View className="px-6 pt-6 pb-8">
            <Text className="text-2xl font-bold text-white">Profile</Text>
          </View>

          {/* Profile Card */}
          <View className="mx-6 mb-8 rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
            <View className="items-center">
              {/* Avatar */}
              <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-white/20">
                <Text className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </Text>
              </View>

              {/* User Info */}
              <Text className="mb-2 text-2xl font-bold text-white">
                {user?.name || "Athlete"}
              </Text>
              <Text className="mb-4 text-base text-white/80">
                {user?.email || "athlete@example.com"}
              </Text>

              {/* Stats */}
              <View className="flex-row space-x-8">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white">7</Text>
                  <Text className="text-sm text-white/70">Day Streak</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white">24</Text>
                  <Text className="text-sm text-white/70">Workouts</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white">3.2k</Text>
                  <Text className="text-sm text-white/70">Calories</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Profile Sections */}
          {profileSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mx-6 mb-6">
              <Text className="mb-3 text-xl font-bold text-white">
                {section.title}
              </Text>
              <View className="rounded-2xl bg-white/10 backdrop-blur-sm">
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    className={`flex-row items-center p-4 ${
                      itemIndex !== section.items.length - 1
                        ? "border-b border-white/10"
                        : ""
                    }`}
                    onPress={item.action}
                    activeOpacity={0.7}
                  >
                    <Text className="mr-4 text-2xl">{item.icon}</Text>
                    <Text className="flex-1 text-base font-medium text-white">
                      {item.label}
                    </Text>
                    <Text className="text-white/60">›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Member Info */}
          <View className="mx-6 mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-medium text-white">
                  Member Since
                </Text>
                <Text className="text-sm text-white/70">
                  {user?.joinDate || new Date().toLocaleDateString()}
                </Text>
              </View>
              <View className="rounded-full bg-green-500 px-3 py-1">
                <Text className="text-sm font-medium text-white">Active</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Logout Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            className="rounded-xl bg-red-500/20 px-6 py-4 backdrop-blur-sm"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text className="text-center text-lg font-semibold text-red-300">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
