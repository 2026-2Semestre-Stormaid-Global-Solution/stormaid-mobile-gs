import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { InputFormType } from "../../types/InputFormType";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

export default function InputForm({
  label,
  placeholder,
  error = false,
  isIcon,
  onPress,
  fontSizeLabel,
  color,
  gap,
  ...rest
}: InputFormType) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        gap: gap || 5,
      }}
    >
      <Text
        style={{
          color: color || colors.label,
          fontFamily: FONTS.inter[600],
          fontSize: fontSizeLabel || 20,
        }}
      >
        {label}
      </Text>

      <TextInput
        {...rest}
        placeholder={placeholder}
        placeholderTextColor={
          error ? colors.inputBorderError : colors.placeholder
        }
        style={{
          borderWidth: 1.5,
          borderColor: error ? colors.inputBorderError : colors.inputBorder,
          borderRadius: 12,
          backgroundColor: colors.inputBackground,
          color: colors.text,
          padding: 15,
          paddingRight: isIcon ? 48 : 15,
          fontFamily: FONTS.inter[500],
          fontSize: 16,
        }}
      />

      {isIcon && (
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="button"
          style={{
            position: "absolute",
            alignItems: "flex-end",
            top: 50,
            right: 15,
          }}
        >
          {isIcon}
        </TouchableOpacity>
      )}
    </View>
  );
}
