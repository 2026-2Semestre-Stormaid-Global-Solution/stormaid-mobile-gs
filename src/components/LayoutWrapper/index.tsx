import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../context/ThemeContext";
import { LayoutWrapperType } from "../../types/LayoutWrapperType";

export default function LayoutWrapper({
  children,
  paddingHorizontal = 25,
  paddingBottom = 0,
  marginTop = 0,
  justifyContent,
  alignItems,
}: LayoutWrapperType) {

  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal,
          paddingBottom,
          marginTop,
          justifyContent,
          alignItems,
        }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
