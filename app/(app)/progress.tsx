import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  ArrowUp,
  Heart,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NovaTheme } from "../../theme/NovaTheme";

export default function ProgressScreen() {
  const router = useRouter();

  // Mock data - in real app this would come from your backend/storage
  const testResults = [
    {
      id: 1,
      testName: "Vertical Jump Test",
      score: "45 cm",
      date: "2024-01-15",
      improvement: "+3cm",
      isImprovement: true,
      icon: ArrowUp,
    },
    {
      id: 2,
      testName: "Sit-ups Test",
      score: "32 reps",
      date: "2024-01-14",
      improvement: "+5 reps",
      isImprovement: true,
      icon: Activity,
    },
    {
      id: 3,
      testName: "Shuttle Run Test",
      score: "18.5 sec",
      date: "2024-01-12",
      improvement: "-1.2s",
      isImprovement: true,
      icon: Zap,
    },
    {
      id: 4,
      testName: "Endurance Run Test",
      score: "2.1 km",
      date: "2024-01-10",
      improvement: "-0.1km",
      isImprovement: false,
      icon: Heart,
    },
  ];

  const overallStats = [
    { label: "Total Tests", value: "12", change: "+4", icon: Trophy },
    { label: "Best Score", value: "95%", change: "+12%", icon: Target },
    { label: "Consistency", value: "87%", change: "+5%", icon: Users },
  ];

  const handlePlayVideo = (testId: number) => {
    // In real app, this would open video player
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: NovaTheme.colors.background }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
              onPress={() => router.back()}
            >
              <Text className="text-lg text-white">←</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">
              Progress Tracker
            </Text>
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
              onPress={() => router.push("/(app)/assessment" as any)}
            >
              <Text className="text-lg text-white">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Overall Stats */}
          <View className="mx-6 mb-6">
            <Text className="mb-4 text-xl font-bold text-white">
              Overall Performance
            </Text>
            <View className="flex-row justify-between">
              {overallStats.map((stat, index) => (
                <View
                  key={index}
                  className="flex-1 rounded-xl p-4"
                  style={{
                    marginHorizontal: index === 1 ? 8 : 0,
                    backgroundColor: NovaTheme.colors.surface,
                  }}
                >
                  <View className="mb-2">
                    <stat.icon size={20} color={NovaTheme.colors.primary} />
                  </View>
                  <Text className="text-2xl font-bold text-white">
                    {stat.value}
                  </Text>
                  <Text className="text-sm text-white/80">{stat.label}</Text>
                  <Text
                    className="text-xs mt-1"
                    style={{ color: NovaTheme.colors.success }}
                  >
                    {stat.change} this month
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Test Results */}
          <View className="px-6">
            <Text className="mb-4 text-xl font-bold text-white">
              Recent Tests
            </Text>
            {testResults.map((result) => (
              <View
                key={result.id}
                className="mb-4 rounded-2xl overflow-hidden"
              >
                <View
                  style={{ backgroundColor: NovaTheme.colors.surface }}
                  className="rounded-2xl"
                >
                  <View className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <View className="flex-row items-center justify-between">
                      {/* Test Info */}
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <View className="mr-3">
                            <result.icon
                              size={20}
                              color={NovaTheme.colors.primary}
                            />
                          </View>
                          <View>
                            <Text className="text-lg font-bold text-white">
                              {result.testName}
                            </Text>
                            <Text className="text-sm text-white/70">
                              {formatDate(result.date)}
                            </Text>
                          </View>
                        </View>

                        {/* Score and Improvement */}
                        <View className="flex-row items-center justify-between">
                          <View>
                            <Text className="text-xs text-white/70">Score</Text>
                            <Text className="text-xl font-bold text-white">
                              {result.score}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-xs text-white/70">
                              Change
                            </Text>
                            <View className="flex-row items-center">
                              {result.isImprovement ? (
                                <TrendingUp
                                  size={14}
                                  color={NovaTheme.colors.success}
                                />
                              ) : (
                                <TrendingDown
                                  size={14}
                                  color={NovaTheme.colors.error}
                                />
                              )}
                              <Text
                                className="ml-1 text-sm font-semibold"
                                style={{
                                  color: result.isImprovement
                                    ? NovaTheme.colors.success
                                    : NovaTheme.colors.error,
                                }}
                              >
                                {result.improvement}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Video Thumbnail */}
                      <TouchableOpacity
                        className="ml-4 h-16 w-16 items-center justify-center rounded-xl"
                        style={{ backgroundColor: NovaTheme.colors.primary }}
                        onPress={() => handlePlayVideo(result.id)}
                      >
                        <Text className="text-xs text-white/70 mt-1">Play</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Historical Performance */}
          <View className="mx-6 mt-4">
            <Text className="mb-4 text-xl font-bold text-white">
              Performance Trends
            </Text>
            <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-white">
                  This Month's Highlights
                </Text>
                <Text className="text-sm text-white/70">January 2024</Text>
              </View>

              <View className="space-y-3">
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-white/90">🏆 Best Performance</Text>
                  <Text className="font-semibold text-white">
                    Vertical Jump
                  </Text>
                </View>
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-white/90">📈 Most Improved</Text>
                  <Text className="font-semibold text-white">Sit-ups</Text>
                </View>
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-white/90">🎯 Consistency Rate</Text>
                  <Text className="font-semibold text-white">87%</Text>
                </View>
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-white/90">📅 Tests Completed</Text>
                  <Text className="font-semibold text-white">4/4</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recommendations */}
          <View className="mx-6 mt-4">
            <Text className="mb-4 text-xl font-bold text-white">
              Recommendations
            </Text>
            <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <View className="mb-4">
                <Text className="mb-2 text-lg font-semibold text-white">
                  Focus Areas
                </Text>
                <Text className="mb-3 text-white/90">
                  Based on your recent tests, here are some areas to work on:
                </Text>
              </View>

              <View className="space-y-3">
                <View className="flex-row items-start">
                  <Text className="mr-2 text-yellow-400">💡</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-white">
                      Endurance Training
                    </Text>
                    <Text className="text-sm text-white/80">
                      Your endurance run showed a slight decrease. Consider
                      adding more cardio sessions.
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <Text className="mr-2 text-green-400">✨</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-white">
                      Keep Up the Core Work
                    </Text>
                    <Text className="text-sm text-white/80">
                      Great improvement in sit-ups! Maintain your core training
                      routine.
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <Text className="mr-2 text-blue-400">🎯</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-white">Next Goal</Text>
                    <Text className="text-sm text-white/80">
                      Aim for 50cm in your next vertical jump test!
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
