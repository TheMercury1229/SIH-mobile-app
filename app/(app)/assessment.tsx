import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  ArrowRight,
  ArrowUp,
  Clock,
  Heart,
  Zap,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NovaTheme } from "../../theme/NovaTheme";

export default function AssessmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cheatFlag = params.cheat === "1";
  const cheatMsg = (params.msg as string) || "Cheating was detected. Please retry the test.";
  const cheatTestId = (params.testId as string) || "sit-ups";
  const [showCheatBanner, setShowCheatBanner] = useState(cheatFlag);

  const tests = [
    {
      id: "vertical-jump",
      title: "Vertical Jump Test",
      description: "Measure your explosive power and leg strength",
      duration: "5 min",
      difficulty: "Easy",
      icon: ArrowUp,
    },
    {
      id: "shuttle-run",
      title: "Shuttle Run Test",
      description: "Test your agility and speed",
      duration: "10 min",
      difficulty: "Medium",
      icon: Zap,
    },
    {
      id: "sit-ups",
      title: "Sit-ups Test",
      description: "Assess your core strength and endurance",
      duration: "15 sec",
      difficulty: "Easy",
      icon: Activity,
    },
    {
      id: "endurance-run",
      title: "Endurance Run Test",
      description: "Evaluate your cardiovascular fitness",
      duration: "20 min",
      difficulty: "Hard",
      icon: Heart,
    },
  ];

  const handleTestSelect = (testId: string) => {
    router.push(`/(app)/test/${testId}` as any);
  };

  const handleDismissBanner = () => {
    setShowCheatBanner(false);
    // best-effort clear of params to avoid re-showing
    try {
      router.setParams({ cheat: undefined, msg: undefined, testId: undefined } as any);
    } catch {}
  };

  const handleRetry = () => {
    router.push({ pathname: "/(app)/test/[id]", params: { id: cheatTestId } } as any);
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
          {/* Cheating Banner */}
          {showCheatBanner && (
            <View className="px-6 mb-4">
              <View className="rounded-2xl border border-red-500/40 bg-red-500/15 p-4">
                <Text className="text-red-300 font-semibold mb-1">Cheating detected</Text>
                <Text className="text-red-200/90 mb-3">{cheatMsg}</Text>
                <View className="flex-row justify-end space-x-3">
                  <TouchableOpacity
                    className="rounded-lg bg-white/10 px-4 py-2"
                    onPress={handleDismissBanner}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white">Dismiss</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-lg px-4 py-2"
                    style={{ backgroundColor: NovaTheme.colors.primary }}
                    onPress={handleRetry}
                    activeOpacity={0.85}
                  >
                    <Text className="text-white font-semibold">Retry {cheatTestId.replace("-"," ")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          <View className="px-6">
            {tests.map((test, index) => (
              <TouchableOpacity
                key={test.id}
                className="mb-4 overflow-hidden rounded-2xl"
                activeOpacity={0.8}
                onPress={() => handleTestSelect(test.id)}
              >
                <View
                  style={{ backgroundColor: NovaTheme.colors.surface }}
                  className="p-6"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View className="mr-3">
                          <test.icon
                            size={24}
                            color={NovaTheme.colors.primary}
                          />
                        </View>
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
                          <View className="mr-4 flex-row items-center">
                            <Clock
                              size={14}
                              color={NovaTheme.colors.textSecondary}
                            />
                            <View className="ml-1">
                              <Text className="text-xs text-white/70">
                                Duration
                              </Text>
                              <Text className="text-sm font-semibold text-white">
                                {test.duration}
                              </Text>
                            </View>
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
                        <View
                          className="h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: NovaTheme.colors.primary }}
                        >
                          <ArrowRight
                            size={16}
                            color={NovaTheme.colors.textPrimary}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
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
                • All tests require face verification before recording (3-5
                seconds)
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
    </View>
  );
}
