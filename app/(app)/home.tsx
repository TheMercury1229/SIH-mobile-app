import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  Calendar,
  ClipboardCheck,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";
import { NovaTheme } from "../../theme/NovaTheme";

export default function HomeScreen() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();

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
      icon: ClipboardCheck,
      onPress: handleStartAssessment,
    },
    {
      title: "View Progress",
      description: "Track your achievements",
      icon: TrendingUp,
      onPress: handleViewProgress,
    },
    {
      title: "Set Goals",
      description: "Plan your next milestone",
      icon: Target,
      onPress: () => {},
    },
    {
      title: "Community",
      description: "Connect with athletes",
      icon: Users,
      onPress: () => {},
    },
  ];

  const stats = [
    { label: "Workouts", value: "24", icon: Activity },
    { label: "Streak", value: "7 days", icon: Calendar },
    { label: "Goals", value: "3/5", icon: Trophy },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: NovaTheme.colors.background }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
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
          {/* <View className="mx-6 mb-8 flex-row justify-between">
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
          </View> */}

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
                  <View
                    style={{ backgroundColor: NovaTheme.colors.surface }}
                    className="p-6"
                  >
                    <View className="mb-3">
                      <action.icon size={24} color={NovaTheme.colors.primary} />
                    </View>
                    <Text className="mb-1 text-lg font-bold text-white">
                      {action.title}
                    </Text>
                    <Text className="text-sm text-white/90">
                      {action.description}
                    </Text>
                  </View>
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
                    <Text className="text-sm text-white/70">2 days ago</Text>
                  </View>
                </View>
                <Text className="text-sm font-medium text-green-400">
                  Completed
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
