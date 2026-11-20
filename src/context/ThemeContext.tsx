import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { DARK_THEME, LIGHT_THEME } from "../styles/style";
import type { ThemeColorsType } from "../types/ThemeColorsType";

export type ThemeMode = "light" | "dark" | "system";
type ThemeName = "light" | "dark";

type ThemeContextType = {
  theme: ThemeName;
  themeMode: ThemeMode;
  colors: ThemeColorsType;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const THEME_KEY = "stormaid_theme_mode";
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();
  const [themeMode, setCurrentThemeMode] = useState<ThemeMode>("system");

  useEffect(() => {
    let active = true;
    SecureStore.getItemAsync(THEME_KEY)
      .then((saved) => {
        if (active && (saved === "light" || saved === "dark" || saved === "system")) {
          setCurrentThemeMode(saved);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const theme: ThemeName = themeMode === "system"
    ? systemTheme === "dark" ? "dark" : "light"
    : themeMode;
  const isDark = theme === "dark";
  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  function setThemeMode(mode: ThemeMode) {
    setCurrentThemeMode(mode);
    SecureStore.setItemAsync(THEME_KEY, mode).catch(() => {});
  }

  function toggleTheme() {
    setThemeMode(isDark ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      themeMode,
      colors,
      isDark,
      toggleTheme,
      setThemeMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser utilizado dentro do ThemeProvider");
  return context;
}
