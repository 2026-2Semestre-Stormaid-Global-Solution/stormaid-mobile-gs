import { Pressable, ScrollView, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import SubTitle from "../SubTitle";
import Title from "../Title";
import { FONTS } from "../../styles/style";
import { useTheme } from "../../context/ThemeContext";
import InputForm from "../InputForm";
import Button from "../Button";
import {
  RELATIONSHIP_OPTIONS,
  type RelationshipType,
} from "../../data/relationshipOptionsData";
import { FormParentsType } from "../../types/ParentsDataType";
import {
  getParentsData,
  saveParentsData,
} from "../../services/registerService";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateName(value: string): string | null {
  const name = value.trim();

  if (!name) {
    return "Informe o nome do contato.";
  }

  if (name.length < 3 || name.length > 150) {
    return "O nome deve conter entre 3 e 150 caracteres.";
  }

  return null;
}

function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "Informe o telefone do contato.";
  }

  if (digits.length !== 11) {
    return "Informe um telefone com DDD e 11 dígitos.";
  }

  return null;
}

export default function FormParents({ onContinue }: FormParentsType) {
  const { colors } = useTheme();
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relationship, setRelationship] = useState<RelationshipType | null>(
    null,
  );
  const [noEmergencyContact, setNoEmergencyContact] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function restoreParents() {
      try {
        const storedData = await getParentsData();

        if (mounted && storedData) {
          setNoEmergencyContact(storedData.noEmergencyContact);

          if (storedData.emergencyContact) {
            setContactName(storedData.emergencyContact.name);
            setPhoneNumber(
              formatPhone(storedData.emergencyContact.phoneNumber),
            );
            setRelationship(storedData.emergencyContact.relationship);
          }
        }
      } catch {
        if (mounted) {
          setSaveError("Não foi possível recuperar os dados do contato.");
        }
      } finally {
        if (mounted) {
          setRestoring(false);
        }
      }
    }

    restoreParents();

    return () => {
      mounted = false;
    };
  }, []);

  const nameErrorMessage =
    validationAttempted && !noEmergencyContact
      ? validateName(contactName)
      : null;

  const phoneErrorMessage =
    validationAttempted && !noEmergencyContact
      ? validatePhone(phoneNumber)
      : null;

  const relationshipErrorMessage =
    validationAttempted && !noEmergencyContact && !relationship
      ? "Selecione o parentesco do contato."
      : null;

  const hasErrors =
    !!nameErrorMessage || !!phoneErrorMessage || !!relationshipErrorMessage;

  const buttonDisabled =
    restoring || saving || (validationAttempted && hasErrors);

  function handleNoEmergencyContact() {
    const nextValue = !noEmergencyContact;

    setNoEmergencyContact(nextValue);
    setSaveError(null);
    setPickerVisible(false);

    if (nextValue) {
      setContactName("");
      setPhoneNumber("");
      setRelationship(null);
    }
  }

  function handleRelationshipChange(value: RelationshipType) {
    setRelationship(value);
    setPickerVisible(false);
    setSaveError(null);
  }

  async function handleContinue() {
    if (buttonDisabled) {
      return;
    }

    setValidationAttempted(true);
    setSaveError(null);

    const nameError = noEmergencyContact ? null : validateName(contactName);

    const phoneError = noEmergencyContact ? null : validatePhone(phoneNumber);

    const relationshipError = !noEmergencyContact && !relationship;

    if (nameError || phoneError || relationshipError) {
      return;
    }

    try {
      setSaving(true);

      if (noEmergencyContact) {
        await saveParentsData({
          noEmergencyContact: true,
          emergencyContact: null,
        });
      } else {
        await saveParentsData({
          noEmergencyContact: false,
          emergencyContact: {
            name: contactName.trim(),
            phoneNumber,
            relationship: relationship!,
          },
        });
      }

      onContinue?.();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os dados do contato.",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedRelationship = RELATIONSHIP_OPTIONS.find(
    (option) => option.value === relationship,
  );

  return (
    <View>
      <SubTitle text="Passo 4 de 4" />

      <Title text="Quem devemos avisar?" fontSize={26} />

      <View
        style={{
          width: "90%",
          marginBottom: 20,
        }}
      >
        <SubTitle
          text="Suas informações de saúde só aparecem para a equipe autorizada durante um chamado."
          fontFamily={FONTS.inter[500]}
          fontSize={16}
          marginTop={10}
        />
      </View>

      <View
        style={{
          gap: 30,
        }}
      >
        <View
          style={{
            gap: 5,
          }}
        >
          <InputForm
            label="Nome do contato"
            placeholder="Ex.: Maria Silva"
            fontSizeLabel={17}
            value={contactName}
            onChangeText={(value) => {
              setContactName(value);
              setSaveError(null);
            }}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={150}
            editable={!restoring && !saving && !noEmergencyContact}
            error={!!nameErrorMessage}
          />

          {nameErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {nameErrorMessage}
            </Text>
          )}
        </View>

        <View
          style={{
            gap: 5,
          }}
        >
          <InputForm
            label="Telefone do contato"
            placeholder="(00) 00000-0000"
            fontSizeLabel={17}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={15}
            value={phoneNumber}
            onChangeText={(value) => {
              setPhoneNumber(formatPhone(value));
              setSaveError(null);
            }}
            editable={!restoring && !saving && !noEmergencyContact}
            error={!!phoneErrorMessage}
          />

          {phoneErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {phoneErrorMessage}
            </Text>
          )}
        </View>

        <View
          style={{
            gap: 5,
          }}
        >
          <Text
            style={{
              color: colors.label,
              fontFamily: FONTS.inter[600],
              fontSize: 17,
            }}
          >
            Parentesco
          </Text>

          <Pressable
            onPress={() => setPickerVisible(!pickerVisible)}
            disabled={restoring || saving || noEmergencyContact}
            accessibilityRole="button"
            accessibilityLabel="Selecionar parentesco"
            accessibilityState={{
              expanded: pickerVisible,
              disabled: restoring || saving || noEmergencyContact,
            }}
            style={{
              borderWidth: 1.5,
              borderColor: relationshipErrorMessage
                ? colors.inputBorderError
                : colors.inputBorder,
              borderRadius: 12,
              backgroundColor: colors.inputBackground,
              padding: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              minHeight: 54,
              opacity: noEmergencyContact ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                color: selectedRelationship
                  ? colors.text
                  : relationshipErrorMessage
                    ? colors.inputBorderError
                    : colors.placeholder,
                fontFamily: FONTS.inter[500],
                fontSize: 16,
              }}
            >
              {selectedRelationship?.label ?? "Selecione o parentesco"}
            </Text>

            <Ionicons
              name={pickerVisible ? "chevron-up" : "chevron-down"}
              size={20}
              color={
                relationshipErrorMessage ? colors.inputBorderError : colors.icon
              }
            />
          </Pressable>

          {relationshipErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {relationshipErrorMessage}
            </Text>
          )}

          {pickerVisible && !noEmergencyContact && (
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={{
                maxHeight: 220,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                borderRadius: 12,
                marginTop: 5,
              }}
            >
              {RELATIONSHIP_OPTIONS.map((option) => {
                const selected = relationship === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleRelationshipChange(option.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 15,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: selected
                        ? colors.cardActive
                        : colors.surface,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: FONTS.inter[500],
                        fontSize: 15,
                      }}
                    >
                      {option.label}
                    </Text>

                    {selected && (
                      <Feather name="check" size={18} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>

      <Pressable
        onPress={handleNoEmergencyContact}
        disabled={restoring || saving}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: noEmergencyContact,
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 25,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: noEmergencyContact
              ? colors.primary
              : colors.inputBorder,
            backgroundColor: noEmergencyContact
              ? colors.primary
              : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {noEmergencyContact && (
            <Feather name="check" size={15} color={colors.onPrimary} />
          )}
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            fontFamily: FONTS.inter[400],
            flexShrink: 1,
          }}
        >
          Não desejo informar contato de emergência
        </Text>
      </Pressable>

      <View
        style={{
          alignItems: "center",
          marginTop: 30,
          gap: 10,
        }}
      >
        <Button
          onPress={handleContinue}
          disabled={buttonDisabled}
          text={saving ? "Salvando..." : "Continuar"}
          backgroundColor={
            buttonDisabled ? colors.buttonDisabled : colors.primary
          }
          colorText={buttonDisabled ? colors.textSecondary : colors.textButton}
        />

        {saveError && (
          <Text
            accessibilityRole="alert"
            style={{
              color: colors.messageError,
              fontFamily: FONTS.inter[500],
              fontSize: 13,
              textAlign: "center",
              maxWidth: 300,
            }}
          >
            {saveError}
          </Text>
        )}
      </View>
    </View>
  );
}
