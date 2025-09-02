import "../global.css";

import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuthStore } from "../store/authStore";

// Keep the splash screen visible while we check authentication
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { token, isLoading, setIsLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for store to rehydrate
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Hide splash screen
        await SplashScreen.hideAsync();

        // Navigate based on authentication status
        if (token) {
          router.replace("/home");
        } else {
          router.replace("/register");
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        await SplashScreen.hideAsync();
        router.replace("/login");
      }
    };

    if (!isLoading) {
      initializeApp();
    }
  }, [token, isLoading, router]);

  // Show splash screen while loading
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-4 text-lg text-gray-600">Loading...</Text>
    </View>
  );
}
