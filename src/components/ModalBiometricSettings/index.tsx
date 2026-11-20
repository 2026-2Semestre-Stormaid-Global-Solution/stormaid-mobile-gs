import { useState } from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AccountModalShell, { ModalAction } from "../AccountModalShell";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type Props = {
  visible: boolean;
  onClose: () => void;
  enabled: boolean;
  busy: boolean;
  onEnable: () => Promise<void>;
  onDisable: () => Promise<void>;
};

export default function ModalBiometricSettings({
  visible,
  onClose,
  enabled,
  busy,
  onEnable,
  onDisable,
}: Props) {
  const { colors } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    setSuccess(null);
    try {
      if (enabled) {
        await onDisable();
        setSuccess("Biometria desativada neste dispositivo.");
      } else {
        await onEnable();
        setSuccess("Biometria ativada para o acesso com o token atual.");
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível alterar a biometria.",
      );
    }
  }

  return (
    <AccountModalShell
      visible={visible}
      onClose={() => {
        setError(null);
        setSuccess(null);
        onClose();
      }}
      busy={busy}
      title="Acesso por biometria"
      subtitle="Use a digital ou o reconhecimento facial cadastrados no dispositivo."
      icon="finger-print-outline"
    >
      <View style={{ gap: 15 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            padding: 14,
            borderRadius: 14,
            backgroundColor: colors.cardActive + "70",
            alignItems: "center",
          }}
        >
          <Ionicons
            name={enabled ? "shield-checkmark-outline" : "lock-closed-outline"}
            size={26}
            color={colors.primary}
          />
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                fontFamily: FONTS.inter[700],
                color: colors.text,
                fontSize: 13,
              }}
            >
              {enabled ? "Biometria ativada" : "Biometria desativada"}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.inter[400],
                color: colors.textSecondary,
                fontSize: 11,
                lineHeight: 17,
              }}
            >
              {enabled
                ? "O login biométrico está disponível enquanto o token for válido."
                : "Ative para proteger o token de acesso no dispositivo."}
            </Text>
          </View>
        </View>
        {error && (
          <Text
            accessibilityRole="alert"
            style={{ color: colors.messageError, fontSize: 12 }}
          >
            {error}
          </Text>
        )}
        {success && (
          <Text
            accessibilityRole="alert"
            style={{ color: colors.primary, fontSize: 12 }}
          >
            {success}
          </Text>
        )}
        <ModalAction
          label={
            busy
              ? "Processando..."
              : enabled
                ? "Desativar biometria"
                : "Ativar biometria"
          }
          secondary={enabled}
          onPress={toggle}
          disabled={busy}
        />
        <ModalAction
          label="Fechar"
          secondary
          onPress={onClose}
          disabled={busy}
        />
      </View>
    </AccountModalShell>
  );
}
