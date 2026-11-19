import { Text, View } from "react-native";
import TextLink from "../../components/TextLink";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

export default function HeaderCreateAccount() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 20,
      }}
    >
      <TextLink
        route="Login"
        alignItems="flex-start"
        iconLeft={
          <AntDesign name="arrow-left" size={24} color={colors.iconArrowLeft} />
        }
      />

      <Text
        style={{
          color: colors.text,
          marginTop: 7,
          fontSize: 18,
          fontFamily: FONTS.sora[700]
        }}
      >
        Criar conta
      </Text>
    </View>
  );
}
