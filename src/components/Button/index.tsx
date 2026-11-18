import { Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import { ButtonType } from "../../types/ButtonType";

export default function Button({
  backgroundColor,
  paddingTop,
  paddingBottom,
  width,
  borderRadius,
  fontFamily,
  fontSize,
  colorText,
  iconRight,
  iconLeft,
  gap,
  text,
  borderWidth,
  borderColor,
  ...rest
}: ButtonType) {

  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={{
        paddingTop: paddingTop || 11,
        paddingBottom: paddingBottom || 12,
        width: width || 300,
        backgroundColor: backgroundColor || colors.primary,
        borderRadius: borderRadius || 12,
        borderWidth: borderWidth,
        borderColor: borderColor,
        gap: gap || 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      {...rest}
      >
        {iconLeft}
      <Text
        style={{
          color: colorText || colors.textButton,
          fontFamily: fontFamily || FONTS.inter[600],
          fontSize: fontSize || 22,
        }}
      >
        {text}
      </Text>
        {iconRight}
    </TouchableOpacity>
  );
}