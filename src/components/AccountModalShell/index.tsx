import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  busy?: boolean;
  danger?: boolean;
};

export default function AccountModalShell({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  children,
  busy = false,
  danger = false,
}: Props) {
  const { colors, isDark } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!busy) onClose();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: "#000000AA",
          justifyContent: "center",
          paddingHorizontal: 18,
          paddingVertical: 32,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 22,
            maxHeight: "96%",
            overflow: "hidden",
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 22, gap: 18 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: danger
                    ? colors.backgroundError
                    : isDark
                      ? colors.primary + "25"
                      : colors.cardActive,
                }}
              >
                <Ionicons
                  name={icon}
                  size={24}
                  color={danger ? colors.messageError : colors.primary}
                />
              </View>
              <View style={{ flex: 1, gap: 5, paddingTop: 2 }}>
                <Text
                  accessibilityRole="header"
                  style={{
                    fontFamily: FONTS.sora[700],
                    fontSize: 18,
                    color: colors.text,
                  }}
                >
                  {title}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.inter[400],
                    color: colors.textSecondary,
                    fontSize: 12,
                    lineHeight: 19,
                  }}
                >
                  {subtitle}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                onPress={onClose}
                disabled={busy}
                hitSlop={12}
                style={{ padding: 2 }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={24}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ModalAction({
  label,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const fill = danger ? colors.messageError : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 13,
        borderWidth: secondary ? 1 : 0,
        borderColor: danger ? colors.messageError : colors.inputBorder,
        backgroundColor: secondary ? "transparent" : fill,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          color: secondary
            ? danger
              ? colors.messageError
              : colors.text
            : danger
              ? "#FFFFFF"
              : colors.onPrimary,
          fontFamily: FONTS.inter[700],
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
