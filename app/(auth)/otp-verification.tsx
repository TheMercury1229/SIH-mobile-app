import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, RefreshCw, Shield } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";
import { NovaTheme } from "../../theme/NovaTheme";

const OtpVerification = () => {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const params = useLocalSearchParams();

  // Parse the user data passed from registration
  const userData = params.userData
    ? JSON.parse(params.userData as string)
    : null;
  const phoneNumber = (params.phoneNumber as string) || "****1234";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate OTP verification API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, accept any 6-digit OTP
      // In real app, verify with backend
      if (otpString === "123456" || otpString.length === 6) {
        // OTP verified successfully
        if (userData) {
          setUser(userData);
          setToken("verified-token");

          Alert.alert(
            "Verification Successful!",
            "Your account has been created successfully. Welcome to Athletic Hub!",
            [
              {
                text: "Continue",
                onPress: () => router.replace("/(app)/home"),
              },
            ]
          );
        } else {
          Alert.alert("Error", "User data not found. Please register again.");
          router.replace("/(auth)/register");
        }
      } else {
        Alert.alert(
          "Invalid OTP",
          "The OTP you entered is incorrect. Please try again."
        );
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert("Error", "Verification failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      // Simulate resend OTP API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("OTP Sent", "A new OTP has been sent to your phone number.");
      setTimeLeft(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: NovaTheme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: NovaTheme.colors.surface }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={NovaTheme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-6">
          {/* Icon */}
          <View className="items-center mb-8">
            <View
              className="h-20 w-20 items-center justify-center rounded-full mb-4"
              style={{ backgroundColor: NovaTheme.colors.surface }}
            >
              <Shield size={32} color={NovaTheme.colors.primary} />
            </View>
            <Text className="text-2xl font-bold text-white mb-2">
              Verify Your Identity
            </Text>
            <Text className="text-base text-white/70 text-center mb-1">
              We've sent a 6-digit verification code to your
            </Text>
            <Text className="text-sm font-medium text-white/90 text-center mb-2">
              Aadhar linked email address
            </Text>
            <Text className="text-lg font-semibold text-white">
              {phoneNumber
                ? `${phoneNumber.slice(0, 2)}****@gmail.com`
                : "us****@gmail.com"}
            </Text>
          </View>

          {/* OTP Input */}
          <View className="mb-8">
            <Text className="text-white text-base font-medium mb-4">
              Enter verification code
            </Text>
            <View className="flex-row justify-between mb-6">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  className="h-14 w-12 text-center text-xl font-bold text-white rounded-xl"
                  style={{
                    backgroundColor: NovaTheme.colors.surface,
                    borderWidth: 2,
                    borderColor: digit
                      ? NovaTheme.colors.primary
                      : NovaTheme.colors.surfaceLight,
                  }}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend OTP */}
            <View className="flex-row items-center justify-center">
              <Text className="text-white/70 text-sm">
                Didn't receive the code?{" "}
              </Text>
              {canResend ? (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={isResending}
                  className="flex-row items-center"
                >
                  {isResending && (
                    <RefreshCw
                      size={14}
                      color={NovaTheme.colors.primary}
                      className="mr-1"
                    />
                  )}
                  <Text
                    style={{ color: NovaTheme.colors.primary }}
                    className="text-sm font-medium"
                  >
                    {isResending ? "Sending..." : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text
                  style={{ color: NovaTheme.colors.primary }}
                  className="text-sm font-medium"
                >
                  Resend in {timeLeft}s
                </Text>
              )}
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            className="rounded-xl py-4 mb-6 flex-row items-center justify-center"
            style={{
              backgroundColor:
                otp.every((digit) => digit) && !isLoading
                  ? NovaTheme.colors.primary
                  : NovaTheme.colors.surface,
            }}
            onPress={handleVerifyOtp}
            disabled={!otp.every((digit) => digit) || isLoading}
            activeOpacity={0.8}
          >
            {isLoading && (
              <ActivityIndicator size="small" color="white" className="mr-2" />
            )}
            <Text className="text-center text-lg font-semibold text-white">
              {isLoading ? "Verifying..." : "Verify & Complete Registration"}
            </Text>
          </TouchableOpacity>

          {/* Help Text
          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: NovaTheme.colors.surface }}
          >
            <View className="flex-row items-start">
              <MessageSquare
                size={16}
                color={NovaTheme.colors.info}
                className="mr-2 mt-1 flex-shrink-0"
              />
              <View className="flex-1">
                <Text className="text-white/90 text-sm font-medium mb-2">
                  Demo Instructions
                </Text>
                <Text className="text-white/80 text-sm leading-5">
                  For testing purposes, enter any 6-digit code or use the quick
                  code:{" "}
                </Text>
                <View
                  className="mt-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: NovaTheme.colors.primary + "20" }}
                >
                  <Text
                    style={{ color: NovaTheme.colors.primary }}
                    className="font-bold text-lg text-center tracking-widest"
                  >
                    123456
                  </Text>
                </View>
              </View>
            </View>
          </View> */}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default OtpVerification;
