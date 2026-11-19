import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import { FontAwesome5 } from "@expo/vector-icons";
import Title from "../Title";
import InputForm from "../InputForm";
import Button from "../Button";
import SubTitle from "../SubTitle";
import { FormAccountDataType } from "../../types/FormAccountDataType";
import { getAccountData, saveAccountData } from "../../services/registerService";
import {
  formatCpf,
  formatBirthDate,
  isValidCpf,
  toIsoBirthDate,
} from "../../utils/citizenValidation";

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

function validateFullName(value: string): string | null {
  const name = value.trim();

  if (!name) {
    return "Informe seu nome completo.";
  }

  if (name.length < 3 || name.length > 150) {
    return "O nome deve conter entre 3 e 150 caracteres.";
  }

  return null;
}

function validateEmail(value: string): string | null {
  const email = value.trim().toLowerCase();

  if (!email) {
    return "Informe seu e-mail.";
  }

  if (email.length > 150) {
    return "O e-mail deve conter no máximo 150 caracteres.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Informe um e-mail válido.";
  }

  return null;
}

function toDisplayBirthDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : formatBirthDate(value);
}

function validateCpf(value: string): string | null {
  if (!value.trim()) {
    return "Informe seu CPF.";
  }

  if (!isValidCpf(value)) {
    return "Informe um CPF válido.";
  }

  return null;
}

function validateBirthDate(value: string): string | null {
  if (!value.trim()) {
    return "Informe sua data de nascimento.";
  }

  if (!toIsoBirthDate(value)) {
    return "Informe uma data de nascimento válida.";
  }

  return null;
}

function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "Informe seu telefone.";
  }

  if (digits.length !== 11) {
    return "Informe um telefone com DDD e 11 dígitos.";
  }

  return null;
}

function validatePassword(value: string): string | null {
  if (!value.trim()) {
    return "Informe sua senha.";
  }

  if (value.length < 6 || value.length > 255) {
    return "A senha deve conter entre 6 e 255 caracteres.";
  }

  return null;
}

function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) {
    return "Confirme sua senha.";
  }

  if (password !== confirmPassword) {
    return "As senhas não coincidem.";
  }

  return null;
}

