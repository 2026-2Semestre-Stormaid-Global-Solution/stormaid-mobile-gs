import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type Props = { visible: boolean; onClose: () => void };

const VERSION = process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0";
const COMMIT = process.env.EXPO_PUBLIC_GIT_COMMIT;
const BRANCH = process.env.EXPO_PUBLIC_GIT_BRANCH;
const PUBLISHED = process.env.EXPO_PUBLIC_RELEASE_DATE;

function DetailRow({
  icon,
  title,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        minHeight: 53,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.inputBorder + "40",
      }}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text
        style={{
          flex: 1,
          color: colors.textSecondary,
          fontFamily: FONTS.inter[400],
          fontSize: 12,
        }}
      >
        {title}
      </Text>
      <Text
        selectable
        style={{
          flex: 1,
          textAlign: "right",
          color: colors.text,
          fontFamily: FONTS.inter[600],
          fontSize: 12,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ModalAboutStormAid({ visible, onClose }: Props) {
  const { colors, isDark } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top", "bottom"]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 22,
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Voltar para minha conta"
            style={{ width: 46 }}
          >
            <Ionicons name="arrow-back" size={26} color={colors.onPrimary} />
          </Pressable>
          <Text
            accessibilityRole="header"
            style={{
              flex: 1,
              textAlign: "center",
              color: colors.onPrimary,
              fontFamily: FONTS.sora[700],
              fontSize: 19,
            }}
          >
            Sobre o app
          </Text>
          <View style={{ width: 46 }} />
        </View>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 19,
            paddingTop: 24,
            paddingBottom: 35,
            gap: 27,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 150,
                height: 150,
                borderRadius: 33,
                backgroundColor: isDark ? colors.surface : colors.cardActive,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.primary + "36",
              }}
            >
              <Image
                source={require("../../assets/logo_stormaid.png")}
                resizeMode="contain"
                style={{ width: 114, height: 114 }}
              />
            </View>
            <Text
              style={{
                color: colors.text,
                fontFamily: FONTS.sora[700],
                fontSize: 21,
              }}
            >
              Storm Aid
            </Text>
            <Text
              style={{
                color: colors.primary,
                fontFamily: FONTS.inter[600],
                fontSize: 13,
              }}
            >
              Versão {VERSION}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: FONTS.inter[400],
                fontSize: 12,
                lineHeight: 19,
                textAlign: "center",
                maxWidth: 300,
              }}
            >
              Tecnologia para conectar cidadãos e equipes de atendimento em
              situações de emergência.
            </Text>
          </View>

          <View style={{ gap: 11 }}>
            <Text
              style={{
                color: colors.text,
                fontFamily: FONTS.sora[700],
                fontSize: 17,
              }}
            >
              Detalhes da versão
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.inputBorder + "58",
                borderWidth: 1,
                paddingHorizontal: 17,
                paddingVertical: 8,
                borderRadius: 17,
                shadowColor: "#000000",
                shadowOpacity: 0.07,
                shadowRadius: 7,
                shadowOffset: { width: 0, height: 3 },
                elevation: 2,
              }}
            >
              {COMMIT ? (
                <View
                  style={{
                    backgroundColor: isDark
                      ? colors.primary + "25"
                      : colors.cardActive,
                    padding: 13,
                    borderRadius: 12,
                    marginTop: 9,
                    marginBottom: 5,
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <Ionicons
                      name="git-commit-outline"
                      size={17}
                      color={colors.primary}
                    />
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: FONTS.inter[600],
                        fontSize: 12,
                      }}
                    >
                      Hash do commit
                    </Text>
                  </View>
                  <Text
                    selectable
                    style={{
                      color: colors.primary,
                      fontFamily: FONTS.inter[400],
                      fontSize: 11,
                    }}
                  >
                    {COMMIT}
                  </Text>
                </View>
              ) : null}
              <DetailRow
                icon="phone-portrait-outline"
                title="Versão"
                value={VERSION}
              />
              <DetailRow
                icon="code-slash-outline"
                title="Plataforma"
                value="React Native / Expo"
              />
              {BRANCH && (
                <DetailRow
                  icon="git-branch-outline"
                  title="Branch"
                  value={BRANCH}
                />
              )}
              {PUBLISHED && (
                <DetailRow
                  icon="calendar-outline"
                  title="Publicado em"
                  value={PUBLISHED}
                />
              )}
              <DetailRow
                icon="school-outline"
                title="Projeto"
                value="FIAP · CitizenTech 2026"
                last
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
