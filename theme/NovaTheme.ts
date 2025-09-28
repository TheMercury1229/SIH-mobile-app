/**
 * NovaTheme - Consistent color scheme for the entire app
 * Replaces all gradient backgrounds with solid colors
 */

export const NovaTheme = {
  colors: {
    // Primary Colors
    primary: "#667eea", // Main brand color (blue-purple)
    primaryDark: "#5a67d8", // Darker variant for hover/active states
    secondary: "#764ba2", // Secondary accent color (purple)
    secondaryDark: "#6b46c1", // Darker variant

    // Background Colors
    background: "#0f172a", // Main dark background
    surface: "#1e293b", // Card/surface background
    surfaceLight: "#334155", // Lighter surface variant

    // Text Colors
    textPrimary: "#ffffff", // Primary text (white)
    textSecondary: "#cbd5e1", // Secondary text (light gray)
    textMuted: "#64748b", // Muted text (gray)

    // Status Colors
    success: "#10b981", // Green for success states
    warning: "#f59e0b", // Orange for warnings
    error: "#ef4444", // Red for errors
    info: "#06b6d4", // Cyan for info

    // Accent Colors
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",

    // Overlay Colors
    overlay: "rgba(0, 0, 0, 0.5)",
    backdropLight: "rgba(255, 255, 255, 0.1)",
    backdropDark: "rgba(0, 0, 0, 0.2)",
  },

  // Component-specific color mappings
  components: {
    tabBar: {
      background: "#1e293b",
      active: "#ffffff",
      inactive: "rgba(255, 255, 255, 0.6)",
    },
    button: {
      primary: "#667eea",
      primaryText: "#ffffff",
      secondary: "#1e293b",
      secondaryText: "#ffffff",
      success: "#10b981",
      successText: "#ffffff",
      disabled: "#64748b",
      disabledText: "#94a3b8",
    },
    card: {
      background: "#1e293b",
      border: "#334155",
    },
    input: {
      background: "#334155",
      border: "#475569",
      text: "#ffffff",
      placeholder: "#94a3b8",
    },
  },
} as const;

export type NovaThemeColors = typeof NovaTheme.colors;
export type NovaThemeComponents = typeof NovaTheme.components;
