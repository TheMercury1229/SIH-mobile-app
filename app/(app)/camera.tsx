import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Try to import camera, fallback if not available
let CameraView: any = null;
let CameraType: any = null;
let useCameraPermissions: any = null;

try {
  const cameraModule = require("expo-camera");
  CameraView = cameraModule.CameraView;
  CameraType = cameraModule.CameraType;
  useCameraPermissions = cameraModule.useCameraPermissions;
} catch (error) {
  console.log("Camera module not available, using fallback");
}

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
  const [permission, requestPermission] = useCameraPermissions
    ? useCameraPermissions()
    : [null, null];
  const [facing, setFacing] = useState<"back" | "front">("back");
  const cameraRef = useRef<any>(null);

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
      if (CameraView && cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
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
      } else {
        Alert.alert("Camera", "Camera not available to take photo.");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);

      if (CameraView && cameraRef.current) {
        // Start actual video recording
        const video = await cameraRef.current.recordAsync({
          maxDuration: maxDuration,
          quality: "720p",
        });

        setRecordingUri(video.uri);
        console.log("Recording saved to:", video.uri);
      } else {
        // Fallback simulation
        console.log("Starting simulated recording for:", exercise);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      if (CameraView && cameraRef.current && isRecording) {
        // Stop the actual recording
        cameraRef.current.stopRecording();
      }

      setIsRecording(false);
      setTimer(0);

      const alertTitle = "Assessment Complete!";
      const alertMessage = recordingUri
        ? "Your video has been recorded successfully. Our AI will analyze your performance."
        : "Assessment completed successfully. Our AI will analyze your performance.";

      Alert.alert(alertTitle, alertMessage, [
        {
          text: "View Results",
          onPress: () => router.push("/(app)/results"),
        },
        {
          text: returnTo === "test" ? "Back to Test" : "Back to Assessment",
          onPress: () => {
            if (returnTo === "test" && testIdStr) {
              // Return to test screen with recording complete flag
              router.replace({
                pathname: "/(app)/test/[id]",
                params: {
                  id: testIdStr,
                  recordingComplete: "true",
                  // pass the recorded video URI back to TestScreen
                  videoUri: recordingUri || undefined,
                },
              });
            } else {
              // Return to assessment screen
              router.replace("/(app)/assessment");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Error", "Failed to stop recording");
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <LinearGradient colors={["#1f2937", "#111827"]} className="flex-1">
      <StatusBar style="light" />

      {/* Handle camera not available */}
      {!CameraView || !useCameraPermissions ? (
        <SafeAreaView className="flex-1">
          <View className="px-6 pt-4 pb-8 bg-black/50">
            <TouchableOpacity
              onPress={handleGoBack}
              className="rounded-full bg-white/20 p-3 w-12"
            >
              <Text className="text-white text-lg">←</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            <View className="h-80 w-80 rounded-2xl bg-gray-700 items-center justify-center border-2 border-dashed border-gray-500 mb-6">
              <Text className="text-6xl mb-4">📱</Text>
              <Text className="text-white text-lg font-semibold mb-2">
                {captureMode === "photo" ? "Face Capture Simulation" : "Camera Simulation"}
              </Text>
              <Text className="text-white/70 text-center px-8">
                Camera module is being loaded. In demo mode, this simulates {captureMode === "photo" ? "photo capture" : "recording"}.
              </Text>
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
            {isRecording && (
              <View className="mb-6 rounded-full bg-red-500/80 px-6 py-3">
                <Text className="text-white font-bold text-xl">
                  🔴 {formatTime(timer)} / {formatTime(maxDuration)}
                </Text>
              </View>
            )}

            {/* Instructions */}
            <View className="mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <Text className="text-white text-center text-base mb-2">
                {captureMode === "photo"
                  ? "Ready to capture your face image?"
                  : isRecording
                    ? `Performing ${exercise || "exercise"} simulation...`
                    : `Ready to simulate ${exercise || "your exercise"}?`}
              </Text>
              {captureMode !== "photo" && !isRecording && (
                <Text className="text-white/70 text-center text-sm">
                  Camera module loading... Tap record button to simulate
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
      ) : !permission?.granted ? (
        /* Handle permissions */
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <View className="items-center space-y-6">
            <Text className="text-6xl">📱</Text>
            <Text className="text-white text-2xl font-bold text-center">
              Camera Permission Required
            </Text>
            <Text className="text-white/80 text-center text-base">
              We need access to your camera to record your exercise performance
              for AI analysis.
            </Text>
            <TouchableOpacity
              onPress={requestPermission}
              className="rounded-xl bg-blue-500 px-8 py-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-lg">
                Grant Camera Access
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
      ) : (
        /* Camera View */
        <View className="flex-1">
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
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
      )}
    </LinearGradient>
  );
}
