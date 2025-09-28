import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NovaTheme } from "../../theme/NovaTheme";

interface FrameResult {
  angle: number;
  counter: number;
  frame: number;
  landmarks_detected: boolean;
  status: boolean;
}

interface ApiResponse {
  exercise_type: string;
  final_counter: number;
  final_status: boolean;
  frame_results: FrameResult[];
  total_frames: number;
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showFrameDetails, setShowFrameDetails] = useState(false);

  // Parse the analysis data from route params
  let analysisData: ApiResponse | null = null;
  let testId = params.testId as string;

  try {
    if (params.analysisData && typeof params.analysisData === "string") {
      analysisData = JSON.parse(params.analysisData);
    }
  } catch (error) {
    console.error("Failed to parse analysis data:", error);
  }

  // Calculate performance metrics from API data
  const getPerformanceData = () => {
    if (!analysisData) {
      return {
        exercise: "Assessment",
        score: 0,
        reps: 0,
        form: "No Data",
        duration: "N/A",
        avgAngle: 0,
        formAccuracy: 0,
        recommendations: ["No analysis data available"],
      };
    }

    const { frame_results, final_counter, exercise_type, total_frames } =
      analysisData;

    // Calculate average angle during correct form
    const correctFormFrames = frame_results.filter(
      (frame) => frame.status && frame.landmarks_detected
    );
    const avgAngle =
      correctFormFrames.length > 0
        ? correctFormFrames.reduce((sum, frame) => sum + frame.angle, 0) /
          correctFormFrames.length
        : 0;

    // Calculate form accuracy percentage
    const detectedFrames = frame_results.filter(
      (frame) => frame.landmarks_detected
    );
    const formAccuracy =
      detectedFrames.length > 0
        ? (correctFormFrames.length / detectedFrames.length) * 100
        : 0;

    // Calculate overall score
    const repScore = Math.min(
      (final_counter / getExpectedReps(exercise_type)) * 100,
      100
    );
    const formScore = formAccuracy;
    const overallScore = Math.round(repScore * 0.6 + formScore * 0.4);

    // Duration in seconds (assuming 30 FPS)
    const durationSeconds = Math.round(total_frames / 30);
    const duration = `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, "0")}`;

    return {
      exercise: exercise_type
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      score: overallScore,
      reps: final_counter,
      form: getFormQuality(formAccuracy),
      duration,
      avgAngle: Math.round(avgAngle),
      formAccuracy: Math.round(formAccuracy),
      recommendations: getRecommendations(analysisData),
    };
  };

  const getExpectedReps = (exerciseType: string): number => {
    switch (exerciseType) {
      case "sit-up":
        return 20;
      case "vertical-jump":
        return 3;
      case "shuttle-run":
        return 1;
      default:
        return 10;
    }
  };

  const getFormQuality = (accuracy: number): string => {
    if (accuracy >= 85) return "Excellent";
    if (accuracy >= 70) return "Good";
    if (accuracy >= 50) return "Fair";
    return "Needs Improvement";
  };

  const getRecommendations = (data: ApiResponse): string[] => {
    const recommendations: string[] = [];
    const { frame_results, exercise_type, final_counter } = data;

    const poorFormFrames = frame_results.filter(
      (frame) => frame.landmarks_detected && !frame.status
    );
    const formAccuracy =
      (frame_results.filter((frame) => frame.landmarks_detected && frame.status)
        .length /
        frame_results.filter((frame) => frame.landmarks_detected).length) *
        100 || 0;

    if (exercise_type === "sit-up") {
      if (formAccuracy < 70) {
        recommendations.push(
          "Focus on keeping your core engaged throughout the movement"
        );
        recommendations.push(
          "Ensure your lower back stays in contact with the ground"
        );
      }
      if (final_counter < 15) {
        recommendations.push(
          "Try to increase your repetitions gradually over time"
        );
      }
      recommendations.push(
        "Maintain controlled movements - avoid rushing through repetitions"
      );
    }

    if (poorFormFrames.length > frame_results.length * 0.3) {
      recommendations.push(
        "Work on maintaining proper form throughout the entire exercise"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Great job! Keep up the consistent training");
      recommendations.push(
        "Consider increasing difficulty or duration for continued progress"
      );
    }

    return recommendations;
  };

  const results = getPerformanceData();

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
    <View style={{ flex: 1, backgroundColor: NovaTheme.colors.background }}>
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
            <Text className="text-lg text-white/80">
              {analysisData ? "AI Analysis Complete" : "Demo Results"}
            </Text>
          </View>

          {/* No Data Message */}
          {!analysisData && (
            <View className="mx-6 mb-8 rounded-2xl bg-orange-500/20 p-6 backdrop-blur-sm">
              <Text className="text-orange-200 text-center text-base mb-2">
                ⚠️ No Analysis Data Available
              </Text>
              <Text className="text-orange-200/80 text-center text-sm">
                Showing demo results. Complete a video analysis to see real AI
                feedback.
              </Text>
            </View>
          )}

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
                <Text className="text-white/80">Average Angle:</Text>
                <Text className="text-white font-semibold">
                  {results.avgAngle}°
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white/80">Total Frames:</Text>
                <Text className="text-white font-semibold">
                  {analysisData?.total_frames || "N/A"}
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
                  <Text className="text-white">Repetitions</Text>
                  <Text className="text-white">
                    {Math.min(
                      (results.reps /
                        getExpectedReps(
                          analysisData?.exercise_type || "sit-up"
                        )) *
                        100,
                      100
                    ).toFixed(0)}
                    %
                  </Text>
                </View>
                <View className="h-2 bg-white/20 rounded-full">
                  <View
                    className="h-2 bg-blue-400 rounded-full"
                    style={{
                      width: `${Math.min((results.reps / getExpectedReps(analysisData?.exercise_type || "sit-up")) * 100, 100)}%`,
                    }}
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white">Form Accuracy</Text>
                  <Text className="text-white">{results.formAccuracy}%</Text>
                </View>
                <View className="h-2 bg-white/20 rounded-full">
                  <View
                    className={`h-2 rounded-full ${
                      results.formAccuracy >= 80
                        ? "bg-green-400"
                        : results.formAccuracy >= 60
                          ? "bg-yellow-400"
                          : "bg-red-400"
                    }`}
                    style={{ width: `${results.formAccuracy}%` }}
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white">Overall Score</Text>
                  <Text className="text-white">{results.score}%</Text>
                </View>
                <View className="h-2 bg-white/20 rounded-full">
                  <View
                    className={`h-2 rounded-full ${
                      results.score >= 80
                        ? "bg-green-400"
                        : results.score >= 60
                          ? "bg-yellow-400"
                          : "bg-red-400"
                    }`}
                    style={{ width: `${results.score}%` }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Frame Analysis Details */}
          {analysisData && (
            <View className="mx-6 mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-white">
                  Frame Analysis
                </Text>
                <TouchableOpacity
                  onPress={() => setShowFrameDetails(!showFrameDetails)}
                  className="rounded-lg bg-white/20 px-3 py-1"
                >
                  <Text className="text-white text-sm">
                    {showFrameDetails ? "Hide" : "Show"} Details
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-white/80">Landmarks Detected:</Text>
                  <Text className="text-white font-semibold">
                    {
                      analysisData.frame_results.filter(
                        (f) => f.landmarks_detected
                      ).length
                    }{" "}
                    / {analysisData.total_frames}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white/80">Correct Form Frames:</Text>
                  <Text className="text-white font-semibold">
                    {
                      analysisData.frame_results.filter(
                        (f) => f.status && f.landmarks_detected
                      ).length
                    }
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white/80">Final Status:</Text>
                  <Text
                    className={`font-semibold ${analysisData.final_status ? "text-green-400" : "text-red-400"}`}
                  >
                    {analysisData.final_status ? "Completed" : "Incomplete"}
                  </Text>
                </View>
              </View>

              {showFrameDetails && (
                <View className="mt-4 max-h-48">
                  <ScrollView
                    className="space-y-1"
                    showsVerticalScrollIndicator={true}
                  >
                    {analysisData.frame_results
                      .filter((_, index) => index % 10 === 0) // Show every 10th frame
                      .map((frame, index) => (
                        <View
                          key={index}
                          className="flex-row justify-between py-1 border-b border-white/10"
                        >
                          <Text className="text-white/60 text-xs">
                            Frame {frame.frame}
                          </Text>
                          <Text className="text-white/60 text-xs">
                            Angle: {frame.angle.toFixed(1)}°
                          </Text>
                          <Text className="text-white/60 text-xs">
                            Rep: {frame.counter}
                          </Text>
                          <Text
                            className={`text-xs ${frame.status ? "text-green-400" : "text-red-400"}`}
                          >
                            {frame.status ? "✓" : "✗"}
                          </Text>
                        </View>
                      ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

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
    </View>
  );
}
