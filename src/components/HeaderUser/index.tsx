import { Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import ImageUser from "../ImageUser";
import { useAuth } from "../../context/AuthContext";

export default function HeaderUser() {
  const { colors } = useTheme();
  const hour = new Date().getHours();
  const { user, role } = useAuth();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

const firstName = user?.fullName?.trim().split(/\s+/)[0];

const subtitle =
  role === "REGULATOR"
    ? "Acompanhe e valide as solicitações de emergência."
    : role === "RESPONDER"
      ? "Confira seus acionamentos e ajude quem precisa."
      : "Sua segurança é nossa prioridade.";

  return (
    <View
      style={{
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        paddingHorizontal: 22,
        paddingTop: 28,
        paddingBottom: 54,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: FONTS.sora[700],
              color: colors.onPrimary,
              fontSize: 24,
            }}
          >
            {greeting}{firstName ? `, ${firstName}!` : "!"}
          </Text>

          <Text
            style={{
              fontFamily: FONTS.inter[400],
              color: colors.onPrimary,
              opacity: 0.88,
              fontSize: 13,
              marginTop: 7,
            }}
          >
            {subtitle}
          </Text>
        </View>

        <ImageUser />
      </View>
    </View>
  );
}
