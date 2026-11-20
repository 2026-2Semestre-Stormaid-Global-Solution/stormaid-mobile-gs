import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.primary,
        paddingTop: 22,
        paddingBottom: 27,
        paddingHorizontal: 22,
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: 145,
          height: 145,
          borderRadius: 73,
          borderWidth: 1,
          borderColor: colors.onPrimary,
          opacity: 0.12,
          right: -62,
          top: -65,
        }}
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: colors.onPrimary + "1C",
            borderWidth: 1,
            borderColor: colors.onPrimary + "32",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={23} color={colors.onPrimary} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text
            accessibilityRole="header"
            style={{
              color: colors.onPrimary,
              fontFamily: FONTS.sora[700],
              fontSize: 20,
              lineHeight: 27,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: colors.onPrimary,
              opacity: 0.88,
              fontFamily: FONTS.inter[400],
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}
