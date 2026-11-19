import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type CardWeatherAlertProps = {
  title: string;
  description: string;
  loading?: boolean;
};

export default function CardWeatherAlert({
  title,
  description,
  loading = false,
}: CardWeatherAlertProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginHorizontal: 17,
        marginTop: -29,
        backgroundColor: colors.surface,
        borderRadius: 17,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.inputBorder + "45",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          backgroundColor: colors.cardActive,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="cloud-outline" size={25} color={colors.link} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONTS.inter[700],
            color: colors.text,
            fontSize: 13,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontFamily: FONTS.inter[400],
            color: colors.textSecondary,
            fontSize: 11,
            lineHeight: 17,
            marginTop: 4,
          }}
        >
          {loading ? "Carregando informações meteorológicas..." : description}
        </Text>
      </View>
    </View>
  );
}
