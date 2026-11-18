import { useNavigation } from "@react-navigation/native";
import { Text, TouchableOpacity } from "react-native";
import { RootStackParamListType } from "../../types/RootStackParamListType";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TextLinkType } from "../../types/TextLinkType";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

export default function TextLink({
  route,
  text,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  fontFamily,
  fontSize,
  textAlign,
}: TextLinkType) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamListType>>();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(route)}
      style={{
        marginTop: marginTop || 10,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        marginRight: marginRight,
      }}
    >
      <Text
        style={{
          color: colors.link,
          fontFamily: fontFamily || FONTS.inter[600],
          fontSize: fontSize || 15,
          textAlign: textAlign,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
