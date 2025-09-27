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
  const { 
    id,
    testId, 
    recordingComplete, 
    videoUri, 
    faceImageUri, 
    faceVerificationVideoUri 
  } = useLocalSearchParams();
  
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [isFaceVerified, setIsFaceVerified] = useState(false);

  // Video submission hook
  const { submitVideo, isSubmitting, progress } = useVideoSubmission();
  const { verifyFace, isVerifying } = useFaceVerification();

  // Ensure testId is a string, supporting both dynamic route param `id` and optional `testId`
  const testIdStr =
    typeof testId === "string"
      ? testId
      : typeof id === "string"
        ? id
        : Array.isArray(testId)
          ? testId[0]
          : Array.isArray(id)
            ? id[0]
            : undefined;
  console.log("Test ID:", testIdStr);
  useFocusEffect(
    useCallback(() => {
      console.log("=== useFocusEffect triggered ===");
      console.log("faceImageUri:", faceImageUri);
      // console.log("faceVerificationVideoUri:", faceVerificationVideoUri);
      console.log("recordingComplete:", recordingComplete);
      console.log("videoUri:", videoUri);
      
      // Handle face image (extracted frame from video)
      const processFaceImage = async () => {
        if (typeof faceImageUri === "string" && faceImageUri !== "extracting") {
          console.log("=== FACE VERIFICATION WITH IMAGE STARTED ===");
          console.log("Processing face image:", faceImageUri);
          
          try {
            console.log("Calling verifyFace with extracted image...");
            
            // Verify the extracted image directly
            const res = await verifyFace(faceImageUri);
            
            console.log("Face verification result:", res);
            
            if (res.success && res.verified) {
              console.log("✅ Face verification successful");
              setIsFaceVerified(true);
              Alert.alert(
                "Face Verification Successful!", 
                "Your face has been verified. You can now proceed to record your sit-ups exercise.",
                [{ text: "Continue", style: "default" }]
              );
            } else {
              console.log("❌ Face verification failed:", res.error);
              setIsFaceVerified(false);
              Alert.alert(
                "Face Verification Failed", 
                res.error || "Your face could not be verified from the image. Please try again with better lighting and ensure your face is clearly visible.",
                [
                  { text: "Try Again", onPress: () => handleStartFaceVerification() },
                  { text: "Cancel", style: "cancel" }
                ]
              );
            }
          } catch (e) {
            setIsFaceVerified(false);
            console.error("Face verification exception:", e);
            Alert.alert(
              "Face Verification Error", 
              "An error occurred during face verification. Please try again.",
              [
                { text: "Try Again", onPress: () => handleStartFaceVerification() },
                { text: "Cancel", style: "cancel" }
              ]
            );
          } finally {
            console.log("Clearing faceImageUri param");
            // Clear the param to prevent re-triggering
            router.setParams({ faceImageUri: undefined });
          }
        } else if (faceImageUri === "extracting") {
          console.log("Frame extraction still in progress...");
          // Could show a loading state here if needed
        } else {
          console.log("No face image URI found");
        }
      };

      // Legacy video-based verification removed; image-based verification is used instead

      // Handle exercise recording completion
      const handleExerciseRecording = () => {
        if (recordingComplete === "true") {
          // Set recorded video URI from camera params
          const recUri = typeof videoUri === "string" ? videoUri : null;
          setRecordedVideoUri(recUri);
          setHasRecorded(true);
          
          // Clear the param to prevent triggering again
          router.setParams({ recordingComplete: undefined, videoUri: undefined });
          
          // Show success message and ask user to submit
          if (recUri) {
            Alert.alert(
              "Exercise Recording Complete!",
              "Your sit-ups video has been recorded successfully and converted to MP4 format. Ready to submit for AI analysis?",
              [
                {
                  text: "Submit Now",
                  onPress: () => {
                    setTimeout(() => {
                      handleSubmitTest();
                    }, 100);
                  }
                },
                {
                  text: "Review First",
                  style: "cancel"
                }
              ]
            );
          }
        }
      };

      // Execute all handlers - prioritize face image over face video
      processFaceImage();
      handleExerciseRecording();

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
    // Navigate to camera in VIDEO mode for face verification (not photo)
    router.push({
      pathname: "/(app)/camera",
      params: {
        exercise: "Face Verification",
        duration: "10 seconds", // Short video for face verification
        testId: testIdStr,
        returnTo: "test",
        mode: "video", // Changed from "photo" to "video"
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

    // Validate that the video is in MP4 format
    if (!videoUriToSend.toLowerCase().includes('.mp4')) {
      Alert.alert(
        "Video Format Error", 
        "The video must be in MP4 format. Please record again.",
        [{ text: "Record Again", onPress: () => setHasRecorded(false) }]
      );
      return;
    }

    try {
      console.log("Submitting MP4 video:", videoUriToSend);
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
                  Record a short video of your face for verification before proceeding to exercise recording.
                </Text>
                <View className="mb-4 rounded-xl bg-black/30 p-4 items-center">
                  <Text className="text-5xl">🎥</Text>
                  <Text className="mt-2 text-white/80">
                    {isFaceVerified 
                      ? "✅ Face Verified" 
                      : isVerifying 
                        ? "🔄 Verifying..." 
                        : "❌ Not Verified"}
                  </Text>
                  {isVerifying && (
                    <Text className="mt-1 text-white/60 text-xs">
                      Processing verification...
                    </Text>
                  )}
                </View>
                {!isFaceVerified && (
                  <TouchableOpacity
                    className="rounded-xl bg-blue-500 px-6 py-4 shadow-lg"
                    onPress={handleStartFaceVerification}
                    activeOpacity={0.8}
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      {isVerifying ? "Processing..." : "🎬 Record Face Verification Video"}
                    </Text>
                  </TouchableOpacity>
                )}
                {isFaceVerified && (
                  <View className="rounded-xl bg-green-500/20 px-6 py-4 border border-green-500/30">
                    <Text className="text-center text-lg font-semibold text-green-300">
                      Face verification complete! You can now record your exercise.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Exercise Recording Section */}
          <View className="mx-6 mb-6">
            <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <Text className="mb-1 text-sm font-semibold text-white/80">
                {testIdStr === "sit-ups" ? "Step 2" : ""}
              </Text>
              <Text className="mb-4 text-xl font-bold text-white">
                {testIdStr === "sit-ups" ? "Exercise Recording" : "Video Recording"}
              </Text>
              <Text className="mb-4 text-sm text-white/70">
                Record your exercise performance. The video will be converted to MP4 format automatically.
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
                        ? "Complete face verification first"
                        : "Ready to record exercise"}
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
                    <Text className="mt-1 text-white/40 text-xs">
                      Will be converted to MP4 format
                    </Text>
                  </View>
                  <TouchableOpacity
                    className={`rounded-xl px-6 py-4 shadow-lg ${
                      (testIdStr === "sit-ups" && !isFaceVerified) || isRecording
                        ? "bg-gray-500"
                        : "bg-red-500"
                    }`}
                    onPress={handleStartRecording}
                    disabled={
                      isRecording || (testIdStr === "sit-ups" && !isFaceVerified)
                    }
                    activeOpacity={0.8}
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      {testIdStr === "sit-ups" && !isFaceVerified
                        ? "Complete Face Verification First"
                        : "🎬 Start Exercise Recording"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text className="mb-4 text-center text-white/90">
                    Exercise recording completed successfully!
                  </Text>
                  <View className="mb-4 h-48 items-center justify-center rounded-xl bg-black/30">
                    <Text className="text-6xl">✅</Text>
                    <Text className="mt-2 text-white/70">Recording Complete</Text>
                    <Text className="mt-1 text-white/50 text-sm">MP4 Format</Text>
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
                  ? `Analyzing MP4 Video...${progress > 0 ? ` ${progress}%` : ''}`
                  : hasRecorded
                    ? "Submit MP4 for AI Analysis"
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
                Processing MP4 video - This may take a few minutes
              </Text>
              {progress > 0 && (
                <View className="mt-2 bg-white/20 rounded-full h-2">
                  <View 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${progress}%` }}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}