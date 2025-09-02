import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful login
      if (email && password) {
        // Set auth state
        setToken("demo-token");
        setUser({
          name: "Athlete",
          email: email,
          joinDate: new Date().toLocaleDateString(),
          avatar: "https://via.placeholder.com/150",
        });

        // Navigate to home screen
        router.replace("/home");
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
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
    <View className="flex-1 items-center justify-center bg-white p-5">
      <View className="w-full max-w-sm">
        <Text className="mb-6 text-center text-3xl font-bold text-blue-600">
          Login
        </Text>

        <View className="mb-4">
          <Text className="mb-1 text-gray-700">Email</Text>
          <TextInput
            className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <Text className="mb-1 text-gray-700">Password</Text>
          <TextInput
            className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className={`h-12 w-full items-center justify-center rounded-lg ${
            isLoading ? "bg-blue-400" : "bg-blue-600"
          }`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-semibold text-white">Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
