import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { InputFormType } from "../../types/InputFormType";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

export default function InputForm({
  label,
  placeholder,
  error,
  isIcon,
  onPress,
  ...rest
}: InputFormType) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        gap: 5,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontFamily: FONTS.inter[600],
          fontSize: 20,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={error ? colors.messageError : colors.placeholder}
        {...rest}
        style={{
          borderWidth: 1.5,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          color: colors.text,
          padding: 15,
          fontFamily: FONTS.inter[500],
          fontSize: 16,
        }}
      />

      <TouchableOpacity
        onPress={onPress}
        style={{
          position: "absolute",
          alignItems: "flex-end",
          top: 50,
          right: 15,
        }}
      >
        {isIcon}
      </TouchableOpacity>
    </View>
  );
}