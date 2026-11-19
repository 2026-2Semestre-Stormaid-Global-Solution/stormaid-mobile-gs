import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type CardWeatherAlertProps = {
  title: string;
  description: string;
  loading?: boolean;
  error?: boolean;
  onPress?: () => void;
};

export default function CardWeatherAlert({
  title,
  description,
  loading = false,
  error = false,
  onPress,
}: CardWeatherAlertProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || !onPress}
      accessibilityRole="button"
      accessibilityLabel="Consultar condições meteorológicas"
      accessibilityState={{ disabled: loading || !onPress }}
      style={{
        marginHorizontal: 17,
        marginTop: -29,
        backgroundColor: colors.surface,
        borderRadius: 17,
        padding: 16,
        borderWidth: 1,
        borderColor: error
          ? colors.inputBorderError
          : colors.inputBorder + "45",
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
          backgroundColor: error ? colors.backgroundError : colors.cardActive,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={error ? "alert-circle-outline" : "cloud-outline"}
          size={25}
          color={error ? colors.messageError : colors.link}
        />
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
            color: error ? colors.messageError : colors.textSecondary,
            fontSize: 11,
            lineHeight: 17,
            marginTop: 4,
          }}
        >
          {loading ? "Consultando condições meteorológicas..." : description}
        </Text>
      </View>

      <Ionicons
        name={loading ? "hourglass-outline" : "chevron-forward-outline"}
        size={17}
        color={colors.textSecondary}
      />
    </Pressable>
  );
}
