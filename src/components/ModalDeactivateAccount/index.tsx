import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import AccountModalShell, { ModalAction } from "../AccountModalShell";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  busy: boolean;
};

export default function ModalDeactivateAccount({
  visible,
  onClose,
  onConfirm,
  busy,
}: Props) {
  const { colors } = useTheme();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (confirmation.trim().toUpperCase() !== "EXCLUIR" || busy) return;
    setError(null);
    try {
      await onConfirm();
      setConfirmation("");
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível excluir a conta.",
      );
    }
  }

  return (
    <AccountModalShell
      visible={visible}
      onClose={() => {
        setConfirmation("");
        setError(null);
        onClose();
      }}
      busy={busy}
      title="Excluir minha conta"
      subtitle="Esta ação impede novos acessos com seu usuário."
      icon="trash-outline"
      danger
    >
      <View style={{ gap: 14 }}>
        <Text
          style={{
            color: colors.text,
            fontFamily: FONTS.inter[400],
            fontSize: 12,
          }}
        >
          Digite <Text style={{ fontFamily: FONTS.inter[700] }}>EXCLUIR</Text>{" "}
          para confirmar:
        </Text>
        <TextInput
          accessibilityLabel="Confirmação de desativação"
          value={confirmation}
          onChangeText={(value) => {
            setConfirmation(value);
            setError(null);
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!busy}
          placeholder="EXCLUIR"
          placeholderTextColor={colors.placeholder}
          style={{
            minHeight: 47,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            paddingHorizontal: 12,
            color: colors.text,
            fontFamily: FONTS.inter[600],
            backgroundColor: colors.inputBackground,
          }}
        />
        {error && (
          <Text
            accessibilityRole="alert"
            style={{ color: colors.messageError, fontSize: 12 }}
          >
            {error}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <ModalAction
              label="Cancelar"
              secondary
              onPress={onClose}
              disabled={busy}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ModalAction
              label={busy ? "Desativando..." : "Desativar"}
              danger
              onPress={submit}
              disabled={
                busy || confirmation.trim().toUpperCase() !== "EXCLUIR"
              }
            />
          </View>
        </View>
      </View>
    </AccountModalShell>
  );
}
