
import { TouchableOpacity } from "react-native";
import { CardTouchableType } from "../../types/CardTouchableType";
import { useTheme } from "../../context/ThemeContext";

export default function CardTouchable({
  children,
  width,
  flexDirection,
  alignItems,
  justifyContent,
  gap,
  borderBottomWidth,
  borderTopWidth,
  borderRightWidth,
  borderLeftWidth,
  borderWidth,
  borderRadius,
  borderColor,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  backgorundColor,
  isActive,
  ...rest
}: CardTouchableType) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      {...rest}
      style={{
        width,
        flexDirection: flexDirection || "row",
        alignItems: alignItems || "center",
        justifyContent,
        gap: gap ?? 13,
        borderBottomWidth,
        borderTopWidth,
        borderRightWidth,
        borderLeftWidth,
        borderWidth: borderWidth ?? 2,
        borderRadius: borderRadius ?? 16,
        borderColor: borderColor ?? (isActive ? colors.border : colors.borderNotActive),
        paddingTop: paddingTop ?? 25,
        paddingBottom: paddingBottom ?? 25,
        paddingLeft: paddingLeft ?? 15,
        paddingRight: paddingRight ?? 15,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        backgroundColor: backgorundColor ?? (isActive ? colors.cardActive : colors.surface),
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
