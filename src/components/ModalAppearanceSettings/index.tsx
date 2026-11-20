import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AccountModalShell, { ModalAction } from "../AccountModalShell";
import { useTheme, type ThemeMode } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type Props = { visible: boolean; onClose: () => void };

const OPTIONS: Array<{
  key: ThemeMode;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    key: "light",
    label: "Claro",
    description: "Cores claras no aplicativo",
    icon: "sunny-outline",
  },
  {
    key: "dark",
    label: "Escuro",
    description: "Cores escuras no aplicativo",
    icon: "moon-outline",
  },
  {
    key: "system",
    label: "Automático",
    description: "Acompanha o tema do dispositivo",
    icon: "phone-portrait-outline",
  },
];

export default function ModalAppearanceSettings({ visible, onClose }: Props) {
  const { colors, themeMode, setThemeMode } = useTheme();
  return (
    <AccountModalShell
      visible={visible}
      onClose={onClose}
      title="Aparência"
      subtitle="Personalize como o Storm Aid aparece na sua tela."
      icon="color-palette-outline"
    >
      <View style={{ gap: 8 }}>
        {OPTIONS.map((item) => {
          const selected = item.key === themeMode;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setThemeMode(item.key)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderRadius: 13,
                borderWidth: 1,
                borderColor: selected
                  ? colors.primary
                  : colors.inputBorder + "55",
                backgroundColor: selected
                  ? colors.cardActive + "65"
                  : "transparent",
                padding: 14,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Ionicons name={item.icon} size={22} color={colors.primary} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontFamily: FONTS.inter[600],
                    fontSize: 13,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: FONTS.inter[400],
                    fontSize: 11,
                  }}
                >
                  {item.description}
                </Text>
              </View>
              <Ionicons
                name={selected ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selected ? colors.primary : colors.textSecondary}
              />
            </Pressable>
          );
        })}
        <Text
          style={{ color: colors.textSecondary, fontSize: 11, marginTop: 3 }}
        >
          Sua preferência fica salva neste dispositivo.
        </Text>
        <ModalAction label="Concluir" onPress={onClose} />
      </View>
    </AccountModalShell>
  );
}
