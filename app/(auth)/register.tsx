import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

const Register = () => {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Page 1 states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sport, setSport] = useState("");

  // Page 2 states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adharNo, setAdharNo] = useState("");

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

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const validatePage1 = () => {
    if (!profileImage) {
      Alert.alert("Error", "Please select a profile image");
      return false;
    }
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!age || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 100) {
      Alert.alert("Error", "Please enter a valid age");
      return false;
    }
    if (!gender) {
      Alert.alert("Error", "Please select your gender");
      return false;
    }
    if (!height || isNaN(Number(height))) {
      Alert.alert("Error", "Please enter your height in cm");
      return false;
    }
    if (!weight || isNaN(Number(weight))) {
      Alert.alert("Error", "Please enter your weight in kg");
      return false;
    }
    if (!sport) {
      Alert.alert("Error", "Please select your sport");
      return false;
    }
    return true;
  };

  const validatePage2 = () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return false;
    }
    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters long");
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    if (!adharNo || adharNo.length !== 12 || isNaN(Number(adharNo))) {
      Alert.alert("Error", "Please enter a valid 12-digit Adhar number");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validatePage1()) {
      setCurrentPage(2);
    }
  };

  const handleRegister = async () => {
    if (!validatePage2()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create user object with all registration data
      const newUser = {
        id: Date.now().toString(), // Simple ID generation
        name: name.trim(),
        username: username.trim(),
        email: `${username.trim()}@athlete.com`, // Generate email from username
        profileImage: profileImage || undefined,
        avatar: profileImage || undefined,
        age,
        gender,
        height,
        weight,
        sport,
        adharNo,
        joinDate: new Date().toLocaleDateString(),
        // Initialize some default stats
        workouts: 0,
        streak: 0,
        goals: "0/3",
        calories: "0",
      };

      // Save user data and token to store
      setUser(newUser);
      setToken("registered-token");

      Alert.alert(
        "Success",
        "Registration successful! Welcome to Athletic Hub!",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(app)/home"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Registration failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage1 = () => (
    <View style={{ flex: 1, backgroundColor: NovaTheme.colors.background }}>
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
            <View className="pt-6 pb-8 items-center">
              <Text className="mb-2 text-3xl font-bold text-white">
                Create Account
              </Text>
              <Text className="text-lg text-white/80">
                Step 1 of 2 - Personal Information
              </Text>
            </View>

            <View className="flex-1 justify-center space-y-6">
              {/* Profile Image */}
              <View className="items-center space-y-3">
                <Text className="text-base font-medium text-white/90">
                  Profile Picture
                </Text>
                <TouchableOpacity
                  onPress={pickImage}
                  className="h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                  activeOpacity={0.8}
                >
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      className="h-full w-full rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-center text-sm text-white/70">
                      Tap to select
                    </Text>
                  )}
                </TouchableOpacity>
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
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Age and Gender Row */}
              <View className="flex-col space-x-4">
                <View className="flex-1 space-y-2">
                  <Text className="text-base font-medium text-white/90">
                    Age
                  </Text>
                  <TextInput
                    className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                    placeholder="Age"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1 space-y-2">
                  <Text className="text-base font-medium text-white/90">
                    Gender
                  </Text>
                  <View className="rounded-xl bg-white/10 backdrop-blur-sm">
                    <Picker
                      selectedValue={gender}
                      onValueChange={(itemValue) => setGender(itemValue)}
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
              </View>

              {/* Height and Weight Row */}
              <View className="flex-col space-x-4">
                <View className="flex-1 space-y-2">
                  <Text className="text-base font-medium text-white/90">
                    Height (cm)
                  </Text>
                  <TextInput
                    className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                    placeholder="Height"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1 space-y-2">
                  <Text className="text-base font-medium text-white/90">
                    Weight (kg)
                  </Text>
                  <TextInput
                    className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                    placeholder="Weight"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Sport Selection */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Sport
                </Text>
                <View className="rounded-xl bg-white/10 backdrop-blur-sm">
                  <Picker
                    selectedValue={sport}
                    onValueChange={(itemValue) => setSport(itemValue)}
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

              <TouchableOpacity
                className="mt-8 rounded-xl bg-white px-6 py-4 shadow-lg"
                onPress={handleNext}
                activeOpacity={0.9}
              >
                <Text className="text-center text-lg font-semibold text-purple-600">
                  Next Step
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View className="mt-4 flex-row items-center justify-center space-x-1">
                <Text className="text-base text-white/70">
                  Already have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-semibold text-white underline">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );

  const renderPage2 = () => (
    <View style={{ flex: 1, backgroundColor: NovaTheme.colors.background }}>
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
            <View className="pt-6 pb-8 items-center">
              <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Text className="text-2xl font-bold text-white">A</Text>
              </View>
              <Text className="mb-2 text-3xl font-bold text-white">
                Account Details
              </Text>
              <Text className="text-lg text-white/80">
                Step 2 of 2 - Account Information
              </Text>
            </View>

            <View className="flex-1 justify-center space-y-6">
              {/* Username */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Username
                </Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Enter username"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* Password */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Password
                </Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Enter password (min 6 characters)"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Confirm Password */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Confirm Password
                </Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Adhar Number */}
              <View className="space-y-2">
                <Text className="text-base font-medium text-white/90">
                  Adhar Number
                </Text>
                <TextInput
                  className="rounded-xl bg-white/10 px-4 py-4 text-base text-white backdrop-blur-sm"
                  placeholder="Enter 12-digit Adhar number"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={adharNo}
                  onChangeText={setAdharNo}
                  keyboardType="numeric"
                  maxLength={12}
                  editable={!isLoading}
                />
              </View>

              {/* Action Buttons */}
              <View className="mt-8 flex-col gap-3 space-x-4">
                <TouchableOpacity
                  className="flex-1 rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm"
                  onPress={() => setCurrentPage(1)}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <Text className="text-center text-lg font-semibold text-white">
                    Back
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 rounded-xl px-6 py-4 shadow-lg ${
                    isLoading ? "bg-white/80" : "bg-white"
                  }`}
                  onPress={handleRegister}
                  activeOpacity={0.9}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator color="#7c3aed" size="small" />
                      <Text className="ml-2 text-center text-lg font-semibold text-purple-600">
                        Creating...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center text-lg font-semibold text-purple-600">
                      Register
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View className="mt-4 flex-row items-center justify-center space-x-1">
                <Text className="text-base text-white/70">
                  Already have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text className="text-base font-semibold text-white underline">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );

  return currentPage === 1 ? renderPage1() : renderPage2();
};

export default Register;
