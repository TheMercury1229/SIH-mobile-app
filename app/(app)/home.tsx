import { Redirect, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../store/authStore";

export default function HomeScreen() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  if (!token) {
    return <Redirect href={"/login"} />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white p-5">
      <Text className="mb-8 text-center text-2xl font-bold">
        Welcome, {user?.name || "User"}
      </Text>

      <TouchableOpacity
        className="h-12 w-64 items-center justify-center rounded-lg bg-blue-600"
        onPress={() => router.push("/profile")}
      >
        <Text className="text-lg font-semibold text-white">View Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 h-12 w-64 items-center justify-center rounded-lg bg-red-500"
        onPress={handleLogout}
      >
        <Text className="text-lg font-semibold text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
