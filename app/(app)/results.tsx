import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResultsScreen() {
  const router = useRouter();

  const results = {
    exercise: "Push-ups",
    score: 85,
    reps: 15,
    form: "Good",
    duration: "30 seconds",
    recommendations: [
      "Keep your core engaged throughout the movement",
      "Try to maintain a straight line from head to heels",
      "Focus on controlled movements rather than speed",
    ],
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Header */}
          <View className="px-6 pt-6 pb-8">
            <Text className="text-3xl font-bold text-white mb-2">
              Assessment Results
            </Text>
            <Text className="text-lg text-white/80">AI Analysis Complete</Text>
          </View>

          {/* Score Card */}
          <View className="mx-6 mb-8 rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
            <View className="items-center mb-6">
              <Text className="text-6xl font-bold text-white mb-2">
                {results.score}
              </Text>
              <Text
                className={`text-2xl font-bold ${getScoreColor(results.score)}`}
              >
                {getScoreLabel(results.score)}
              </Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row justify-between">
                <Text className="text-white/80">Exercise:</Text>
                <Text className="text-white font-semibold">
                  {results.exercise}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white/80">Repetitions:</Text>
                <Text className="text-white font-semibold">{results.reps}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white/80">Form Quality:</Text>
                <Text className="text-white font-semibold">{results.form}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white/80">Duration:</Text>
                <Text className="text-white font-semibold">
                  {results.duration}
                </Text>
              </View>
            </View>
          </View>

          {/* Detailed Analysis */}
          <View className="mx-6 mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <Text className="text-xl font-bold text-white mb-4">
              Performance Breakdown
            </Text>

            {/* Progress Bars */}
            <View className="space-y-4">
              <View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white">Strength</Text>
                  <Text className="text-white">80%</Text>
                </View>
                <View className="h-2 bg-white/20 rounded-full">
                  <View
                    className="h-2 bg-green-400 rounded-full"
                    style={{ width: "80%" }}
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white">Form</Text>
                  <Text className="text-white">75%</Text>
                </View>
                <View className="h-2 bg-white/20 rounded-full">
                  <View
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{ width: "75%" }}
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white">Endurance</Text>
                  <Text className="text-white">90%</Text>
                </View>
                <View className="h-2 bg-white/20 rounded-full">
                  <View
                    className="h-2 bg-green-400 rounded-full"
                    style={{ width: "90%" }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Recommendations */}
          <View className="mx-6 mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <Text className="text-xl font-bold text-white mb-4">
              💡 Recommendations
            </Text>

            {results.recommendations.map((recommendation, index) => (
              <View key={index} className="flex-row items-start mb-3 last:mb-0">
                <Text className="text-blue-300 mr-2">•</Text>
                <Text className="text-white/90 flex-1">{recommendation}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="px-6 space-y-4">
            <TouchableOpacity
              className="rounded-xl bg-white px-6 py-4"
              onPress={() => router.push("/(app)/assessment")}
              activeOpacity={0.9}
            >
              <Text className="text-center text-lg font-semibold text-purple-600">
                Try Another Assessment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm"
              onPress={() => router.push("/(app)/home")}
              activeOpacity={0.8}
            >
              <Text className="text-center text-lg font-semibold text-white">
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
