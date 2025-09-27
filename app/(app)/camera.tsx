import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from "expo-camera";

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
  const [facing, setFacing] = useState<"back" | "front">("back");
  const cameraRef = useRef<CameraView>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const captureMode = (typeof mode === "string" ? mode : Array.isArray(mode) ? mode[0] : undefined) === "photo" ? "photo" : "video";
  const maxDuration = parseInt(duration?.toString().replace(/\D/g, "") || "30");
  const needsMic = captureMode !== "photo";
  const hasCamera = cameraPermission?.granted;
  const hasMic = !needsMic || micPermission?.granted;

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

  const takePhoto = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert("Error", "Camera not ready");
        return;
      }

      console.log("Taking photo...");
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      console.log("Photo captured:", photo?.uri);
      setPhotoUri(photo?.uri);

      // Navigate back to test with face image URI
      if (returnTo === "test" && testIdStr) {
        router.replace({
          pathname: "/(app)/test/[id]",
          params: {
            id: testIdStr,
            faceImageUri: photo?.uri,
          },
        });
      } else {
        Alert.alert("Photo Captured", "Returning to assessment.");
        router.replace("/(app)/assessment");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to capture photo: " + (error as Error).message);
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
      setIsRecording(true);
      setTimer(0);

      // Configure recording options
      const recordingOptions = {
        maxDuration: maxDuration * 1000, // Convert to milliseconds
        quality: "720p" as const,
        mute: needsMic && !micPermission?.granted, // Mute if no mic permission
      };

      console.log("Recording options:", recordingOptions);

      // Start recording
      const video = await cameraRef.current.recordAsync(recordingOptions);
      
      console.log("Recording completed:", video?.uri);
      setRecordingUri(video?.uri || null);

    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      setTimer(0);
      
      // Better error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("RECORD_AUDIO")) {
        Alert.alert(
          "Audio Permission Error",
          "Recording failed due to missing microphone permission. Would you like to record without audio?",
          [
            {
              text: "Record Without Audio",
              onPress: () => recordWithoutAudio(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      } else {
        Alert.alert("Recording Error", "Failed to start recording: " + errorMessage);
      }
    }
  };

  const recordWithoutAudio = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert("Error", "Camera not ready");
        return;
      }

      console.log("Starting video recording without audio...");
      setIsRecording(true);
      setTimer(0);

      const recordingOptions = {
        maxDuration: maxDuration * 1000,
        quality: "720p" as const,
        mute: true, // Force mute
      };

      const video = await cameraRef.current.recordAsync(recordingOptions);
      console.log("Recording completed (no audio):", video?.uri);
      setRecordingUri(video?.uri || null);

    } catch (error) {
      console.error("Error recording without audio:", error);
      setIsRecording(false);
      setTimer(0);
      Alert.alert("Error", "Failed to record even without audio: " + (error as Error).message);
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

      // Wait a moment for the recording to complete
      setTimeout(() => {
        const alertTitle = "Recording Complete!";
        const alertMessage = recordingUri
          ? "Your video has been recorded successfully."
          : "Recording completed successfully.";

        Alert.alert(alertTitle, alertMessage, [
          {
            text: "View Results",
            onPress: () => router.push("/(app)/results"),
          },
          {
            text: returnTo === "test" ? "Back to Test" : "Back to Assessment",
            onPress: () => {
              if (returnTo === "test" && testIdStr) {
                router.replace({
                  pathname: "/(app)/test/[id]",
                  params: {
                    id: testIdStr,
                    recordingComplete: "true",
                    videoUri: recordingUri || undefined,
                  },
                });
              } else {
                router.replace("/(app)/assessment");
              }
            },
          },
        ]);
      }, 500);

    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Error", "Failed to stop recording: " + (error as Error).message);
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
      <LinearGradient colors={["#1f2937", "#111827"]} className="flex-1">
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <View className="items-center space-y-6">
            <Text className="text-6xl">📱</Text>
            <Text className="text-white text-2xl font-bold text-center">
              {needsMic && !hasMic ? "Camera & Microphone Access Required" : "Camera Access Required"}
            </Text>
            <Text className="text-white/80 text-center text-base">
              {needsMic
                ? "We need access to your camera and microphone to record your exercise performance."
                : "We need access to your camera to capture your photo."}
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
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1f2937", "#111827"]} className="flex-1">
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
                    {captureMode === "photo" ? "Face Verification" : exercise || "Exercise Recording"}
                  </Text>
                  <Text className="text-white/80 text-sm">
                    {captureMode === "photo" ? "Capture a clear face photo" : duration || "Recording Duration"}
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
            {captureMode !== "photo" && (
              <View className="absolute top-32 left-6 right-6 items-center">
                {isRecording && (
                  <View className="rounded-full bg-red-500/80 px-6 py-3">
                    <Text className="text-white font-bold text-xl">
                      🔴 {formatTime(timer)} / {formatTime(maxDuration)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Bottom Controls */}
            <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
              {/* Instructions */}
              <View className="mb-6 rounded-2xl bg-black/50 p-4 backdrop-blur-sm">
                <Text className="text-white text-center text-base mb-2">
                  {captureMode === "photo"
                    ? "Align your face in the frame and tap the capture button"
                    : isRecording
                      ? `Perform ${exercise || "your exercise"} now!`
                      : `Ready to record ${exercise || "your exercise"}?`}
                </Text>
                {captureMode !== "photo" && !isRecording && (
                  <Text className="text-white/70 text-center text-sm">
                    {testIdStr === "vertical-jump"
                      ? "Position yourself sideways to the camera, keep hands on hips"
                      : testIdStr === "shuttle-run"
                        ? "Ensure camera captures full running distance"
                        : testIdStr === "sit-ups"
                          ? "Position camera to show your side profile"
                          : testIdStr === "endurance-run"
                            ? "Start recording, then begin your run"
                            : "Position yourself in the camera frame and tap record"}
                  </Text>
                )}
              </View>

              {/* Control Buttons */}
              <View className="flex-row justify-center space-x-8">
                {captureMode === "photo" ? (
                  <TouchableOpacity
                    onPress={takePhoto}
                    className="h-20 w-20 rounded-full bg-blue-500 items-center justify-center shadow-lg"
                    activeOpacity={0.8}
                  >
                    <View className="h-8 w-8 rounded-full bg-white" />
                  </TouchableOpacity>
                ) : (
                  <>
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
                  </>
                )}
              </View>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    </LinearGradient>
  );
}