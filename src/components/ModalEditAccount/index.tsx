import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import type { AuthUser } from "../../services/authService";
import AccountModalShell, { ModalAction } from "../AccountModalShell";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type Props = {
  visible: boolean;
  onClose: () => void;
  user: AuthUser | null;
  busy: boolean;
  onSave: (value: {
    fullName: string;
    phoneNumber: string;
  }) => Promise<unknown>;
};

export default function ModalEditAccount({
  visible,
  onClose,
  user,
  busy,
  onSave,
}: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(user?.fullName ?? "");
      setPhone(user?.phoneNumber ?? "");
      setAttempted(false);
      setError(null);
    }
  }, [visible, user?.fullName, user?.phoneNumber]);

  const nameInvalid = name.trim().length < 3 || name.trim().length > 150;
  const phoneInvalid =
    !/^\+?\d[\d\s()\-]{8,19}$/.test(phone.trim()) ||
    phone.replace(/\D/g, "").length < 10;

  async function submit() {
    if (busy) return;
    setAttempted(true);
    setError(null);
    if (nameInvalid || phoneInvalid) return;
    try {
      await onSave({ fullName: name.trim(), phoneNumber: phone.trim() });
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível salvar as alterações.",
      );
    }
  }

  return (
    <AccountModalShell
      visible={visible}
      onClose={onClose}
      busy={busy}
      title="Editar informações"
      subtitle="Atualize seu nome e telefone cadastrados na plataforma."
      icon="create-outline"
    >
      <View style={{ gap: 14 }}>
        <View style={{ gap: 7 }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: FONTS.inter[600],
              fontSize: 12,
            }}
          >
            Nome completo
          </Text>
          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              setError(null);
            }}
            autoCapitalize="words"
            maxLength={150}
            editable={!busy}
            placeholder="Informe seu nome completo"
            placeholderTextColor={colors.placeholder}
            style={{
              color: colors.text,
              fontFamily: FONTS.inter[400],
              borderColor:
                attempted && nameInvalid
                  ? colors.messageError
                  : colors.inputBorder + "7F",
              borderWidth: 1,
              backgroundColor: colors.inputBackground,
              borderRadius: 12,
              paddingHorizontal: 14,
              minHeight: 48,
            }}
          />
          {attempted && nameInvalid && (
            <Text style={{ color: colors.messageError, fontSize: 11 }}>
              Informe um nome entre 3 e 150 caracteres.
            </Text>
          )}
        </View>
        <View style={{ gap: 7 }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: FONTS.inter[600],
              fontSize: 12,
            }}
          >
            Telefone
          </Text>
          <TextInput
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              setError(null);
            }}
            keyboardType="phone-pad"
            maxLength={20}
            editable={!busy}
            placeholder="(11) 99999-9999"
            placeholderTextColor={colors.placeholder}
            style={{
              color: colors.text,
              fontFamily: FONTS.inter[400],
              borderColor:
                attempted && phoneInvalid
                  ? colors.messageError
                  : colors.inputBorder + "7F",
              borderWidth: 1,
              backgroundColor: colors.inputBackground,
              borderRadius: 12,
              paddingHorizontal: 14,
              minHeight: 48,
            }}
          />
          {attempted && phoneInvalid && (
            <Text style={{ color: colors.messageError, fontSize: 11 }}>
              Informe um telefone com DDD válido.
            </Text>
          )}
        </View>
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
              label={busy ? "Salvando..." : "Salvar"}
              onPress={submit}
              disabled={busy}
            />
          </View>
        </View>
      </View>
    </AccountModalShell>
  );
}
