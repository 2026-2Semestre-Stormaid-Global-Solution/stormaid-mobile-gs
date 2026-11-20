import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

export type AccountSettingKey =
  | "edit"
  | "biometric"
  | "appearance"
  | "about"
  | "logout"
  | "deactivate";

type Props = {
  onSelect: (key: AccountSettingKey) => void;
  biometricsEnabled: boolean;
};

const OPTIONS: Array<{
  key: AccountSettingKey;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  destructive?: boolean;
}> = [
  {
    key: "edit",
    icon: "create-outline",
    title: "Editar informações",
    subtitle: "Atualize seu nome e telefone",
  },
  {
    key: "biometric",
    icon: "finger-print-outline",
    title: "Biometria",
    subtitle: "Proteja seu acesso com digital ou rosto",
  },
  {
    key: "appearance",
    icon: "color-palette-outline",
    title: "Aparência",
    subtitle: "Escolha o tema do aplicativo",
  },
  {
    key: "about",
    icon: "information-circle-outline",
    title: "Sobre o aplicativo",
    subtitle: "Versão, projeto e informações técnicas",
  },
  {
    key: "logout",
    icon: "log-out-outline",
    title: "Sair da conta",
    subtitle: "Encerre seu acesso neste dispositivo",
  },
  {
    key: "deactivate",
    icon: "trash-outline",
    title: "Excluir conta",
    subtitle: "Desative o seu acesso à plataforma",
    destructive: true,
  },
];

export default function CardAccountSettings({
  onSelect,
  biometricsEnabled,
}: Props) {
  const { colors, isDark } = useTheme();
  const danger = colors.messageError;

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 3, paddingHorizontal: 3 }}>
        <Text
          style={{
            color: colors.text,
            fontFamily: FONTS.sora[700],
            fontSize: 18,
          }}
        >
          Configurações
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: FONTS.inter[400],
            fontSize: 12,
          }}
        >
          Gerencie seus dados, privacidade e preferências.
        </Text>
      </View>
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.inputBorder + "3B",
          borderRadius: 20,
          backgroundColor: colors.surface,
          overflow: "hidden",
          elevation: 2,
          shadowColor: "#000000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        {OPTIONS.map((item, index) => {
          const isDanger = !!item.destructive;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => onSelect(item.key)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 15,
                gap: 12,
                opacity: pressed ? 0.7 : 1,
                backgroundColor: pressed
                  ? colors.cardActive + "25"
                  : "transparent",
              })}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  backgroundColor: isDanger
                    ? colors.backgroundError
                    : isDark
                      ? colors.primary + "26"
                      : colors.cardActive,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={21}
                  color={isDanger ? danger : colors.primary}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text
                    style={{
                      color: isDanger ? danger : colors.text,
                      fontFamily: FONTS.inter[600],
                      fontSize: 14,
                    }}
                  >
                    {item.title}
                  </Text>
                  {item.key === "biometric" && biometricsEnabled && (
                    <View
                      style={{
                        paddingHorizontal: 7,
                        paddingVertical: 3,
                        borderRadius: 9,
                        backgroundColor: colors.cardActive,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: FONTS.inter[600],
                          fontSize: 9,
                        }}
                      >
                        Ativada
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: FONTS.inter[400],
                    fontSize: 11,
                    lineHeight: 16,
                  }}
                >
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={17}
                color={isDanger ? danger : colors.textSecondary}
              />
              {index !== OPTIONS.length - 1 && (
                <View
                  style={{
                    position: "absolute",
                    height: 1,
                    bottom: 0,
                    left: 70,
                    right: 16,
                    backgroundColor: colors.inputBorder + "28",
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
