import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function AuthLayout() {
  const { token } = useAuthStore();

  if (token) {
    return <Redirect href="/(app)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: {
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
        }}
      />
    </Stack>
  );
}
