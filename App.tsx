import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./src/context/AuthContext";
import { OrgProductProvider } from "./src/context/OrgProductContext";
import {
  ThemeProvider as DesignThemeProvider,
  useTheme,
} from "./src/theme/ThemeProvider";
import Navigation from "./src/navigation/root";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInner() {
  const { colors, isDark } = useTheme();

  const navTheme = {
    dark: isDark,
    colors: {
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.danger,
    },
    fonts: {
      regular: { fontFamily: "System", fontWeight: "400" as const },
      medium: { fontFamily: "System", fontWeight: "500" as const },
      bold: { fontFamily: "System", fontWeight: "700" as const },
      heavy: { fontFamily: "System", fontWeight: "900" as const },
    },
  };

  return (
    <>
      <Navigation theme={navTheme} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <DesignThemeProvider>
          <AuthProvider>
            <OrgProductProvider>
              <AppInner />
            </OrgProductProvider>
          </AuthProvider>
        </DesignThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
