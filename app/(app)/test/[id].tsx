import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoSubmission } from "../../../hooks/useVideoSubmission";
import { useFaceVerification } from "../../../hooks/useFaceVerification";

export default function TestScreen() {
  const router = useRouter();
  const { testId, recordingComplete, videoUri, faceImageUri } = useLocalSearchParams();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [isFaceVerified, setIsFaceVerified] = useState(false);

  // Video submission hook
  const { submitVideo, isSubmitting, progress } = useVideoSubmission();
  const { verifyFace, isVerifying } = useFaceVerification();

  // Ensure testId is a string
  const testIdStr =
    typeof testId === "string"
      ? testId
      : Array.isArray(testId)
        ? testId[0]
        : undefined;

  // Check if returning from camera with completed recording
  useFocusEffect(
    useCallback(() => {
      // Handle face image returned from camera for verification
      const maybeVerify = async () => {
        if (typeof faceImageUri === "string") {
          try {
            const res = await verifyFace(faceImageUri);
            if (res.success && res.verified) {
              setIsFaceVerified(true);
              Alert.alert("Face Verification", "Verification successful. You can proceed to Sit-ups recording.");
            } else {
              setIsFaceVerified(false);
              Alert.alert("Face Verification Failed", res.error || "Your face could not be verified. Please try again.");
            }
          } catch (e) {
            setIsFaceVerified(false);
            Alert.alert("Face Verification Error", "An error occurred during verification. Please try again.");
          } finally {
            // Clear the param to prevent re-triggering
            router.setParams({ faceImageUri: undefined });
          }
        }
      };
      maybeVerify();

      if (recordingComplete === "true") {
        // Set recorded video URI from camera params
        const recUri = typeof videoUri === "string" ? videoUri : null;
        setRecordedVideoUri(recUri);
        setHasRecorded(true);
        // Clear the param to prevent triggering again
        router.setParams({ recordingComplete: undefined, videoUri: undefined });
        // Auto-submit once we have a recording
        if (recUri) {
          // Defer to allow state updates to flush before submit
          setTimeout(() => {
            handleSubmitTest();
          }, 0);
        }
      }
    }, [recordingComplete, videoUri, faceImageUri])
  );

  const testData: Record<string, any> = {
    "vertical-jump": {
      title: "Vertical Jump Test",
      icon: "🦘",
      color: ["#fb923c", "#ec4899"],
      instructions: [
        "Stand with your feet shoulder-width apart",
        "Position yourself sideways to the camera (about 2 meters away)",
        "Keep your hands on your hips throughout the movement",
        "Bend your knees and jump as high as possible",
        "Land softly with bent knees",
        "Perform 3 attempts with 30 seconds rest between each",
      ],
      tips: [
        "Warm up with light jumping before recording",
        "Make sure the camera captures your full body",
        "Jump straight up, avoid forward movement",
      ],
    },
    "shuttle-run": {
      title: "Shuttle Run Test",
      icon: "🏃‍♂️",
      color: ["#60a5fa", "#a855f7"],
      instructions: [
        "Set up two cones/markers 10 meters apart",
        "Position camera to capture the entire running distance",
        "Start at one cone, sprint to the other cone",
        "Touch the cone and immediately sprint back",
        "Continue for 30 seconds at maximum speed",
        "Count the number of times you touch each cone",
      ],
      tips: [
        "Use proper running technique with arm drive",
        "Stay low when changing direction",
        "Maintain maximum effort throughout",
      ],
    },
    "sit-ups": {
      title: "Sit-ups Test",
      icon: "💪",
      color: ["#4ade80", "#3b82f6"],
      instructions: [
        "Lie flat on your back on a comfortable surface",
        "Bend your knees at 90 degrees, feet flat on the ground",
        "Position camera to capture your full side profile (2-3 meters away)",
        "Cross your arms over your chest or place hands behind head",
        "Engage your core and curl up until your elbows touch your knees",
        "Lower back down until your shoulder blades touch the ground",
        "Perform as many complete repetitions as possible in 60 seconds",
        "Maintain proper form throughout - quality over quantity",
      ],
      tips: [
        "Keep your feet firmly planted throughout the exercise",
        "Use your abdominal muscles, not momentum or neck strain",
        "Breathe out as you come up, breathe in as you go down",
        "Ensure the camera captures your full range of motion",
        "Warm up with light stretching before starting",
        "Focus on controlled movements for better AI analysis",
      ],
    },
    "endurance-run": {
      title: "Endurance Run Test",
      icon: "🏃‍♀️",
      color: ["#a855f7", "#ec4899"],
      instructions: [
        "Find a safe outdoor running area or use a treadmill",
        "Position camera to capture your starting position",
        "Run at a steady, sustainable pace for 12 minutes",
        "Try to maintain the same speed throughout",
        "Measure the total distance covered",
        "Cool down with light walking after completion",
        "Start at a comfortable pace you can maintain",
        "Focus on consistent breathing",
        "Track your distance using a fitness app",
      ],
    },
  };

  const currentTest = testData[testIdStr ?? "sit-ups"] || testData["sit-ups"];

  const handleStartRecording = () => {
    // Navigate to camera screen with test parameters
    const duration =
      testIdStr === "endurance-run"
        ? "720" // 12 minutes
        : testIdStr === "shuttle-run"
          ? "30" // 30 seconds
          : testIdStr === "vertical-jump"
            ? "60" // 1 minute for vertical jump (3 attempts)
            : "60"; // default 1 minute for sit-ups

    router.push({
      pathname: "/(app)/camera",
      params: {
        exercise: currentTest.title,
        duration: `${duration} seconds`,
        testId: testIdStr,
        returnTo: "test",
        mode: "video",
      },
    });
  };

  const handleStartFaceVerification = () => {
    // Navigate to camera in photo mode for face verification
    router.push({
      pathname: "/(app)/camera",
      params: {
        exercise: "Face Verification",
        testId: testIdStr,
        returnTo: "test",
        mode: "photo",
      },
    });
  };

  const handleSubmitTest = async () => {
    if (!hasRecorded) {
      Alert.alert("No Recording", "Please record your test first.");
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    const videoUriToSend = recordedVideoUri;
    if (!videoUriToSend) {
      Alert.alert("Error", "No video found to submit.");
      return;
    }

    try {
      const result = await submitVideo(videoUriToSend, testIdStr || "sit-ups");

      if (result.success) {
        Alert.alert(
          "Analysis Complete!",
          `Your ${currentTest.title} has been successfully analyzed. Check your results!`,
          [
            {
              text: "View Results",
              onPress: () => {
                // You can pass the analysis results to the results screen
                router.push({
                  pathname: "/(app)/results",
                  params: {
                    testId: testIdStr,
                    analysisData: JSON.stringify(result.data),
                  },
                });
              },
            },
            {
              text: "Back to Assessment",
              onPress: () => router.replace("/(app)/assessment"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Analysis Failed",
          result.error || "Failed to analyze video. Please try again.",
          [
            { text: "Try Again" },
            {
              text: "Back to Assessment",
              onPress: () => router.replace("/(app)/assessment"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Submit test error:", error);
      Alert.alert(
        "Submission Error",
        "An unexpected error occurred. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <LinearGradient colors={currentTest.color} className="flex-1">
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
            <View className="flex-1 items-center">
              <Text className="text-3xl">{currentTest.icon}</Text>
              <Text className="text-lg font-bold text-white">
                {currentTest.title}
              </Text>
            </View>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Instructions */}
          <View className="mx-6 mb-6">
            <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <Text className="mb-4 text-xl font-bold text-white">
                Instructions
              </Text>
              {currentTest.instructions.map(
                (instruction: string, index: number) => (
                  <View key={index} className="mb-2 flex-row">
                    <Text className="mr-2 text-white/90">{index + 1}.</Text>
                    <Text className="flex-1 text-white/90">{instruction}</Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Tips */}
          <View className="mx-6 mb-6">
            <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <Text className="mb-4 text-xl font-bold text-white">
                Pro Tips
              </Text>
              {currentTest.tips.map((tip: string, index: number) => (
                <View key={index} className="mb-2 flex-row items-start">
                  <Text className="mr-2 text-yellow-300">💡</Text>
                  <Text className="flex-1 text-white/90">{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Face Verification Section (required for Sit-ups) */}
          {testIdStr === "sit-ups" && (
            <View className="mx-6 mb-6">
              <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
                <Text className="mb-1 text-sm font-semibold text-white/80">Step 1</Text>
                <Text className="mb-2 text-xl font-bold text-white">Face Verification</Text>
                <Text className="mb-4 text-sm text-white/70">
                  Please verify your face before proceeding to Sit-ups recording.
                </Text>
                <View className="mb-4 rounded-xl bg-black/30 p-4 items-center">
                  <Text className="text-5xl">🙂</Text>
                  <Text className="mt-2 text-white/80">
                    {isFaceVerified ? "Verified" : isVerifying ? "Verifying..." : "Not Verified"}
                  </Text>
                </View>
                {!isFaceVerified && (
                  <TouchableOpacity
                    className="rounded-xl bg-blue-500 px-6 py-4 shadow-lg"
                    onPress={handleStartFaceVerification}
                    disabled={isVerifying}
                    activeOpacity={0.8}
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      {isVerifying ? "Verifying..." : "Start Face Verification"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Sit-up Recording Section */}
          {/* Camera Section */}
          <View className="mx-6 mb-6">
            <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <Text className="mb-1 text-sm font-semibold text-white/80">{testIdStr === "sit-ups" ? "Step 2" : ""}</Text>
              <Text className="mb-4 text-xl font-bold text-white">
                {testIdStr === "sit-ups" ? "Sit-ups Recording" : "Video Recording"}
              </Text>
              <Text className="mb-4 text-sm text-white/70">
                💡 Record your test using the camera. Upload from device is disabled.
              </Text>

              {!hasRecorded ? (
                <>
                  <Text className="mb-4 text-center text-white/90">
                    Start recording your {currentTest.title.toLowerCase()} video
                  </Text>
                  <View className="mb-4 h-48 items-center justify-center rounded-xl bg-black/30">
                    <Text className="text-6xl">🎥</Text>
                    <Text className="mt-2 text-white/70">
                      {testIdStr === "sit-ups" && !isFaceVerified
                        ? "Face verification required"
                        : "Ready to Submit"}
                    </Text>
                    <Text className="mt-1 text-white/50 text-sm">
                      Duration: {" "}
                      {testIdStr === "endurance-run"
                        ? "12 minutes"
                        : testIdStr === "sit-ups"
                          ? "1 minute"
                          : testIdStr === "shuttle-run"
                            ? "30 seconds"
                            : "1 minute"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="rounded-xl bg-red-500 px-6 py-4 shadow-lg"
                    onPress={handleStartRecording}
                    disabled={
                      isRecording || (testIdStr === "sit-ups" && !isFaceVerified)
                    }
                    activeOpacity={0.8}
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      {testIdStr === "sit-ups" && !isFaceVerified
                        ? "Complete Face Verification First"
                        : "🎬 Start Camera Recording"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text className="mb-4 text-center text-white/90">
                    Great! Your {currentTest.title.toLowerCase()} has been
                    recorded
                  </Text>
                  <View className="mb-4 h-48 items-center justify-center rounded-xl bg-black/30">
                    <Text className="text-6xl">✅</Text>
                    <Text className="mt-2 text-white/70">Recording Complete</Text>
                    <Text className="mt-1 text-white/50 text-sm">From Camera</Text>
                    <Text className="mt-1 text-white/40 text-xs">
                      Ready for AI analysis
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="mb-3 rounded-xl bg-white/20 px-6 py-4"
                    onPress={() => {
                      setHasRecorded(false);
                      setIsRecording(false);
                      setRecordedVideoUri(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      🔄 Record Again
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            className={`rounded-xl px-6 py-4 ${
              hasRecorded && !isSubmitting ? "bg-green-500" : "bg-white/20"
            }`}
            onPress={handleSubmitTest}
            disabled={!hasRecorded || isSubmitting}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              {isSubmitting && (
                <ActivityIndicator
                  size="small"
                  color="white"
                  className="mr-2"
                />
              )}
              <Text className="text-center text-lg font-semibold text-white">
                {isSubmitting
                  ? `Analyzing...`
                  : hasRecorded
                    ? "Submit for AI Analysis"
                    : "Complete Recording First"}
              </Text>
            </View>
          </TouchableOpacity>
          {isSubmitting && (
            <View className="mt-3 rounded-xl bg-white/10 p-4">
              <Text className="text-center text-white/80 text-sm">
                🤖 AI is analyzing your {currentTest.title.toLowerCase()}...
              </Text>
              <Text className="text-center text-white/60 text-xs mt-1">
                This may take a few minutes
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
