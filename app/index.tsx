import "../global.css";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";

// Keep the splash screen visible while we check authentication
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { token, isLoading } = useAuthStore();
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for store to rehydrate and show splash
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Hide splash screen
        await SplashScreen.hideAsync();

        // Navigate based on authentication status
        if (token) {
          router.replace("/(app)/home");
        } else {
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        await SplashScreen.hideAsync();
        router.replace("/(auth)/login");
      }
    };

    if (!isLoading) {
      initializeApp();
    }
  }, [token, isLoading, router]);

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <Animated.View style={{ opacity: fadeAnim }} className="items-center">
          {/* App Logo/Icon Placeholder */}
          <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-lg">
            <Text className="text-4xl font-bold text-white">A</Text>
          </View>

          {/* App Name */}
          <Text className="mb-2 text-3xl font-bold text-white">
            Athletic Hub
          </Text>

          <Text className="mb-12 text-lg text-white/80">
            Your fitness journey starts here
          </Text>

          {/* Loading Indicator */}
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="mt-4 text-base text-white/60">
            Loading your experience...
          </Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}
