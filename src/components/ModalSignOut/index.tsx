import { useState } from "react";
import { Text, View } from "react-native";
import AccountModalShell, { ModalAction } from "../AccountModalShell";
import { useTheme } from "../../context/ThemeContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  busy: boolean;
};

export default function ModalSignOut({
  visible,
  onClose,
  onConfirm,
  busy,
}: Props) {
  const { colors } = useTheme();
  const [error, setError] = useState<string | null>(null);
  async function submit() {
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível encerrar a sessão.",
      );
    }
  }
  return (
    <AccountModalShell
      visible={visible}
      onClose={onClose}
      busy={busy}
      title="Sair da conta"
      subtitle="Deseja encerrar sua sessão neste dispositivo?"
      icon="log-out-outline"
    >
      <Text
        style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 19 }}
      >
      </Text>
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
            label={busy ? "Saindo..." : "Sair"}
            onPress={submit}
            disabled={busy}
          />
        </View>
      </View>
    </AccountModalShell>
  );
}
