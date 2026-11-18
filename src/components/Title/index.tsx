import { Text } from "react-native";
import { FONTS } from "../../styles/style";
import { useTheme } from "../../context/ThemeContext";
import { TitleType } from "../../types/TitleType";

export default function Title({
  text,
  textAlign,
  fontSize,
  color,
  fontFamily,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
}: TitleType) {
  const { colors } = useTheme();

  return (
    <Text
      style={{
        textAlign: textAlign,
        fontSize: fontSize || 28,
        color: color || colors.text,
        fontFamily: fontFamily || FONTS.sora[700],
        marginTop: marginTop,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        marginRight: marginRight,
      }}
    >
      {text}
    </Text>
  );
}
