import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NovaTheme } from "../../theme/NovaTheme";

// Legacy format (mock data)
interface LegacyFrameResult {
  angle: number;
  counter: number;
  frame: number;
  landmarks_detected: boolean;
  status: boolean;
}

interface LegacyApiResponse {
  exercise_type: string;
  final_counter: number;
  final_status: boolean;
  frame_results: LegacyFrameResult[];
  total_frames: number;
}

// New API format (real sit-up API)
interface CheatDetection {
  is_cheating: boolean;
  feet_cheat: boolean;
  hand_cheat: boolean;
  message: string;
}

interface NewFrameResult {
  frame: number;
  timestamp: number;
  counter: number;
  status: boolean;
  angle: number;
  cheat_detection: CheatDetection;
}

interface NewApiResponse {
  success: boolean;
  file_type: string;
  total_frames_processed: number;
  total_frames_in_video: number;
  final_counter: number;
  final_status: boolean;
  processing_stopped: boolean;
  frame_results: NewFrameResult[];
  video_duration: number;
  fps: number;
  cheat_detected: boolean;
  cheat_detected_at_frame?: number;
  cheat_detected_at_time?: number;
  error_message?: string;
  message?: string;
}

type ApiResponse = LegacyApiResponse | NewApiResponse;

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showFrameDetails, setShowFrameDetails] = useState(false);

  // Optional explicit reps passed via params to avoid large JSON truncation
  const finalCounterParam = (() => {
    const v = params.finalCounter as string | undefined;
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : undefined;
  })();

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

  // Helper function to check if data is new API format
  const isNewApiFormat = (data: ApiResponse): data is NewApiResponse => {
    return "success" in data && "cheat_detected" in data;
  };

  // Calculate performance metrics from API data
  const getPerformanceData = () => {
    if (!analysisData) {
      return {
        exercise: "Assessment",
        score: 0,
        reps: finalCounterParam ?? 0,
        form: "No Data",
        duration: "N/A",
        avgAngle: 0,
        formAccuracy: 0,
        recommendations: ["No analysis data available"],
        cheatDetected: false,
        cheatMessage: null,
      };
    }

    if (isNewApiFormat(analysisData)) {
      // Handle new API format (real sit-up API)
      const {
        frame_results,
        final_counter,
        video_duration,
        cheat_detected,
        error_message,
        total_frames_processed,
      } = analysisData;

      // Calculate average angle during correct form
      const correctFormFrames = frame_results.filter((frame) => frame.status);
      const avgAngle =
        correctFormFrames.length > 0
          ? correctFormFrames.reduce((sum, frame) => sum + frame.angle, 0) /
            correctFormFrames.length
          : 0;

      // Calculate form accuracy percentage
      const formAccuracy =
        frame_results.length > 0
          ? (correctFormFrames.length / frame_results.length) * 100
          : 0;

      // Calculate overall score (reduced if cheating detected)
      const repScore = Math.min(
        (final_counter / getExpectedReps("sit-up")) * 100,
        100
      );
      const formScore = formAccuracy;
      let overallScore = Math.round(repScore * 0.6 + formScore * 0.4);

      // Penalize score if cheating detected
      if (cheat_detected) {
        overallScore = Math.max(overallScore - 30, 0);
      }

      const duration = `${Math.floor(video_duration / 60)}:${Math.floor(
        video_duration % 60
      )
        .toString()
        .padStart(2, "0")}`;

      return {
        exercise: "Sit-ups Test",
        score: overallScore,
        reps: finalCounterParam ?? final_counter,
        form: getFormQuality(formAccuracy),
        duration,
        avgAngle: Math.round(avgAngle),
        formAccuracy: Math.round(formAccuracy),
        recommendations: getRecommendationsNew(analysisData),
        cheatDetected: cheat_detected,
        cheatMessage: error_message || null,
        totalFrames: total_frames_processed,
      };
    } else {
      // Handle legacy format (mock data)
      const { frame_results, exercise_type, total_frames, final_counter } =
        analysisData;

      // Calculate average angle during correct form
      const correctFormFrames = frame_results.filter(
        (frame) =>
          frame.status && (frame as LegacyFrameResult).landmarks_detected
      );
      const avgAngle =
        correctFormFrames.length > 0
          ? correctFormFrames.reduce((sum, frame) => sum + frame.angle, 0) /
            correctFormFrames.length
          : 0;

      // Calculate form accuracy percentage
      const detectedFrames = frame_results.filter(
        (frame) => (frame as LegacyFrameResult).landmarks_detected
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
          .replace(/\b\w/g, (l: string) => l.toUpperCase()),
        score: overallScore,
        reps: finalCounterParam ?? final_counter,
        form: getFormQuality(formAccuracy),
        duration,
        avgAngle: Math.round(avgAngle),
        formAccuracy: Math.round(formAccuracy),
        recommendations: getRecommendations(analysisData as LegacyApiResponse),
        cheatDetected: false,
        cheatMessage: null,
        totalFrames: total_frames,
      };
    }
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

  const getRecommendations = (data: LegacyApiResponse): string[] => {
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

  const getRecommendationsNew = (data: NewApiResponse): string[] => {
    const recommendations: string[] = [];
    const { final_counter, cheat_detected, error_message, frame_results } =
      data;

    // Handle cheating detection
    if (cheat_detected) {
      recommendations.push("⚠️ Cheating detected during the exercise");
      if (error_message?.includes("Hand")) {
        recommendations.push("Avoid using your hands to assist the movement");
        recommendations.push(
          "Keep your hands behind your head or crossed on chest"
        );
      }
      if (error_message?.includes("feet")) {
        recommendations.push("Keep your feet flat on the ground throughout");
      }
      recommendations.push("Focus on proper form rather than speed");
    }

    // Form-based recommendations
    const correctFormFrames = frame_results.filter((frame) => frame.status);
    const formAccuracy =
      (correctFormFrames.length / frame_results.length) * 100;

    if (formAccuracy < 70) {
      recommendations.push("Work on maintaining proper sit-up form");
      recommendations.push("Engage your core muscles throughout the movement");
    }

    // Rep-based recommendations
    if (final_counter < 10) {
      recommendations.push("Build up your core strength with regular practice");
      recommendations.push(
        "Start with shorter sessions and gradually increase"
      );
    } else if (final_counter >= 20) {
      recommendations.push("Excellent performance! Consider adding difficulty");
    }

    // General recommendations
    if (!cheat_detected && formAccuracy >= 80) {
      recommendations.push("Great form! Keep up the excellent technique");
    }

    if (recommendations.length === 0) {
      recommendations.push("Good effort! Continue training consistently");
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
                  {results.totalFrames || "N/A"}
                </Text>
              </View>
              {results.cheatDetected && (
                <View className="flex-row justify-between">
                  <Text className="text-red-400">Cheat Detected:</Text>
                  <Text className="text-red-400 font-semibold">Yes</Text>
                </View>
              )}
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
                      (results.reps / getExpectedReps("sit-up")) * 100,
                      100
                    ).toFixed(0)}
                    %
                  </Text>
                </View>
                <View className="h-2 bg-white/20 rounded-full">
                  <View
                    className="h-2 bg-blue-400 rounded-full"
                    style={{
                      width: `${Math.min((results.reps / getExpectedReps("sit-up")) * 100, 100)}%`,
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
                    {isNewApiFormat(analysisData)
                      ? (analysisData as NewApiResponse).frame_results?.filter(
                          (f: NewFrameResult) => true // New API always has frame data if processed
                        ).length || 0
                      : (
                          analysisData as LegacyApiResponse
                        ).frame_results?.filter(
                          (f: LegacyFrameResult) => f.landmarks_detected
                        ).length || 0}{" "}
                    /{" "}
                    {isNewApiFormat(analysisData)
                      ? (analysisData as NewApiResponse).total_frames_processed
                      : (analysisData as LegacyApiResponse).total_frames}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white/80">Correct Form Frames:</Text>
                  <Text className="text-white font-semibold">
                    {isNewApiFormat(analysisData)
                      ? (analysisData as NewApiResponse).frame_results?.filter(
                          (f: NewFrameResult) => f.status
                        ).length || 0
                      : (
                          analysisData as LegacyApiResponse
                        ).frame_results?.filter(
                          (f: LegacyFrameResult) =>
                            f.status && f.landmarks_detected
                        ).length || 0}
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
                    {(isNewApiFormat(analysisData)
                      ? (analysisData as NewApiResponse).frame_results
                      : (analysisData as LegacyApiResponse).frame_results
                    )
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
                          {isNewApiFormat(analysisData) &&
                            (frame as NewFrameResult).cheat_detection && (
                              <Text className="text-xs text-orange-400">
                                {(frame as NewFrameResult).cheat_detection
                                  .is_cheating
                                  ? "⚠️"
                                  : ""}
                              </Text>
                            )}
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
