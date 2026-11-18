import { Text } from "react-native";
import { FONTS } from "../../styles/style";
import { useTheme } from "../../context/ThemeContext";
import { SubTitleType } from "../../types/SubTitleType";

export default function SubTitle({
  fontFamily,
  fontSize,
  color,
  text,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
}: SubTitleType) {
  const { colors } = useTheme();

  return (
    <Text
      style={{
        fontFamily: fontFamily || FONTS.inter[400],
        fontSize: fontSize || 14,
        color: color || colors.textSecondary,
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