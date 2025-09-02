import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const Register = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Page 1 states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sport, setSport] = useState('');

  // Page 2 states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adharNo, setAdharNo] = useState('');

  const sports = [
    'Cricket',
    'Football',
    'Basketball',
    'Tennis',
    'Badminton',
    'Swimming',
    'Athletics',
    'Volleyball',
    'Table Tennis',
    'Hockey',
    'Boxing',
    'Wrestling',
    'Weightlifting',
    'Cycling'
  ];

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
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

      Alert.alert(
        "Success", 
        "Registration successful! Please login with your credentials.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login")
          }
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
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-5">
        <View className="w-full max-w-sm">
          <Text className="mb-6 text-center text-3xl font-bold text-blue-600">
            Create Account
          </Text>
          <Text className="mb-6 text-center text-lg text-gray-600">
            Step 1 of 2 - Personal Information
          </Text>

          {/* Profile Image */}
          <View className="mb-4 items-center">
            <Text className="mb-2 text-gray-700">Profile Picture</Text>
            <TouchableOpacity 
              onPress={pickImage}
              className="h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-gray-300"
            >
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  className="h-full w-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-center text-sm text-gray-500">
                  Tap to select image
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Name */}
          <View className="mb-4">
            <Text className="mb-1 text-gray-700">Full Name</Text>
            <TextInput
              className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Age and Gender Row */}
          <View className="mb-4 flex-row space-x-2">
            <View className="flex-1">
              <Text className="mb-1 text-gray-700">Age</Text>
              <TextInput
                className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-gray-700">Gender</Text>
              <View className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50">
                <Picker
                  selectedValue={gender}
                  onValueChange={(itemValue) => setGender(itemValue)}
                  style={{ height: 48 }}
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
          <View className="mb-4 flex-row space-x-2">
            <View className="flex-1">
              <Text className="mb-1 text-gray-700">Height (cm)</Text>
              <TextInput
                className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
                placeholder="Height"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-gray-700">Weight (kg)</Text>
              <TextInput
                className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
                placeholder="Weight"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Sport Selection */}
          <View className="mb-6">
            <Text className="mb-1 text-gray-700">Sport</Text>
            <View className="w-full rounded-lg border border-gray-300 bg-gray-50">
              <Picker
                selectedValue={sport}
                onValueChange={(itemValue) => setSport(itemValue)}
                style={{ height: 48 }}
              >
                <Picker.Item label="Select your sport" value="" />
                {sports.map((sportItem, index) => (
                  <Picker.Item key={index} label={sportItem} value={sportItem} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            className="h-12 w-full items-center justify-center rounded-lg bg-blue-600"
            onPress={handleNext}
          >
            <Text className="text-lg font-semibold text-white">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderPage2 = () => (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-5">
        <View className="w-full max-w-sm">
          <Text className="mb-6 text-center text-3xl font-bold text-blue-600">
            Account Details
          </Text>
          <Text className="mb-6 text-center text-lg text-gray-600">
            Step 2 of 2 - Account Information
          </Text>

          {/* Username */}
          <View className="mb-4">
            <Text className="mb-1 text-gray-700">Username</Text>
            <TextInput
              className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text className="mb-1 text-gray-700">Password</Text>
            <TextInput
              className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Confirm Password */}
          <View className="mb-4">
            <Text className="mb-1 text-gray-700">Confirm Password</Text>
            <TextInput
              className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Adhar Number */}
          <View className="mb-6">
            <Text className="mb-1 text-gray-700">Adhar Number</Text>
            <TextInput
              className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-3"
              placeholder="Enter 12-digit Adhar number"
              value={adharNo}
              onChangeText={setAdharNo}
              keyboardType="numeric"
              maxLength={12}
            />
          </View>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="flex-1 h-12 items-center justify-center rounded-lg border border-blue-600"
              onPress={() => setCurrentPage(1)}
            >
              <Text className="text-lg font-semibold text-blue-600">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 h-12 items-center justify-center rounded-lg ${
                isLoading ? "bg-blue-400" : "bg-blue-600"
              }`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-semibold text-white">Register</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mt-4 items-center"
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text className="text-blue-600">Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return currentPage === 1 ? renderPage1() : renderPage2();
};

export default Register;