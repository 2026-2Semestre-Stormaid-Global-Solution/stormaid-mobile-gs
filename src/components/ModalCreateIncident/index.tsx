import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

export type EmergencyCategory =
  | "POLICE_DANGER"
  | "MEDICAL_EMERGENCY"
  | "FIRE_RESCUE"
  | "CLIMATE_DISASTER"
  | "UNKNOWN_EMERGENCY";

export type IncidentFormData = {
  emergencyCategory: EmergencyCategory;
  textDescription: string;
};

type ModalCreateIncidentProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: IncidentFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
};

const emergencyCategories: {
  label: string;
  value: EmergencyCategory;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    label: "Risco policial",
    value: "POLICE_DANGER",
    icon: "shield-outline",
  },
  {
    label: "Emergência médica",
    value: "MEDICAL_EMERGENCY",
    icon: "medkit-outline",
  },
  {
    label: "Incêndio ou resgate",
    value: "FIRE_RESCUE",
    icon: "flame-outline",
  },
  {
    label: "Desastre climático",
    value: "CLIMATE_DISASTER",
    icon: "rainy-outline",
  },
  {
    label: "Outra emergência",
    value: "UNKNOWN_EMERGENCY",
    icon: "alert-circle-outline",
  },
];

export default function ModalCreateIncident({
  visible,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}: ModalCreateIncidentProps) {
  const { colors } = useTheme();

  const [category, setCategory] = useState<EmergencyCategory | null>(null);

  const [description, setDescription] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categoryError = attempted && !category;
  const descriptionError = attempted && !description.trim();

  function handleClose() {
    if (loading) return;

    setCategory(null);
    setDescription("");
    setAttempted(false);
    setSubmitError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!onSubmit || loading) return;

    setAttempted(true);
    setSubmitError(null);

    if (!category || !description.trim()) {
      return;
    }

    try {
      await onSubmit({
        emergencyCategory: category,
        textDescription: description.trim(),
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar o chamado.",
      );
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000AA",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 420,
            maxHeight: "88%",
            backgroundColor: colors.surface,
            borderRadius: 22,
            padding: 21,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontFamily: FONTS.sora[700],
                  color: colors.text,
                  fontSize: 19,
                }}
              >
                Novo chamado
              </Text>

              <Pressable
                onPress={handleClose}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Fechar formulário"
              >
                <Ionicons
                  name="close-circle-outline"
                  size={27}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <Text
              style={{
                fontFamily: FONTS.inter[400],
                color: colors.textSecondary,
                fontSize: 12,
                lineHeight: 19,
                marginBottom: 24,
              }}
            >
              Informe o tipo de emergência e descreva a situação para a central
              reguladora.
            </Text>

            <Text
              style={{
                fontFamily: FONTS.inter[600],
                color: colors.text,
                fontSize: 13,
                marginBottom: 11,
              }}
            >
              Tipo de emergência
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 9,
              }}
            >
              {emergencyCategories.map((item) => {
                const selected = category === item.value;

                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      setCategory(item.value);
                      setSubmitError(null);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                      paddingVertical: 11,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: selected
                        ? colors.primary
                        : colors.inputBorder,
                      backgroundColor: selected
                        ? colors.cardActive
                        : colors.inputBackground,
                    }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={17}
                      color={selected ? colors.primary : colors.textSecondary}
                    />

                    <Text
                      style={{
                        fontFamily: FONTS.inter[500],
                        color: colors.text,
                        fontSize: 11,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {categoryError && (
              <Text
                style={{
                  color: colors.messageError,
                  fontFamily: FONTS.inter[400],
                  fontSize: 11,
                  marginTop: 7,
                }}
              >
                Selecione o tipo de emergência.
              </Text>
            )}

            <Text
              style={{
                fontFamily: FONTS.inter[600],
                color: colors.text,
                fontSize: 13,
                marginTop: 24,
                marginBottom: 10,
              }}
            >
              Descrição do chamado
            </Text>

            <TextInput
              multiline
              maxLength={1000}
              value={description}
              onChangeText={(value) => {
                setDescription(value);
                setSubmitError(null);
              }}
              editable={!loading}
              placeholder="Descreva o que está acontecendo..."
              placeholderTextColor={colors.placeholder}
              textAlignVertical="top"
              accessibilityLabel="Descrição da emergência"
              style={{
                minHeight: 120,
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: descriptionError
                  ? colors.inputBorderError
                  : colors.inputBorder,
                backgroundColor: colors.inputBackground,
                color: colors.text,
                fontFamily: FONTS.inter[400],
                fontSize: 13,
              }}
            />

            <Text
              style={{
                fontFamily: FONTS.inter[400],
                color: descriptionError
                  ? colors.messageError
                  : colors.textSecondary,
                fontSize: 11,
                marginTop: 7,
              }}
            >
              {descriptionError
                ? "Informe a descrição da emergência."
                : `${description.length}/1000 caracteres`}
            </Text>

            <View
              style={{
                marginTop: 22,
                padding: 13,
                borderRadius: 12,
                backgroundColor: colors.cardActive,
                flexDirection: "row",
                gap: 10,
              }}
            >
              <Ionicons name="location-outline" size={21} color={colors.link} />

              <Text
                style={{
                  flex: 1,
                  fontFamily: FONTS.inter[400],
                  color: colors.text,
                  fontSize: 11,
                  lineHeight: 18,
                }}
              >
                A localização será solicitada com sua permissão antes do envio
                do chamado.
              </Text>
            </View>

            {(error || submitError) && (
              <Text
                accessibilityRole="alert"
                style={{
                  fontFamily: FONTS.inter[500],
                  color: colors.messageError,
                  fontSize: 12,
                  marginTop: 13,
                  textAlign: "center",
                }}
              >
                {error || submitError}
              </Text>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={!onSubmit || loading}
              accessibilityRole="button"
              accessibilityState={{
                disabled: !onSubmit || loading,
                busy: loading,
              }}
              style={{
                backgroundColor: onSubmit
                  ? colors.primary
                  : colors.buttonDisabled,
                borderRadius: 12,
                paddingVertical: 15,
                marginTop: 23,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              {loading && (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              )}

              <Text
                style={{
                  fontFamily: FONTS.inter[700],
                  color: onSubmit ? colors.onPrimary : colors.textSecondary,
                  fontSize: 13,
                }}
              >
                {loading
                  ? "Enviando chamado..."
                  : onSubmit
                    ? "Enviar chamado"
                    : "Envio indisponível"}
              </Text>
            </Pressable>

            {!onSubmit && (
              <Text
                style={{
                  fontFamily: FONTS.inter[400],
                  color: colors.textSecondary,
                  fontSize: 10,
                  lineHeight: 16,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                A integração com a API de chamados ainda não está habilitada.
              </Text>
            )}

            <Pressable
              onPress={handleClose}
              disabled={loading}
              accessibilityRole="button"
              style={{
                borderWidth: 1,
                borderColor: colors.inputBorder,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginTop: 12,
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
