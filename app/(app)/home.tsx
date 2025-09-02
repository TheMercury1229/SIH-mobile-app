import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";

export default function HomeScreen() {
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

  const handleStartAssessment = () => {
    router.push("/(app)/assessment" as any);
  };

  const handleViewProgress = () => {
    router.push("/(app)/progress" as any);
  };

  if (!token) {
    return <Redirect href={"/(auth)/login"} />;
  }

  const quickActions = [
    {
      title: "Start Assessment",
      description: "Begin your fitness assessment",
      icon: "📋",
      color: "from-orange-400 to-pink-400",
      onPress: handleStartAssessment,
    },
    {
      title: "View Progress",
      description: "Track your achievements",
      icon: "📊",
      color: "from-blue-400 to-purple-400",
      onPress: handleViewProgress,
    },
    {
      title: "Set Goals",
      description: "Plan your next milestone",
      icon: "🎯",
      color: "from-green-400 to-blue-400",
      onPress: () => {},
    },
    {
      title: "Community",
      description: "Connect with athletes",
      icon: "👥",
      color: "from-purple-400 to-pink-400",
      onPress: () => {},
    },
  ];

  const stats = [
    { label: "Workouts", value: "24" },
    { label: "Streak", value: "7 days" },
    { label: "Goals", value: "3/5" },
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
          {/* Header Section */}
          <View className="px-6 pt-6 pb-8">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg text-white/80">Good morning,</Text>
                <Text className="text-2xl font-bold text-white">
                  {user?.name || "Athlete"}
                </Text>
              </View>
              <TouchableOpacity
                className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
                onPress={() => router.push("/(app)/profile")}
              >
                <Text className="text-xl">👤</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View className="mx-6 mb-8 flex-row justify-between">
            {stats.map((stat, index) => (
              <View
                key={index}
                className="flex-1 rounded-xl bg-white/15 p-4 backdrop-blur-sm"
                style={{ marginHorizontal: index === 1 ? 8 : 0 }}
              >
                <Text className="text-2xl font-bold text-white">
                  {stat.value}
                </Text>
                <Text className="text-sm text-white/80">{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View className="px-6">
            <Text className="mb-4 text-xl font-bold text-white">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className="mb-4 w-[48%] overflow-hidden rounded-2xl"
                  activeOpacity={0.8}
                  onPress={action.onPress}
                >
                  <LinearGradient
                    colors={
                      action.color.includes("orange")
                        ? ["#fb923c", "#ec4899"]
                        : action.color.includes("blue") &&
                            action.color.includes("purple")
                          ? ["#60a5fa", "#a855f7"]
                          : action.color.includes("green")
                            ? ["#4ade80", "#3b82f6"]
                            : ["#a855f7", "#ec4899"]
                    }
                    className="p-6"
                  >
                    <Text className="mb-2 text-3xl">{action.icon}</Text>
                    <Text className="mb-1 text-lg font-bold text-white">
                      {action.title}
                    </Text>
                    <Text className="text-sm text-white/90">
                      {action.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View className="mx-6 mt-4">
            <Text className="mb-4 text-xl font-bold text-white">
              Recent Activity
            </Text>
            <View className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-500">
                    <Text className="text-white">✓</Text>
                  </View>
                  <View>
                    <Text className="font-semibold text-white">
                      Fitness Assessment
                    </Text>
                    <Text className="text-sm text-white/70">
                      2 days ago
                    </Text>
                  </View>
                </View>
                <Text className="text-sm font-medium text-green-400">
                  Completed
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Logout Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            className="rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text className="text-center text-lg font-semibold text-white">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}