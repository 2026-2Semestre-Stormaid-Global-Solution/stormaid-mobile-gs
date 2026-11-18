import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { HomeTabParamListType } from "../types/HomeTabParamListType";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import HomeCitizenScreen from "../screens/HomeCitizenScreen";
import HomeRegulatorScreen from "../screens/HomeRegulatorScreen";
import HomeResponderScreen from "../screens/HomeResponderScreen";

const Tab = createBottomTabNavigator<HomeTabParamListType>();

export default function TabNavigator() {
  const { colors } = useTheme();
  const { role } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.inputBorder,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name="home-outline"
            size={size}
            color={color}
          />
        ),
      }}
    >
      {role === "CITIZEN" && (
        <Tab.Screen
          name="HomeCitizen"
          component={HomeCitizenScreen}
          options={{
            title: "Início",
          }}
        />
      )}

      {role === "REGULATOR" && (
        <Tab.Screen
          name="HomeRegulator"
          component={HomeRegulatorScreen}
          options={{
            title: "Início",
          }}
        />
      )}

      {role === "RESPONDER" && (
        <Tab.Screen
          name="HomeResponder"
          component={HomeResponderScreen}
          options={{
            title: "Início",
          }}
        />
      )}
    </Tab.Navigator>
  );
}