import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamListType } from "../types/RootStackParamListType";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LoginScreen from "../screens/LoginScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import SendCodeToEmailScreen from "../screens/SendCodeToEmailScreen";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator<RootStackParamListType>();

export default function AppNavigator() {
  const { role, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {role ? (
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />

          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />

          <Stack.Screen
            name="SendCodeToEmail"
            component={SendCodeToEmailScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}