export default function FormAccountData({ onContinue }: FormAccountDataType) {
  const { colors } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function restoreAccountData() {
      try {
        const storedData = await getAccountData();

        if (isMounted && storedData) {
          setFullName(storedData.fullName);
          setEmail(storedData.email);
          setCpf(formatCpf(storedData.cpf ?? ""));
          setBirthDate(toDisplayBirthDate(storedData.birthDate ?? ""));
          setPhoneNumber(storedData.phoneNumber);
          setPassword(storedData.password);
        }
      } catch {
        if (isMounted) {
          setSaveError("Não foi possível recuperar os dados salvos.");
        }
      } finally {
        if (isMounted) {
          setRestoring(false);
        }
      }
    }

    restoreAccountData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fullNameErrorMessage = validationAttempted ? validateFullName(fullName) : null;
  const emailErrorMessage = validationAttempted ? validateEmail(email) : null;
  const cpfErrorMessage = validationAttempted ? validateCpf(cpf) : null;
  const birthDateErrorMessage = validationAttempted ? validateBirthDate(birthDate) : null;
  const phoneErrorMessage = validationAttempted ? validatePhone(phoneNumber) : null;
  const passwordErrorMessage = validationAttempted ? validatePassword(password) : null;
  const confirmPasswordErrorMessage = validationAttempted ? validateConfirmPassword(password, confirmPassword) : null;

  const hasErrors =
    !!fullNameErrorMessage ||
    !!emailErrorMessage ||
    !!cpfErrorMessage ||
    !!birthDateErrorMessage ||
    !!phoneErrorMessage ||
    !!passwordErrorMessage ||
    !!confirmPasswordErrorMessage;

  const buttonDisabled =
    restoring || saving || (validationAttempted && hasErrors);

  async function handleContinue() {
    if (buttonDisabled) {
      return;
    }

    setValidationAttempted(true);
    setSaveError(null);

    const invalid =
      validateFullName(fullName) ||
      validateEmail(email) ||
      validateCpf(cpf) ||
      validateBirthDate(birthDate) ||
      validatePhone(phoneNumber) ||
      validatePassword(password) ||
      validateConfirmPassword(password, confirmPassword);

    if (invalid) {
      return;
    }

    const isoBirthDate = toIsoBirthDate(birthDate);

    if (!isoBirthDate) {
      return;
    }

    try {
      setSaving(true);

      await saveAccountData({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpf.replace(/\D/g, ""),
        birthDate: isoBirthDate,
        phoneNumber,
        password,
      });

      onContinue?.();
    } catch {
      setSaveError("Não foi possível salvar os dados do cadastro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <SubTitle text="Passo 1 de 4" />

      <Title text="Seus dados" marginBottom={20} />

      <View
        style={{
          gap: 20,
        }}
      >
        <View
          style={{
            gap: 5,
          }}
        >
          <InputForm
            label="Nome completo"
            placeholder="Digite seu nome completo"
            fontSizeLabel={17}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            textContentType="name"
            error={!!fullNameErrorMessage}
            editable={!restoring && !saving}
          />

          {fullNameErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {fullNameErrorMessage}
            </Text>
          )}
        </View>

        <View
          style={{
            gap: 5,
          }}
        >
          <InputForm
            label="E-mail"
            placeholder="seu.email@exemplo.com"
            fontSizeLabel={17}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={(value) => setEmail(value.toLowerCase())}
            error={!!emailErrorMessage}
            editable={!restoring && !saving}
          />

          {emailErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {emailErrorMessage}
            </Text>
          )}
        </View>

        <View
          style={{
            gap: 5,
          }}
        >
          <InputForm
            label="CPF"
            placeholder="000.000.000-00"
            fontSizeLabel={17}
            keyboardType="number-pad"
            maxLength={14}
            value={cpf}
            onChangeText={(value) => setCpf(formatCpf(value))}
            error={!!cpfErrorMessage}
            editable={!restoring && !saving}
          />

          {cpfErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {cpfErrorMessage}
            </Text>
          )}
        </View>

        <View
          style={{
            gap: 5,
          }}
        >
          <InputForm
            label="Data de nascimento"
            placeholder="DD/MM/AAAA"
            fontSizeLabel={17}
            keyboardType="number-pad"
            maxLength={10}
            value={birthDate}
            onChangeText={(value) => setBirthDate(formatBirthDate(value))}
            error={!!birthDateErrorMessage}
            editable={!restoring && !saving}
          />

          {birthDateErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {birthDateErrorMessage}
            </Text>
          )}
        </View>

        <View
          style={{
            gap: 5,
          }}
        >
          <InputForm
            label="Telefone"
            placeholder="(00) 00000-0000"
            fontSizeLabel={17}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={15}
            value={phoneNumber}
            onChangeText={(value) => {
              setPhoneNumber(formatPhone(value));
            }}
            error={!!phoneErrorMessage}
            editable={!restoring && !saving}
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
          <InputForm
            label="Senha"
            placeholder="Mínimo de 6 caracteres"
            fontSizeLabel={17}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            secureTextEntry={!passwordVisible}
            error={!!passwordErrorMessage}
            editable={!restoring && !saving}
            isIcon={
              <FontAwesome5
                name={passwordVisible ? "eye-slash" : "eye"}
                size={22}
                color={
                  passwordErrorMessage ? colors.inputBorderError : colors.icon
                }
              />
            }
            onPress={() => setPasswordVisible(!passwordVisible)}
          />

          {passwordErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {passwordErrorMessage}
            </Text>
          )}
        </View>

        <View
          style={{
            gap: 5,
          }}
        >
          <InputForm
            label="Confirmar senha"
            placeholder="Digite a senha novamente"
            fontSizeLabel={17}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            secureTextEntry={!confirmPasswordVisible}
            error={!!confirmPasswordErrorMessage}
            editable={!restoring && !saving}
            isIcon={
              <FontAwesome5
                name={confirmPasswordVisible ? "eye-slash" : "eye"}
                size={22}
                color={
                  confirmPasswordErrorMessage
                    ? colors.inputBorderError
                    : colors.icon
                }
              />
            }
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          />

          {confirmPasswordErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {confirmPasswordErrorMessage}
            </Text>
          )}
        </View>

        <View
          style={{
            marginTop: 30,
            alignItems: "center",
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
            colorText={
              buttonDisabled ? colors.textSecondary : colors.textButton
            }
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
    </View>
  );
}