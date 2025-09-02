import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id?: string;
  name: string;
  email?: string;
  username?: string;
  avatar?: string;
  joinDate?: string;
  // Personal Information from registration
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  sport?: string;
  adharNo?: string;
  profileImage?: string;
  // Additional user stats
  workouts?: number;
  streak?: number;
  goals?: string;
  calories?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clearToken: () => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: true,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      clearToken: () => set({ token: null }),
      setIsLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setIsLoading(false);
        }
      },
    }
  )
);
