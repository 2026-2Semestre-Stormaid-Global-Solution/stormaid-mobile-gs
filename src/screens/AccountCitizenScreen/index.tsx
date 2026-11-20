import { useState } from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import LayoutWrapper from "../../components/LayoutWrapper";
import PageHeader from "../../components/PageHeader";
import ProfilePhotoPicker from "../../components/ProfilePhotoPicker";
import CardAccountSettings, { type AccountSettingKey } from "../../components/CardAccountSettings";
import ModalEditAccount from "../../components/ModalEditAccount";
import ModalBiometricSettings from "../../components/ModalBiometricSettings";
import ModalAppearanceSettings from "../../components/ModalAppearanceSettings";
import ModalSignOut from "../../components/ModalSignOut";
import ModalDeactivateAccount from "../../components/ModalDeactivateAccount";
import ModalAboutStormAid from "../../components/ModalAboutStormAid";
import { useAccountSettings } from "../../hooks/useAccountSettings";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

export default function AccountCitizenScreen() {
  const { colors, isDark } = useTheme();
  const [activeModal, setActiveModal] = useState<AccountSettingKey | null>(null);
  const {
    user, pending, biometricsEnabled, updateAccount,
    deactivateAccount, logout, activateBiometrics, removeBiometrics,
  } = useAccountSettings();

  const closeModal = () => setActiveModal(null);

  return (
    <LayoutWrapper paddingHorizontal={0} paddingBottom={35}>
      <PageHeader
        title="Minha conta"
        subtitle="Gerencie seu perfil e as configurações de segurança."
        icon="person-outline"
      />

      <View style={{ paddingHorizontal: 19, paddingTop: 24, gap: 26 }}>
        <View style={{
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: 23,
          backgroundColor: colors.surface,
          borderRadius: 21,
          borderWidth: 1,
          borderColor: colors.inputBorder + "40",
          elevation: 2,
          shadowColor: "#000000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}>
          <ProfilePhotoPicker />
          <Text style={{ color: colors.text, fontFamily: FONTS.sora[700], fontSize: 19, textAlign: "center" }}>
            {user?.fullName || "Meu perfil"}
          </Text>
          {user?.email && (
            <Text style={{ color: colors.textSecondary, fontFamily: FONTS.inter[400], fontSize: 12, textAlign: "center", marginTop: 7 }}>
              {user.email}
            </Text>
          )}
          <View style={{ marginTop: 15, backgroundColor: isDark ? colors.primary + "26" : colors.cardActive, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", gap: 6, alignItems: "center" }}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
            <Text style={{ fontFamily: FONTS.inter[600], fontSize: 11, color: colors.primary }}>Perfil cidadão</Text>
          </View>
        </View>

        <CardAccountSettings onSelect={setActiveModal} biometricsEnabled={biometricsEnabled} />
      </View>

      <ModalEditAccount
        visible={activeModal === "edit"}
        onClose={closeModal}
        user={user}
        busy={pending === "editing"}
        onSave={updateAccount}
      />
      <ModalBiometricSettings
        visible={activeModal === "biometric"}
        onClose={closeModal}
        enabled={biometricsEnabled}
        busy={pending === "enablingBiometrics" || pending === "disablingBiometrics"}
        onEnable={activateBiometrics}
        onDisable={removeBiometrics}
      />
      <ModalAppearanceSettings visible={activeModal === "appearance"} onClose={closeModal} />
      <ModalSignOut visible={activeModal === "logout"} onClose={closeModal} onConfirm={logout} busy={pending === "signingOut"} />
      <ModalDeactivateAccount visible={activeModal === "deactivate"} onClose={closeModal} onConfirm={deactivateAccount} busy={pending === "deactivating"} />
      <ModalAboutStormAid visible={activeModal === "about"} onClose={closeModal} />
    </LayoutWrapper>
  );
}
