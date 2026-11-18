import { createContext, useContext, useState, type PropsWithChildren,} from "react";

import { useColorScheme } from "react-native";
import { DARK_THEME, LIGHT_THEME } from "../styles/style";
import type { ThemeColorsType } from "../types/ThemeColorsType";

type ThemeMode = "light" | "dark" | "system";
type ThemeName = "light" | "dark";

type ThemeContextType = {
  theme: ThemeName;
  themeMode: ThemeMode;
  colors: ThemeColorsType;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();

  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  const theme: ThemeName = themeMode === "system" ? systemTheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const isDark = theme === "dark";

  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  function toggleTheme() {
    setThemeMode(isDark ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        colors,
        isDark,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme deve ser utilizado dentro do ThemeProvider");
  }

  return context;
}