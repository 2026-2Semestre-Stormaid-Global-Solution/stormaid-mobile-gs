import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import {
  RELATIONSHIP_OPTIONS,
  type RelationshipType,
} from "../../data/relationshipOptionsData";
import type {
  EmergencyContactFormType,
  EmergencyContactType,
} from "../../types/EmergencyContactType";

type ModalEmergencyContactProps = {
  visible: boolean;
  contact: EmergencyContactType | null;
  saving: boolean;
  onClose: () => void;
  onSave: (contact: EmergencyContactFormType) => Promise<void>;
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ModalEmergencyContact({
  visible,
  contact,
  saving,
  onClose,
  onSave,
}: ModalEmergencyContactProps) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relationship, setRelationship] = useState<RelationshipType | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    setName(contact?.name ?? "");
    setPhoneNumber(formatPhone(contact?.phoneNumber ?? ""));
    setRelationship(
      RELATIONSHIP_OPTIONS.find((item) => item.value === contact?.relationship)?.value ?? null,
    );
    setPickerVisible(false);
    setAttempted(false);
    setSubmitError(null);
  }, [visible, contact?.name, contact?.phoneNumber, contact?.relationship]);

  const nameInvalid = name.trim().length < 3 || name.trim().length > 120;
  const phoneInvalid = phoneNumber.replace(/\D/g, "").length !== 11;
  const relationshipInvalid = !relationship;
  const selectedRelationship = RELATIONSHIP_OPTIONS.find((item) => item.value === relationship);

  async function handleSave() {
    if (saving) return;
    setAttempted(true);
    setSubmitError(null);

    if (nameInvalid || phoneInvalid || relationshipInvalid || !relationship) return;

    try {
      await onSave({ name: name.trim(), phoneNumber, relationship });
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : "Não foi possível salvar o contato.");
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => { if (!saving) onClose(); }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: "#000000B3",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 18,
          paddingVertical: 28,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            width: "100%",
            maxWidth: 430,
            maxHeight: "94%",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.inputBorder + "30",
              gap: 15,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.text, fontFamily: FONTS.sora[700], fontSize: 18 }}>
                {contact ? "Editar contato" : "Novo contato"}
              </Text>
              <Text style={{ color: colors.textSecondary, fontFamily: FONTS.inter[400], fontSize: 12 }}>
                Preencha os dados da pessoa de confiança.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Fechar formulário"
              hitSlop={8}
              style={{ backgroundColor: colors.primary + "1B", width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="close" size={20} color={colors.primary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 17 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View style={{ gap: 7 }}>
              <Text style={{ color: colors.label, fontFamily: FONTS.inter[600], fontSize: 13 }}>
                Nome completo
              </Text>
              <TextInput
                value={name}
                onChangeText={(value) => { setName(value); setSubmitError(null); }}
                placeholder="Ex.: Maria Silva"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={120}
                editable={!saving}
                accessibilityLabel="Nome do contato"
                style={{
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: attempted && nameInvalid ? colors.inputBorderError : colors.inputBorder,
                  minHeight: 49,
                  paddingHorizontal: 14,
                  fontFamily: FONTS.inter[400],
                  fontSize: 14,
                }}
              />
              {attempted && nameInvalid ? (
                <Text accessibilityRole="alert" style={{ color: colors.messageError, fontFamily: FONTS.inter[500], fontSize: 11 }}>
                  Informe um nome de 3 a 120 caracteres.
                </Text>
              ) : null}
            </View>

            <View style={{ gap: 7 }}>
              <Text style={{ color: colors.label, fontFamily: FONTS.inter[600], fontSize: 13 }}>
                Telefone com DDD
              </Text>
              <TextInput
                value={phoneNumber}
                onChangeText={(value) => { setPhoneNumber(formatPhone(value)); setSubmitError(null); }}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={15}
                editable={!saving}
                accessibilityLabel="Telefone do contato"
                style={{
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: attempted && phoneInvalid ? colors.inputBorderError : colors.inputBorder,
                  minHeight: 49,
                  paddingHorizontal: 14,
                  fontFamily: FONTS.inter[400],
                  fontSize: 14,
                }}
              />
              {attempted && phoneInvalid ? (
                <Text accessibilityRole="alert" style={{ color: colors.messageError, fontFamily: FONTS.inter[500], fontSize: 11 }}>
                  Informe 11 dígitos, incluindo o DDD.
                </Text>
              ) : null}
            </View>

            <View style={{ gap: 7 }}>
              <Text style={{ color: colors.label, fontFamily: FONTS.inter[600], fontSize: 13 }}>
                Grau de parentesco
              </Text>
              <Pressable
                onPress={() => setPickerVisible((current) => !current)}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Selecionar grau de parentesco"
                accessibilityState={{ expanded: pickerVisible }}
                style={{
                  borderWidth: 1,
                  borderColor: attempted && relationshipInvalid ? colors.inputBorderError : colors.inputBorder,
                  borderRadius: 12,
                  backgroundColor: colors.inputBackground,
                  minHeight: 49,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Text style={{ flex: 1, fontFamily: FONTS.inter[500], fontSize: 14, color: selectedRelationship ? colors.text : colors.placeholder }}>
                  {selectedRelationship?.label ?? "Selecione o parentesco"}
                </Text>
                <Ionicons name={pickerVisible ? "chevron-up" : "chevron-down"} color={colors.icon} size={20} />
              </Pressable>

              {pickerVisible ? (
                <ScrollView
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 195, borderWidth: 1, borderColor: colors.inputBorder + "60", borderRadius: 12, backgroundColor: colors.surface }}
                >
                  {RELATIONSHIP_OPTIONS.map((item) => {
                    const selected = relationship === item.value;
                    return (
                      <Pressable
                        key={item.value}
                        onPress={() => { setRelationship(item.value); setPickerVisible(false); setSubmitError(null); }}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        style={{ paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: selected ? colors.cardActive : colors.surface }}
                      >
                        <Text style={{ color: colors.text, fontFamily: FONTS.inter[500], fontSize: 13 }}>{item.label}</Text>
                        {selected ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : null}
              {attempted && relationshipInvalid ? (
                <Text accessibilityRole="alert" style={{ color: colors.messageError, fontFamily: FONTS.inter[500], fontSize: 11 }}>
                  Selecione o grau de parentesco.
                </Text>
              ) : null}
            </View>

            {submitError ? (
              <Text accessibilityRole="alert" style={{ color: colors.messageError, fontFamily: FONTS.inter[500], fontSize: 12, lineHeight: 19 }}>
                {submitError}
              </Text>
            ) : null}

            <Pressable
              onPress={() => { void handleSave(); }}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Salvar contato"
              style={{ backgroundColor: saving ? colors.buttonDisabled : colors.primary, borderRadius: 13, minHeight: 49, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 4 }}
            >
              {saving ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Ionicons name="checkmark-circle-outline" color={colors.onPrimary} size={19} />}
              <Text style={{ color: saving ? colors.textSecondary : colors.onPrimary, fontFamily: FONTS.inter[700], fontSize: 14 }}>
                {saving ? "Salvando..." : "Salvar contato"}
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              disabled={saving}
              accessibilityRole="button"
              style={{ alignItems: "center", padding: 10 }}
            >
              <Text style={{ color: colors.textSecondary, fontFamily: FONTS.inter[600], fontSize: 13 }}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
