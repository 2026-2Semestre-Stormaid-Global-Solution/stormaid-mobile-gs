import { Text, View } from "react-native";
import LayoutWrapper from "../../components/LayoutWrapper";
import PageHeader from "../../components/PageHeader";
import ProfilePhotoPicker from "../../components/ProfilePhotoPicker";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FONTS } from "../../styles/style";

export default function AccountCitizenScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <LayoutWrapper paddingHorizontal={0} paddingBottom={25}>
      <PageHeader
        title="Minha conta"
        subtitle="Confira seus dados e personalize sua foto de perfil."
        icon="person-outline"
      />

      <View style={{ paddingHorizontal: 20, paddingTop: 27 }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.inputBorder + "35",
            paddingHorizontal: 20,
            paddingTop: 6,
            paddingBottom: 24,
            alignItems: "center",
            shadowColor: colors.text,
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <ProfilePhotoPicker />
          <Text
            style={{
              color: colors.text,
              fontFamily: FONTS.sora[700],
              fontSize: 18,
              textAlign: "center",
            }}
          >
            {user?.fullName || "Meu perfil"}
          </Text>
          {user?.email ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: FONTS.inter[400],
                fontSize: 13,
                textAlign: "center",
                marginTop: 6,
              }}
            >
              {user.email}
            </Text>
          ) : null}
        </View>
      </View>
    </LayoutWrapper>
  );
}
