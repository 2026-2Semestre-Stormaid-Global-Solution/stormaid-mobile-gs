import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeTabParamListType } from "../types/HomeTabParamListType";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { FONTS } from "../styles/style";
import HomeCitizenScreen from "../screens/HomeCitizenScreen";
import HomeRegulatorScreen from "../screens/HomeRegulatorScreen";
import HomeResponderScreen from "../screens/HomeResponderScreen";
import ContactsCitizenScreen from "../screens/ContactsCitizenScreen";
import AccountCitizenScreen from "../screens/AccountCitizenScreen";

const Tab = createBottomTabNavigator<HomeTabParamListType>();

type CitizenTabIconProps = {
  focused: boolean;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
};

function CitizenTabIcon({ focused, activeIcon, inactiveIcon }: CitizenTabIconProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: 46,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 22,
        backgroundColor: focused ? colors.onPrimary + "24" : "transparent",
      }}
    >
      <Ionicons
        name={focused ? activeIcon : inactiveIcon}
        size={24}
        color={colors.onPrimary}
      />
    </View>
  );
}

export default function TabNavigator() {
  const { colors } = useTheme();
  const { role } = useAuth();
  const insets = useSafeAreaInsets();
  const isCitizen = role === "CITIZEN";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isCitizen ? colors.onPrimary : colors.primary,
        tabBarInactiveTintColor: isCitizen ? colors.onPrimary : colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: FONTS.inter[600],
          fontSize: 11,
        },
        tabBarStyle: isCitizen
          ? {
              backgroundColor: colors.primary,
              borderTopWidth: 0,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              height: 78 + insets.bottom,
              paddingTop: 9,
              paddingBottom: Math.max(insets.bottom, 8),
              paddingHorizontal: 16,
              shadowColor: colors.text,
              shadowOpacity: 0.12,
              shadowOffset: { width: 0, height: -3 },
              shadowRadius: 10,
              elevation: 8,
            }
          : {
              backgroundColor: colors.surface,
              borderTopColor: colors.inputBorder,
            },
        tabBarItemStyle: isCitizen ? { paddingTop: 1 } : undefined,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        ),
      }}
    >
      {role === "CITIZEN" && (
        <>
          <Tab.Screen
            name="HomeCitizen"
            component={HomeCitizenScreen}
            options={{
              title: "Início",
              tabBarIcon: ({ focused }) => (
                <CitizenTabIcon
                  focused={focused}
                  activeIcon="home"
                  inactiveIcon="home-outline"
                />
              ),
            }}
          />
          <Tab.Screen
            name="ContactsCitizen"
            component={ContactsCitizenScreen}
            options={{
              title: "Contatos",
              tabBarIcon: ({ focused }) => (
                <CitizenTabIcon
                  focused={focused}
                  activeIcon="people"
                  inactiveIcon="people-outline"
                />
              ),
            }}
          />
          <Tab.Screen
            name="AccountCitizen"
            component={AccountCitizenScreen}
            options={{
              title: "Conta",
              tabBarIcon: ({ focused }) => (
                <CitizenTabIcon
                  focused={focused}
                  activeIcon="person-circle"
                  inactiveIcon="person-circle-outline"
                />
              ),
            }}
          />
        </>
      )}

      {role === "REGULATOR" && (
        <Tab.Screen
          name="HomeRegulator"
          component={HomeRegulatorScreen}
          options={{ title: "Início" }}
        />
      )}

      {role === "RESPONDER" && (
        <Tab.Screen
          name="HomeResponder"
          component={HomeResponderScreen}
          options={{ title: "Início" }}
        />
      )}
    </Tab.Navigator>
  );
}
