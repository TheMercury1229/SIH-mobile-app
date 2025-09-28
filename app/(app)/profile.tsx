import { Picker } from "@react-native-picker/picker";
import { Redirect, useRouter } from "expo-router";
import {
  Alert,
  Image,
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
import { NovaTheme } from "../../theme/NovaTheme";

export default function ProfileScreen() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert(
      "Coming Soon",
      "Edit profile functionality will be available soon!"
    );
  };

  if (!token) {
    return <Redirect href={"/(auth)/login"} />;
  }

  const sports = [
    "Cricket",
    "Football",
    "Basketball",
    "Tennis",
    "Badminton",
    "Swimming",
    "Athletics",
    "Volleyball",
    "Table Tennis",
    "Hockey",
    "Boxing",
    "Wrestling",
    "Weightlifting",
    "Cycling",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: NovaTheme.colors.background }}>
      {/* <StatusBar style="light" /> */}
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center space-y-8">
              {/* Profile Image */}
              <View className="items-center space-y-3">
                <Text className="text-base font-medium text-white/90">
                  Profile Picture
                </Text>
                <View className="h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm overflow-hidden">
                  {user?.profileImage || user?.avatar ? (
                    <Image
                      source={
                        require("../../assets/images/profile.jpg") ||
                        user.avatar
                      }
                      className="h-full w-full rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-2xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </Text>
                  )}
                </View>
              </View>

              {/* Name */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Full Name
                </Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={user?.name || ""}
                  editable={false}
                />
              </View>

              {/* Email */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Email Address
                </Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={user?.email || ""}
                  editable={false}
                />
              </View>

              {/* Age */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">Age</Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Age"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={user?.age || ""}
                  editable={false}
                  keyboardType="numeric"
                />
              </View>

              {/* Gender */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Gender
                </Text>
                <View className="rounded-xl bg-white/10 backdrop-blur-sm">
                  <Picker
                    selectedValue={user?.gender || ""}
                    enabled={false}
                    style={{ height: 56, color: "white" }}
                    dropdownIconColor="white"
                  >
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                </View>
              </View>

              {/* Height */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Height (cm)
                </Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Height"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={user?.height ? `${user.height}` : ""}
                  editable={false}
                  keyboardType="numeric"
                />
              </View>

              {/* Weight */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Weight (kg)
                </Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Weight"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={user?.weight ? `${user.weight}` : ""}
                  editable={false}
                  keyboardType="numeric"
                />
              </View>

              {/* Sport Selection */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Sport
                </Text>
                <View className="rounded-xl bg-white/10 backdrop-blur-sm">
                  <Picker
                    selectedValue={user?.sport || ""}
                    enabled={false}
                    style={{ height: 56, color: "white" }}
                    dropdownIconColor="white"
                  >
                    <Picker.Item label="Select your sport" value="" />
                    {sports.map((sportItem, index) => (
                      <Picker.Item
                        key={index}
                        label={sportItem}
                        value={sportItem}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Member Since */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Member Since
                </Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Join date"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={user?.joinDate || new Date().toLocaleDateString()}
                  editable={false}
                />
              </View>

              {/* Action Buttons */}
              <View className="mt-8 space-y-4 flex flex-col gap-3">
                <TouchableOpacity
                  className="rounded-xl bg-white px-6 py-4 shadow-lg"
                  onPress={handleEditProfile}
                  activeOpacity={0.9}
                >
                  <Text className="text-center text-lg font-semibold text-purple-600">
                    Edit Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="rounded-xl bg-red-500/20 px-6 py-4 backdrop-blur-sm"
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Text className="text-center text-lg font-semibold text-red-300">
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Support Link */}
              <View className="mt-4 flex-row items-center justify-center space-x-1">
                <Text className="text-base text-white/70">Need help?</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-base font-semibold text-white underline">
                    Contact Support
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
