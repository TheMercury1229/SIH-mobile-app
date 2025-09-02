import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token, setToken, setUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful login
      const mockUser = {
        name: email.split("@")[0],
        email: email,
        joinDate: new Date().toLocaleDateString(),
        avatar: "https://via.placeholder.com/150",
      };

      setToken("demo-token");
      setUser(mockUser);

      // Navigate to home screen
      router.replace("/(app)/home");
    } catch (error) {
      Alert.alert("Error", "Login failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (token) {
    return <Redirect href={"/(app)/home"} />;
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-1 justify-center">
              <View className="mb-12 items-center">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-white/20">
                  <Text className="text-3xl font-bold text-white">A</Text>
                </View>
                <Text className="mb-2 text-3xl font-bold text-white">
                  Welcome Back
                </Text>
                <Text className="text-lg text-white/80">
                  Sign in to continue your journey
                </Text>
              </View>

              {/* Login Form */}
              <View className="space-y-6">
                <View className="space-y-2">
                  <Text className="text-base font-medium text-white/90">
                    Email Address
                  </Text>
                  <TextInput
                    className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-base font-medium text-white/90">
                    Password
                  </Text>
                  <TextInput
                    className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  className={`mt-8 rounded-xl px-6 py-4 shadow-lg ${
                    isLoading ? "bg-white/80" : "bg-white"
                  }`}
                  onPress={handleLogin}
                  activeOpacity={0.9}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator color="#7c3aed" size="small" />
                      <Text className="ml-2 text-center text-lg font-semibold text-purple-600">
                        Signing In...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center text-lg font-semibold text-purple-600">
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>

                <View className="mt-6 flex-row items-center justify-center space-x-1">
                  <Text className="text-base text-white/70">
                    Don't have an account?
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push("/(auth)/register")}
                    disabled={isLoading}
                  >
                    <Text className="text-base font-semibold text-white underline">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Demo Instructions */}
            <View className="mb-8 rounded-xl bg-white/10 p-4">
              <Text className="mb-2 text-sm font-medium text-white">
                Demo Instructions:
              </Text>
              <Text className="text-xs text-white/80">
                • Enter any valid email format (e.g., user@example.com)
              </Text>
              <Text className="text-xs text-white/80">
                • Enter any password to login
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
