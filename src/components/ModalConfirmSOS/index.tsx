import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type ModalConfirmSOSProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
};

export default function ModalConfirmSOS({
  visible,
  onClose,
  onConfirm,
  loading = false,
  error = null,
}: ModalConfirmSOSProps) {
  const { colors } = useTheme();

  const canConfirm = Boolean(onConfirm) && !loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!loading) onClose();
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000AA",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 25,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 420,
            maxHeight: "90%",
            backgroundColor: colors.surface,
            borderRadius: 22,
            padding: 21,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 4,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontFamily: FONTS.sora[700],
                  fontSize: 18,
                  color: colors.text,
                }}
              >
                Confirmar emergência
              </Text>

              <Pressable
                onPress={onClose}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Fechar confirmação do SOS"
              >
                <Ionicons
                  name="close-circle-outline"
                  size={27}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <View
              style={{
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: colors.backgroundError,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={36}
                  color={colors.messageError}
                />
              </View>

              <Text
                style={{
                  fontFamily: FONTS.sora[700],
                  fontSize: 16,
                  color: colors.text,
                  textAlign: "center",
                  marginTop: 19,
                }}
              >
                Compartilhar sua localização?
              </Text>

              <Text
                style={{
                  fontFamily: FONTS.inter[400],
                  fontSize: 12,
                  lineHeight: 20,
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                Ao confirmar, o Storm Aid solicitará acesso à sua localização
                atual para encaminhar o pedido de emergência à central
                reguladora.
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                backgroundColor: colors.cardActive,
                borderRadius: 13,
                padding: 14,
                marginTop: 22,
              }}
            >
              <Ionicons name="location-outline" size={22} color={colors.link} />

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONTS.inter[700],
                    color: colors.text,
                    fontSize: 12,
                  }}
                >
                  Localização atual
                </Text>

                <Text
                  style={{
                    fontFamily: FONTS.inter[400],
                    color: colors.textSecondary,
                    fontSize: 11,
                    lineHeight: 17,
                    marginTop: 5,
                  }}
                >
                  O GPS será consultado somente depois da sua confirmação e da
                  permissão do dispositivo.
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                backgroundColor: colors.backgroundError,
                borderRadius: 13,
                padding: 13,
                marginTop: 14,
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.messageError}
              />

              <Text
                style={{
                  flex: 1,
                  fontFamily: FONTS.inter[500],
                  color: colors.text,
                  fontSize: 11,
                  lineHeight: 18,
                }}
              >
                A solicitação será enviada para análise do regulador. O envio
                não garante atendimento ou despacho imediato.
              </Text>
            </View>

            {error ? (
              <Text
                accessibilityRole="alert"
                style={{
                  fontFamily: FONTS.inter[500],
                  color: colors.messageError,
                  fontSize: 12,
                  lineHeight: 18,
                  marginTop: 14,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={onConfirm}
              disabled={!canConfirm}
              accessibilityRole="button"
              accessibilityState={{
                disabled: !canConfirm,
                busy: loading,
              }}
              style={{
                marginTop: 22,
                paddingVertical: 15,
                borderRadius: 12,
                backgroundColor: colors.messageError,
                opacity: canConfirm ? 1 : 0.5,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 9,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="warning-outline" size={19} color="#FFFFFF" />
              )}

              <Text
                style={{
                  fontFamily: FONTS.inter[700],
                  color: "#FFFFFF",
                  fontSize: 13,
                }}
              >
                {loading
                  ? "Enviando solicitação..."
                  : onConfirm
                    ? "Confirmar solicitação SOS"
                    : "Envio SOS indisponível"}
              </Text>
            </Pressable>

            {!onConfirm && (
              <Text
                style={{
                  fontFamily: FONTS.inter[400],
                  color: colors.textSecondary,
                  fontSize: 10,
                  lineHeight: 16,
                  textAlign: "center",
                  marginTop: 9,
                }}
              >
                A integração de envio ainda não está habilitada.
              </Text>
            )}

            <Pressable
              onPress={onClose}
              disabled={loading}
              accessibilityRole="button"
              style={{
                marginTop: 10,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                alignItems: "center",
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.inter[600],
                  color: colors.text,
                  fontSize: 13,
                }}
              >
                Cancelar
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
