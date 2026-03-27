import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useColorScheme, Appearance } from "react-native";

import { ColorTheme, COLORS_LIGHT, COLORS_DARK } from "./colors";
import { borderRadius, BorderRadius } from "./border-radius";
import { spacing, Spacing } from "./spacing";
import { storage, STORAGE_KEYS } from "../utils/storage";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  mode: ThemeMode;
  colors: ColorTheme;
  spacing: Spacing;
  borderRadius: BorderRadius;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  mode: "system",
  colors: COLORS_LIGHT,
  spacing,
  borderRadius,
  isDark: false,
  setTheme: () => {},
  setMode: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = storage.getString(STORAGE_KEYS.THEME) as ThemeMode | undefined;
    return stored && ["light", "dark", "system"].includes(stored) ? stored : defaultTheme;
  });

  const setTheme = useCallback((next: ThemeMode) => {
    storage.setString(STORAGE_KEYS.THEME, next);
    setThemeState(next);
  }, []);

  // Determine if dark mode is active
  const isDark =
    theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  // const isDark = false;
  // Get the appropriate color palette
  const currentColors = isDark ? COLORS_DARK : COLORS_LIGHT;

  // Sync native appearance so liquid glass and other native elements match
  useEffect(() => {
    if (theme === "system") {
      Appearance.setColorScheme('unspecified');
    } else {
      Appearance.setColorScheme(theme);
    }
  }, [theme]);

  const value = {
    theme,
    mode: theme,
    colors: currentColors,
    spacing,
    borderRadius,
    isDark,
    setTheme,
    setMode: setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider;
