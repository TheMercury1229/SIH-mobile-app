import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestScreen() {
  const router = useRouter();
  const { testId } = useLocalSearchParams();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

  const testData = {
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
        "Perform 3 attempts with 30 seconds rest between each"
      ],
      tips: [
        "Warm up with light jumping before recording",
        "Make sure the camera captures your full body",
        "Jump straight up, avoid forward movement"
      ]
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
        "Count the number of times you touch each cone"
      ],
      tips: [
        "Use proper running technique with arm drive",
        "Stay low when changing direction",
        "Maintain maximum effort throughout"
      ]
    },
    "sit-ups": {
      title: "Sit-ups Test",
      icon: "💪",
      color: ["#4ade80", "#3b82f6"],
      instructions: [
        "Lie on your back with knees bent at 90 degrees",
        "Position camera to show your side profile",
        "Cross your arms over your chest",
        "Curl up until your elbows touch your knees",
        "Lower back down until shoulder blades touch the ground",
        "Perform as many as possible in 60 seconds"
      ],
      tips: [
        "Keep your feet flat on the ground",
        "Use your core muscles, not momentum",
        "Maintain steady breathing throughout"
      ]
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
        "Cool down with light walking after completion"
      ],
      tips: [
        "Start at a comfortable pace you can maintain",
        "Focus on consistent breathing",
        "Track your distance using a fitness app"
      ]
    }
  };

  const currentTest = testData[testId]  || testData["vertical-jump"];

  const handleStartRecording = () => {
    // In a real app, this would start the camera recording
    setIsRecording(true);
    // Simulate recording duration
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
      Alert.alert("Recording Complete", "Your test has been recorded successfully!");
    }, 3000);
  };

  const handleSubmitTest = () => {
    if (!hasRecorded) {
      Alert.alert("No Recording", "Please record your test first.");
      return;
    }
    
    Alert.alert(
      "Test Submitted",
      "Your test has been submitted for analysis. Results will be available in your progress section.",
      [
        {
          text: "View Progress",
          onPress: () => router.replace("/(app)/progress" as any)
        },
        {
          text: "Back to Assessment",
          onPress: () => router.replace("/(app)/assessment" as any)
        }
      ]
    );
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
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Instructions */}
          <View className="mx-6 mb-6">
            <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <Text className="mb-4 text-xl font-bold text-white">
                Instructions
              </Text>
              {currentTest.instructions.map((instruction: string, index: number) => (
                <View key={index} className="mb-2 flex-row">
                  <Text className="mr-2 text-white/90">{index + 1}.</Text>
                  <Text className="flex-1 text-white/90">{instruction}</Text>
                </View>
              ))}
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

          {/* Camera Section */}
          <View className="mx-6 mb-6">
            <View className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <Text className="mb-4 text-xl font-bold text-white">
                Video Recording
              </Text>
              
              {!hasRecorded ? (
                <>
                  <Text className="mb-4 text-center text-white/90">
                    Position your camera and start recording when ready
                  </Text>
                  <View className="mb-4 h-48 items-center justify-center rounded-xl bg-black/30">
                    <Text className="text-6xl">📹</Text>
                    <Text className="mt-2 text-white/70">Camera Preview</Text>
                  </View>
                  <TouchableOpacity
                    className={`rounded-xl px-6 py-4 ${
                      isRecording ? "bg-red-500" : "bg-white/20"
                    }`}
                    onPress={handleStartRecording}
                    disabled={isRecording}
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      {isRecording ? "Recording..." : "Start Recording"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View className="mb-4 h-48 items-center justify-center rounded-xl bg-black/30">
                    <Text className="text-6xl">✅</Text>
                    <Text className="mt-2 text-white/70">Recording Complete</Text>
                  </View>
                  <TouchableOpacity
                    className="mb-3 rounded-xl bg-white/20 px-6 py-4"
                    onPress={() => {
                      setHasRecorded(false);
                      setIsRecording(false);
                    }}
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      Record Again
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
              hasRecorded ? "bg-green-500" : "bg-white/20"
            }`}
            onPress={handleSubmitTest}
            disabled={!hasRecorded}
          >
            <Text className="text-center text-lg font-semibold text-white">
              {hasRecorded ? "Submit Test" : "Complete Recording First"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}