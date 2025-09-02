import { Redirect, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../store/authStore";

export default function ProfileScreen() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const handleEditProfile = () => {
    // This could navigate to an edit profile screen in the future
    alert("Edit profile functionality coming soon!");
  };

  if (!token) {
    return <Redirect href={"/(auth)/login"} />;
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center p-5">
        {/* Profile Avatar Placeholder */}
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-blue-100">
          <Text className="text-2xl font-bold text-blue-600">
            {user?.name?.charAt(0) || "U"}
          </Text>
        </View>

        {/* Profile Info Card */}
        <View className="w-full max-w-sm rounded-lg bg-gray-50 p-6 shadow-md">
          <Text className="mb-4 text-center text-2xl font-bold">
            Profile Information
          </Text>

          <View className="mb-4">
            <Text className="text-sm text-gray-500">Name</Text>
            <Text className="text-lg font-medium">
              {user?.name || "Not set"}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500">Email</Text>
            <Text className="text-lg font-medium">
              {user?.email || "athlete@example.com"}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500">Member Since</Text>
            <Text className="text-lg font-medium">
              {user?.joinDate || "Today"}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm text-gray-500">Status</Text>
            <Text className="text-lg font-medium text-green-600">Active</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            className="mb-3 h-12 w-full items-center justify-center rounded-lg bg-green-600"
            onPress={handleEditProfile}
          >
            <Text className="text-lg font-semibold text-white">
              Edit Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mb-3 h-12 w-full items-center justify-center rounded-lg bg-blue-600"
            onPress={() => router.back()}
          >
            <Text className="text-lg font-semibold text-white">
              Back to Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="h-12 w-full items-center justify-center rounded-lg bg-red-500"
            onPress={handleLogout}
          >
            <Text className="text-lg font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
