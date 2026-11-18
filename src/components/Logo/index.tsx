import { Image, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

export default function Logo({ isText = true }: { isText?: boolean }) {
    
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
      }}
    >
      <Image
        source={require("../../assets/logo_stormaid.png")}
        style={{
          width: 50,
          height: 50,
        }}
      />
      {isText && (
        <Text
          style={{
            fontSize: 28,
            color: colors.titleLogo,
            fontFamily: FONTS.inter[700],
          }}
        >
          Storm Aid
        </Text>
      )}
    </View>
  );
}