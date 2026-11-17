import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}