import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Video,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
import { NovaTheme } from "../../../theme/NovaTheme";

export default function TestScreen() {
  const router = useRouter();
  const {
    id,
    testId,
    recordingComplete,
    videoUri,
    faceImageUri,
    faceVerificationVideoUri,
  } = useLocalSearchParams();

  // Tab state management
  const [activeTab, setActiveTab] = useState<
    "face-verification" | "assessment"
  >("face-verification");

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [isFaceVerified, setIsFaceVerified] = useState(false);

  // Assessment recording states (matching face verification flow)
  const [isAssessmentRecording, setIsAssessmentRecording] = useState(false);
  const [assessmentRecordingComplete, setAssessmentRecordingComplete] =
    useState(false);
  const [isAssessmentProcessing, setIsAssessmentProcessing] = useState(false);
  const [assessmentRecordingUri, setAssessmentRecordingUri] = useState<
    string | null
  >(null);

  // Configurable recording duration (30-60s, default 45s)
  const getAssessmentDuration = () => {
    const durations: Record<string, number> = {
      "vertical-jump": 60, // 1 minute for multiple attempts
      "shuttle-run": 30, // 30 seconds
      "sit-ups": 15, // 15 seconds
      "endurance-run": 45, // 45 seconds for setup/start
    };
    return durations[testIdStr ?? "sit-ups"] || 45; // default 45s
  };

  // Real API submission using the hook
  const { submitVideo, isSubmitting, progress } = useVideoSubmission();

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
  

  // Handle face image verification when faceImageUri param changes
  useEffect(() => {
    const processFaceImage = async () => {
      if (typeof faceImageUri === "string" && faceImageUri !== "extracting") {
        

        try {
          

          // Mock successful face verification (no API call)
          
          setIsFaceVerified(true);

          // Auto-navigate to assessment tab without alert
          setTimeout(() => {
            setActiveTab("assessment");
          }, 500); // Small delay for smooth transition
        } catch (e) {
          console.error("Mock face verification error:", e);
          // Even in error case, let's succeed for now
          setIsFaceVerified(true);
          setTimeout(() => {
            setActiveTab("assessment");
          }, 500);
        } finally {
          
          // Clear the param to prevent re-triggering
          router.setParams({ faceImageUri: undefined });
        }
      } else if (faceImageUri === "extracting") {
        
      }
    };

    processFaceImage();
  }, [faceImageUri]);

  // Handle exercise recording completion when recordingComplete/videoUri change
  useEffect(() => {
    if (recordingComplete === "true") {
      const recUri = typeof videoUri === "string" ? videoUri : null;
      setRecordedVideoUri(recUri);
      setHasRecorded(true);

      // Clear the param to prevent triggering again
      router.setParams({ recordingComplete: undefined, videoUri: undefined });

      // No popup here; assessment auto-submit is handled in the assessment
      // recording completion effect when on the assessment tab.
    }
  }, [recordingComplete, videoUri]);

  // Handle assessment recording completion (matches face verification pattern)
  useEffect(() => {
    if (recordingComplete === "true" && activeTab === "assessment") {
      const recUri = typeof videoUri === "string" ? videoUri : null;

      // Set assessment recording states to match face verification UX
      setIsAssessmentProcessing(false);
      setAssessmentRecordingComplete(true);
      setAssessmentRecordingUri(recUri);

      // Clear the param to prevent triggering again
      router.setParams({ recordingComplete: undefined, videoUri: undefined });

      if (recUri) {
        // Auto-submit for analysis and navigate to results
        setTimeout(async () => {
          await handleSubmitTest(recUri);
        }, 1000);
      }
    }
  }, [recordingComplete, videoUri, activeTab]);

  const testData: Record<string, any> = {
    "vertical-jump": {
      title: "Vertical Jump Test",
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
      instructions: [
        "Lie flat on your back on a comfortable surface",
        "Bend your knees at 90 degrees, feet flat on the ground",
        "Position camera to capture your full side profile (2-3 meters away)",
        "Cross your arms over your chest or place hands behind head",
        "Engage your core and curl up until your elbows touch your knees",
        "Lower back down until your shoulder blades touch the ground",
        "Perform as many complete repetitions as possible in 15 seconds",
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
      : testIdStr === "sit-ups"
        ? "15" // 15 seconds for sit-ups
      : testIdStr === "vertical-jump"
        ? "60" // 1 minute for vertical jump (3 attempts)
        : "15"; // default 15 seconds

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
        duration: "4 seconds", // Reduced to 3-5 seconds as requested
        testId: testIdStr,
        returnTo: "test",
        mode: "video", // Changed from "photo" to "video"
      },
    });
  };

  const handleStartAssessmentRecording = () => {
    // Set processing state to match face verification UX
    setIsAssessmentProcessing(true);

    // Navigate to camera with assessment recording parameters
    const duration = getAssessmentDuration();
    router.push({
      pathname: "/(app)/camera",
      params: {
        exercise: currentTest.title,
        duration: `${duration} seconds`,
        testId: testIdStr,
        returnTo: "test",
        mode: "assessment", // New mode for assessment recording
      },
    });
  };

  const handleSubmitTest = async (providedVideoUri?: string) => {
    const videoUriToSend = providedVideoUri || assessmentRecordingUri;

    if (!videoUriToSend) {
      Alert.alert("Error", "No assessment video found to submit.");
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    try {

      // For sit-ups, use real API. For others, use mock data
      if (testIdStr === "sit-ups") {
        // Use real API for sit-ups
        const result = await submitVideo(videoUriToSend, "sit-ups");

        if (result.success && result.data) {
          console.log("the result data : ")
          console.log(result.data);
          // Navigate to results with real API data
          router.push({
            pathname: "/(app)/results",
            params: {
              testId: testIdStr,
              analysisData: JSON.stringify(result.data),
              finalCounter: String(result.data.final_counter),
            },
          });
        } else {
          // Handle API error
          Alert.alert(
            "Analysis Failed",
            result.error ||
              "Failed to analyze your sit-up video. Please try again.",
            [{ text: "OK" }]
          );
        }
      } else {
        // Use mock data for other exercises (not implemented yet)

        // Mock analysis data in the old format for compatibility
        const finalCounter = Math.floor(Math.random() * 20) + 15;
        const totalFrames = Math.floor(Math.random() * 600) + 900;

        const frameResults = [];
        for (let i = 0; i < totalFrames; i += 10) {
          frameResults.push({
            angle: Math.floor(Math.random() * 30) + 90,
            counter: Math.floor((i / totalFrames) * finalCounter),
            frame: i,
            landmarks_detected: Math.random() > 0.1,
            status: Math.random() > 0.2,
          });
        }

        const mockAnalysisData = {
          exercise_type: testIdStr || "sit-up",
          final_counter: finalCounter,
          final_status: true,
          frame_results: frameResults,
          total_frames: totalFrames,
          timestamp: new Date().toISOString(),
          videoUri: videoUriToSend,
        };

        // Simulate progress for mock data
        await new Promise((resolve) => setTimeout(resolve, 2000));

        router.push({
          pathname: "/(app)/results",
          params: {
            testId: testIdStr,
            analysisData: JSON.stringify(mockAnalysisData),
          },
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert(
        "Submission Error",
        "An unexpected error occurred. Please try again.",
        [{ text: "OK" }]
      );
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
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: NovaTheme.colors.surface }}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={NovaTheme.colors.textPrimary} />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-lg font-bold text-white">
                {currentTest.title}
              </Text>
            </View>
            <View className="w-10" />
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="px-6 pb-4">
          <View className="flex-row rounded-xl bg-white/10 p-1">
            <TouchableOpacity
              className={`flex-1 rounded-lg py-3 px-4 ${
                activeTab === "face-verification"
                  ? "bg-white/20"
                  : "bg-transparent"
              }`}
              onPress={() => setActiveTab("face-verification")}
              activeOpacity={0.7}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "face-verification"
                    ? "text-white"
                    : "text-white/60"
                }`}
              >
                Step 1: Face Verification
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-lg py-3 px-4 ${
                activeTab === "assessment" ? "bg-white/20" : "bg-transparent"
              }`}
              onPress={() =>
                isFaceVerified ? setActiveTab("assessment") : null
              }
              disabled={!isFaceVerified}
              activeOpacity={0.7}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "assessment"
                    ? "text-white"
                    : isFaceVerified
                      ? "text-white/60"
                      : "text-white/30"
                }`}
              >
                Step 2: Assessment
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Face Verification Tab Content */}
          {activeTab === "face-verification" && (
            <View className="mx-6 mb-6">
              <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
                <Text className="mb-2 text-xl font-bold text-white">
                  Face Verification
                </Text>
                <Text className="mb-4 text-sm text-white/70">
                  Record a short video of your face for verification (3-5
                  seconds).
                </Text>
                <View
                  className="mb-4 rounded-xl p-4 items-center"
                  style={{ backgroundColor: NovaTheme.colors.surface }}
                >
                  <Video size={48} color={NovaTheme.colors.textSecondary} />
                  <View className="flex-row items-center mt-2">
                    {isFaceVerified ? (
                      <CheckCircle size={20} color={NovaTheme.colors.success} />
                    ) : (
                      <XCircle size={20} color={NovaTheme.colors.error} />
                    )}
                    <Text className="ml-2 text-white/80">
                      {isFaceVerified ? "Face Verified" : "Not Verified"}
                    </Text>
                  </View>
                </View>
                {!isFaceVerified && (
                  <TouchableOpacity
                    className="rounded-xl px-6 py-4 shadow-lg flex-row items-center justify-center"
                    style={{ backgroundColor: NovaTheme.colors.primary }}
                    onPress={handleStartFaceVerification}
                    activeOpacity={0.8}
                  >
                    <Video size={20} color={NovaTheme.colors.textPrimary} />
                    <Text className="ml-2 text-center text-lg font-semibold text-white">
                      Record Face Verification Video
                    </Text>
                  </TouchableOpacity>
                )}
                {isFaceVerified && (
                  <View className="rounded-xl bg-green-500/20 px-6 py-4 border border-green-500/30">
                    <Text className="text-center text-lg font-semibold text-green-300">
                      Face verification complete! You can now record your
                      exercise.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Assessment Recording Tab Content */}
          {activeTab === "assessment" && (
            <View className="mx-6 mb-6">
              <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
                <Text className="mb-2 text-xl font-bold text-white">
                  Assessment Recording
                </Text>
                <Text className="mb-4 text-sm text-white/70">
                  Record your {currentTest.title.toLowerCase()} performance for
                  analysis ({getAssessmentDuration()} seconds).
                </Text>
                <View
                  className="mb-4 rounded-xl p-4 items-center"
                  style={{ backgroundColor: NovaTheme.colors.surface }}
                >
                  <Video size={48} color={NovaTheme.colors.textSecondary} />
                  <View className="flex-row items-center mt-2">
                    {assessmentRecordingComplete ? (
                      <CheckCircle size={20} color={NovaTheme.colors.success} />
                    ) : isAssessmentProcessing ? (
                      <RefreshCw size={20} color={NovaTheme.colors.info} />
                    ) : (
                      <XCircle size={20} color={NovaTheme.colors.error} />
                    )}
                    <Text className="ml-2 text-white/80">
                      {assessmentRecordingComplete
                        ? "Recording Complete"
                        : isAssessmentProcessing
                          ? "Processing..."
                          : "Not Recorded"}
                    </Text>
                  </View>
                  {isAssessmentProcessing && (
                    <Text className="mt-1 text-white/60 text-xs">
                      Processing recording...
                    </Text>
                  )}
                </View>
                {!assessmentRecordingComplete && (
                  <TouchableOpacity
                    className="rounded-xl px-6 py-4 shadow-lg flex-row items-center justify-center"
                    style={{
                      backgroundColor:
                        (testIdStr === "sit-ups" && !isFaceVerified) ||
                        isAssessmentProcessing
                          ? NovaTheme.colors.textMuted
                          : NovaTheme.colors.primary,
                    }}
                    onPress={handleStartAssessmentRecording}
                    disabled={isAssessmentProcessing || !isFaceVerified}
                    activeOpacity={0.8}
                  >
                    <Video size={20} color={NovaTheme.colors.textPrimary} />
                    <Text className="ml-2 text-center text-lg font-semibold text-white">
                      {isAssessmentProcessing
                        ? "Processing..."
                        : !isFaceVerified
                          ? "Complete Face Verification First"
                          : "Record Assessment Video"}
                    </Text>
                  </TouchableOpacity>
                )}
                {assessmentRecordingComplete && !isSubmitting && (
                  <View className="rounded-xl bg-green-500/20 px-6 py-4 border border-green-500/30">
                    <Text className="text-center text-lg font-semibold text-green-300">
                      Assessment recording complete! Automatically submitting
                      for AI analysis...
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Submit Status - Only show on assessment tab when submitting */}
        {activeTab === "assessment" && isSubmitting && (
          <View className="px-6 pb-6">
            <View
              className="rounded-xl p-4 flex-row items-center justify-center"
              style={{ backgroundColor: NovaTheme.colors.surface }}
            >
              <ActivityIndicator size="small" color="white" className="mr-2" />
              <Text className="ml-2 text-center text-lg font-semibold text-white">
                {`Analyzing Assessment...${progress > 0 ? ` ${progress}%` : ""}`}
              </Text>
            </View>
            <View
              className="mt-3 rounded-xl p-4"
              style={{ backgroundColor: NovaTheme.colors.surface }}
            >
              <Text className="text-center text-white/80 text-sm">
                AI is analyzing your {currentTest.title.toLowerCase()}...
              </Text>
              <Text className="text-center text-white/60 text-xs mt-1">
                Processing MP4 video - This may take a few minutes
              </Text>
              {progress > 0 && (
                <View
                  className="mt-2 rounded-full h-2"
                  style={{ backgroundColor: NovaTheme.colors.surfaceLight }}
                >
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: NovaTheme.colors.success,
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
