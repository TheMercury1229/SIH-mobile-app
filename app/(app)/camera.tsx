import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NovaTheme } from "../../theme/NovaTheme";

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { exercise, duration, testId, returnTo, mode } = params;

  // Ensure testId is a string
  const testIdStr =
    typeof testId === "string"
      ? testId
      : Array.isArray(testId)
        ? testId[0]
        : undefined;

  // Camera permissions and state
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<"back" | "front">("front"); // Start with front camera for face verification
  const cameraRef = useRef<CameraView>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [extractedImageUri, setExtractedImageUri] = useState<string | null>(
    null
  );
  const hasNavigatedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const modeString =
    typeof mode === "string" ? mode : Array.isArray(mode) ? mode[0] : undefined;
  const captureMode = modeString === "photo" ? "photo" : "video";
  const maxDuration = parseInt(duration?.toString().replace(/\D/g, "") || "30");
  const needsMic = captureMode !== "photo";
  const hasCamera = cameraPermission?.granted;
  const hasMic = !needsMic || micPermission?.granted;

  // Determine if this is face verification or assessment
  const isFaceVerification =
    exercise === "Face Verification" || captureMode === "photo";
  const isAssessmentRecording = modeString === "assessment";

  // Request all needed permissions together
  const requestAllPermissions = async () => {
    try {
      if (!hasCamera) {
        const cameraResult = await requestCameraPermission();
        console.log("Camera permission result:", cameraResult.status);
      }
      if (needsMic && !micPermission?.granted) {
        const micResult = await requestMicPermission();
        console.log("Microphone permission result:", micResult.status);
      }
    } catch (e) {
      console.warn("Permission request error", e);
      Alert.alert("Permission Error", "Failed to request permissions");
    }
  };

  const navigateToTestWithFace = (uri: string | null) => {
    try {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      if (returnTo === "test" && testIdStr) {
        router.replace({
          pathname: "/(app)/test/[id]",
          params: {
            id: testIdStr,
            faceImageUri: uri || "extracting",
            recordingComplete: "false",
          },
        });
      } else {
        router.replace("/(app)/assessment");
      }
    } catch (e) {
      console.warn("Navigation error:", e);
    }
  };

  const handleGoBack = () => {
    if (returnTo === "test" && testIdStr) {
      router.replace({
        pathname: "/(app)/test/[id]",
        params: { id: testIdStr },
      });
    } else {
      router.replace("/(app)/assessment");
    }
  };

  useEffect(() => {
    if (isCountdown && countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else if (isCountdown && countdown === 0) {
      setIsCountdown(false);
      startRecording();
    }
  }, [isCountdown, countdown]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev + 1 >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000) as any;
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, maxDuration]);

  const startCountdown = () => {
    setIsCountdown(true);
    setCountdown(3);
  };

  // Extract frame from video and save as JPEG - simplified without FileSystem
  const extractFrameFromVideo = async (
    videoUri: string
  ): Promise<string | null> => {
    try {
      console.log("Extracting frame from video:", videoUri);

      // Extract a thumbnail/frame from the video at 2 second mark
      const { uri: frameUri } = await VideoThumbnails.getThumbnailAsync(
        videoUri,
        {
          time: 2000, // Extract frame at 2 seconds
          quality: 0.8,
        }
      );

      console.log("Frame extracted successfully:", frameUri);

      // The frame is already saved by VideoThumbnails, just return the URI
      return frameUri;
    } catch (error) {
      console.error("Frame extraction error:", error);
      Alert.alert("Error", "Failed to extract frame from video");
      return null;
    }
  };

  const startRecording = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert("Error", "Camera not ready");
        return;
      }

      // Check permissions before recording
      if (!hasCamera) {
        Alert.alert("Error", "Camera permission not granted");
        return;
      }

      if (needsMic && !micPermission?.granted) {
        Alert.alert("Error", "Microphone permission not granted");
        return;
      }

      console.log("Starting video recording...");
      console.log("Is face verification:", isFaceVerification);
      setIsRecording(true);
      setTimer(0);

      // Configure recording options
      const recordingOptions = {
        maxDuration: maxDuration * 1000, // Convert to milliseconds
        quality: "720p" as const,
        mute: false, // Always record with audio for face verification videos
      };

      console.log("Recording options:", recordingOptions);

      // Start recording
      const video = await cameraRef.current.recordAsync(recordingOptions);

      console.log("Recording completed:", video?.uri);

      if (video?.uri) {
        setRecordingUri(video.uri);
        console.log("Video URI set:", video.uri);

        // If this is face verification, extract frame immediately and wait for it to complete
        if (isFaceVerification) {
          console.log("Extracting frame for face verification...");
          const frameUri = await extractFrameFromVideo(video.uri);
          if (frameUri) {
            setExtractedImageUri(frameUri);
            console.log("Extracted image URI set:", frameUri);
            // Immediately navigate back to the test screen with the extracted image URI
            navigateToTestWithFace(frameUri);
          } else {
            console.error("Failed to extract frame from video");
          }
        }
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      setTimer(0);

      // Better error handling
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("RECORD_AUDIO")) {
        Alert.alert(
          "Audio Permission Error",
          "Recording failed due to missing microphone permission. This is required for face verification.",
          [
            {
              text: "Grant Permission",
              onPress: () => requestMicPermission(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      } else {
        Alert.alert(
          "Recording Error",
          "Failed to start recording: " + errorMessage
        );
      }
    }
  };

  const stopRecording = async () => {
    try {
      if (cameraRef.current && isRecording) {
        console.log("Stopping recording...");
        cameraRef.current.stopRecording();
      }

      setIsRecording(false);
      setTimer(0);

      // Wait for recording to complete. For face verification, navigation already happened
      setTimeout(async () => {
        console.log("Processing completed recording...");
        console.log("Recording URI:", recordingUri);
        console.log("Extracted Image URI:", extractedImageUri);
        console.log("Is face verification:", isFaceVerification);

        if (isFaceVerification) {
          // Already navigated in startRecording after extraction; nothing else to do here
          return;
        } else if (isAssessmentRecording) {
          // For assessment recording (matches face verification UX)
          Alert.alert(
            "Assessment Recording Complete!",
            "Your assessment video has been recorded successfully.",
            [
              {
                text: "Continue",
                onPress: () => {
                  if (returnTo === "test" && testIdStr && recordingUri) {
                    router.replace({
                      pathname: "/(app)/test/[id]",
                      params: {
                        id: testIdStr,
                        recordingComplete: "true",
                        videoUri: recordingUri,
                      },
                    });
                  } else {
                    router.replace("/(app)/assessment");
                  }
                },
              },
            ]
          );
        } else {
          // For legacy exercise recording
          Alert.alert(
            "Exercise Recording Complete!",
            "Your exercise video has been recorded and converted to MP4 format.",
            [
              {
                text: "Submit for Analysis",
                onPress: () => {
                  if (returnTo === "test" && testIdStr && recordingUri) {
                    router.replace({
                      pathname: "/(app)/test/[id]",
                      params: {
                        id: testIdStr,
                        recordingComplete: "true",
                        videoUri: recordingUri,
                      },
                    });
                  } else {
                    router.replace("/(app)/assessment");
                  }
                },
              },
            ]
          );
        }
      }, 2000); // Increased delay to ensure frame extraction completes
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert(
        "Error",
        "Failed to stop recording: " + (error as Error).message
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if we have required permissions
  if (cameraPermission === null || (needsMic && micPermission === null)) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white">Requesting permissions...</Text>
      </View>
    );
  }

  if (!hasCamera || (needsMic && !hasMic)) {
    return (
      <View style={{ flex: 1, backgroundColor: NovaTheme.colors.background }}>
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <View className="items-center space-y-6">
            <Text className="text-6xl">📱</Text>
            <Text className="text-white text-2xl font-bold text-center">
              {needsMic && !hasMic
                ? "Camera & Microphone Access Required"
                : "Camera Access Required"}
            </Text>
            <Text className="text-white/80 text-center text-base">
              {isFaceVerification
                ? "We need access to your camera and microphone for face verification video recording."
                : "We need access to your camera and microphone to record your exercise performance."}
            </Text>
            <TouchableOpacity
              onPress={requestAllPermissions}
              className="rounded-xl bg-blue-500 px-8 py-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-lg">
                Grant Permissions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGoBack}
              className="rounded-xl bg-gray-600 px-8 py-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-lg">Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: NovaTheme.colors.background }}>
      <StatusBar style="light" />
      <View className="flex-1">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          mode="video"
        >
          <SafeAreaView className="flex-1">
            {/* Top Header */}
            <View className="px-6 pt-4 pb-8 bg-black/50">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={handleGoBack}
                  className="rounded-full bg-white/20 p-3"
                  disabled={isRecording}
                >
                  <Text className="text-white text-lg">←</Text>
                </TouchableOpacity>

                <View className="items-center">
                  <Text className="text-white font-bold text-lg">
                    {isFaceVerification
                      ? "Face Verification Video"
                      : isAssessmentRecording
                        ? "Assessment Recording"
                        : exercise || "Exercise Recording"}
                  </Text>
                  <Text className="text-white/80 text-sm">
                    {isFaceVerification
                      ? "Record a video of your face"
                      : isAssessmentRecording
                        ? "Record your assessment performance"
                        : duration || "Recording Duration"}
                  </Text>
                  {testIdStr && (
                    <Text className="text-white/60 text-xs mt-1">
                      Test: {testIdStr.replace("-", " ").toUpperCase()}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setFacing((current: "back" | "front") =>
                      current === "back" ? "front" : "back"
                    )
                  }
                  className="rounded-full bg-white/20 p-3"
                  disabled={isRecording}
                >
                  <Text className="text-white text-lg">🔄</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Countdown Overlay */}
            {isCountdown && (
              <View className="absolute inset-0 items-center justify-center bg-black/70">
                <Text className="text-white text-8xl font-bold mb-4">
                  {countdown}
                </Text>
                <Text className="text-white text-xl">Get Ready!</Text>
              </View>
            )}

            {/* Timer */}
            <View className="absolute top-32 left-6 right-6 items-center">
              {isRecording && (
                <View className="rounded-full bg-red-500/80 px-6 py-3">
                  <Text className="text-white font-bold text-xl">
                    🔴 {formatTime(timer)} / {formatTime(maxDuration)}
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom Controls */}
            <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
              {/* Instructions */}
              <View className="mb-6 rounded-2xl bg-black/50 p-4 backdrop-blur-sm">
                <Text className="text-white text-center text-base mb-2">
                  {isFaceVerification
                    ? isRecording
                      ? "Look directly at the camera for face verification"
                      : "Position your face in the frame and start recording for verification"
                    : isAssessmentRecording
                      ? isRecording
                        ? `Perform your ${exercise || "assessment"} now!`
                        : `Ready to record your ${exercise || "assessment"}?`
                      : isRecording
                        ? `Perform ${exercise || "your exercise"} now!`
                        : `Ready to record ${exercise || "your exercise"}?`}
                </Text>
                {!isRecording && (
                  <Text className="text-white/70 text-center text-sm">
                    {isFaceVerification
                      ? `Keep your face visible and well-lit. Recording duration: ${maxDuration} seconds`
                      : isAssessmentRecording
                        ? `Follow proper form for accurate assessment. Duration: ${maxDuration} seconds`
                        : testIdStr === "vertical-jump"
                          ? "Position yourself sideways to the camera, keep hands on hips"
                          : testIdStr === "shuttle-run"
                            ? "Ensure camera captures full running distance"
                            : testIdStr === "sit-ups"
                              ? "Position camera to show your side profile"
                              : "Position yourself in the camera frame and tap record"}
                  </Text>
                )}
              </View>

              {/* Control Buttons */}
              <View className="flex-row justify-center space-x-8">
                {!isRecording && !isCountdown && (
                  <TouchableOpacity
                    onPress={startCountdown}
                    className="h-20 w-20 rounded-full bg-red-500 items-center justify-center shadow-lg"
                    activeOpacity={0.8}
                  >
                    <View className="h-8 w-8 rounded-full bg-white" />
                  </TouchableOpacity>
                )}

                {isRecording && (
                  <TouchableOpacity
                    onPress={stopRecording}
                    className="h-20 w-20 rounded-full bg-red-500 items-center justify-center shadow-lg"
                    activeOpacity={0.8}
                  >
                    <View className="h-10 w-10 rounded bg-white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    </View>
  );
}
