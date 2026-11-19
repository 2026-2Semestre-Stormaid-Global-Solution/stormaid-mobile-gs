import { TouchableOpacity, View } from "react-native";
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
}: CardTouchableType) {

    const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={{
        width: width,
        flexDirection: flexDirection || "row",
        alignItems: alignItems || "center",
        justifyContent: justifyContent,
        gap: gap || 13,
        borderBottomWidth: borderBottomWidth,
        borderTopWidth: borderTopWidth,
        borderRightWidth: borderRightWidth,
        borderLeftWidth: borderLeftWidth,
        borderWidth: borderWidth || 2,
        borderRadius: borderRadius || 16,
        borderColor: borderColor || isActive ? colors.border : colors.borderNotActive,
        paddingTop: paddingTop || 25,
        paddingBottom: paddingBottom || 25,
        paddingLeft: paddingLeft || 15,
        paddingRight: paddingRight || 15,
        marginTop: marginTop,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        marginRight: marginRight,
        backgroundColor: backgorundColor || isActive ? colors.cardActive : colors.surface,
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
