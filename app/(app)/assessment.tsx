import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AssessmentScreen() {
  const router = useRouter();

  const tests = [
    {
      id: "vertical-jump",
      title: "Vertical Jump Test",
      description: "Measure your explosive power and leg strength",
      icon: "🦘",
      color: ["#fb923c", "#ec4899"] as [
        import("react-native").ColorValue,
        import("react-native").ColorValue,
      ],
      duration: "5 min",
      difficulty: "Easy",
    },
    {
      id: "shuttle-run",
      title: "Shuttle Run Test",
      description: "Test your agility and speed",
      icon: "🏃‍♂️",
      color: ["#60a5fa", "#a855f7"] as [
        import("react-native").ColorValue,
        import("react-native").ColorValue,
      ],
      duration: "10 min",
      difficulty: "Medium",
    },
    {
      id: "sit-ups",
      title: "Sit-ups Test",
      description: "Assess your core strength and endurance",
      icon: "💪",
      color: ["#4ade80", "#3b82f6"] as [
        import("react-native").ColorValue,
        import("react-native").ColorValue,
      ],
      duration: "3 min",
      difficulty: "Easy",
    },
    {
      id: "endurance-run",
      title: "Endurance Run Test",
      description: "Evaluate your cardiovascular fitness",
      icon: "🏃‍♀️",
      color: ["#a855f7", "#ec4899"] as [
        import("react-native").ColorValue,
        import("react-native").ColorValue,
      ],
      duration: "20 min",
      difficulty: "Hard",
    },
  ];

  const handleTestSelect = (testId: string) => {
    router.push(`/(app)/test/${testId}` as any);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
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
              Fitness Assessment
            </Text>
            <View className="w-10" />
          </View>
          <Text className="mt-4 text-center text-white/80">
            Choose a test to begin your assessment
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="px-6">
            {tests.map((test, index) => (
              <TouchableOpacity
                key={test.id}
                className="mb-4 overflow-hidden rounded-2xl"
                activeOpacity={0.8}
                onPress={() => handleTestSelect(test.id)}
              >
                <LinearGradient colors={test.color} className="p-6">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-3xl mr-3">{test.icon}</Text>
                        <View className="flex-1">
                          <Text className="text-xl font-bold text-white">
                            {test.title}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-white/90 mb-3 text-base">
                        {test.description}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="mr-4">
                            <Text className="text-xs text-white/70">
                              Duration
                            </Text>
                            <Text className="text-sm font-semibold text-white">
                              {test.duration}
                            </Text>
                          </View>
                          <View>
                            <Text className="text-xs text-white/70">
                              Difficulty
                            </Text>
                            <Text
                              className={`text-sm font-semibold ${getDifficultyColor(test.difficulty)}`}
                            >
                              {test.difficulty}
                            </Text>
                          </View>
                        </View>
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
                          <Text className="text-white">→</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Instructions */}
          <View className="mx-6 mt-4">
            <View className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <Text className="mb-3 text-lg font-bold text-white">
                Before You Start
              </Text>
              <Text className="mb-2 text-white/90">
                • Make sure you have enough space to perform the tests
              </Text>
              <Text className="mb-2 text-white/90">
                • Ensure your phone camera can record clearly
              </Text>
              <Text className="mb-2 text-white/90">
                • Follow the instructions carefully for accurate results
              </Text>
              <Text className="text-white/90">
                • Complete tests when you're well-rested for best results
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
