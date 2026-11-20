import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import InputForm from "../InputForm";
import Logo from "../Logo";
import {
  requestPasswordRecovery,
  verifyPasswordRecovery,
  resetPasswordRecovery,
} from "../../services/passwordRecoveryService";

type Props = {
  onBackToLogin: () => void;
};

type RecoveryStep = "email" | "code" | "password" | "success";

export default function FormPasswordRecovery({ onBackToLogin }: Props) {
  const { colors } = useTheme();

  const [step, setStep] = useState<RecoveryStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const titles = {
    email: "Esqueceu sua senha?",
    code: "Verifique seu e-mail",
    password: "Crie uma nova senha",
    success: "Senha redefinida!",
  };

  const subtitles = {
    email:
      "Informe o e-mail associado à sua conta para receber um código de recuperação.",
    code: `Digite o código de 6 dígitos enviado para ${email}.`,
    password: "Escolha uma nova senha para acessar sua conta com segurança.",
    success:
      "Sua senha foi alterada com sucesso. Agora você pode entrar novamente.",
  };

  const currentStep = step === "email" ? 1 : step === "code" ? 2 : 3;

  function getErrorMessage(error: unknown): string {
    return error instanceof Error
      ? error.message
      : "Não foi possível concluir a operação.";
  }

  async function handleRequestCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      await requestPasswordRecovery(normalizedEmail);

      setEmail(normalizedEmail);
      setCode("");
      setTempToken("");
      setStep("code");

      setMessage(
        "Se existir uma conta com esse e-mail, você receberá um código de recuperação.",
      );
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!/^\d{6}$/.test(code)) {
      setError("Informe os 6 dígitos do código.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const token = await verifyPasswordRecovery(email, code);

      setTempToken(token);
      setStep("password");
      setCode("");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      await requestPasswordRecovery(email);

      setCode("");
      setMessage(
        "Se o e-mail estiver cadastrado, um novo código será enviado.",
      );
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    if (!tempToken) {
      setError("Solicite um novo código de recuperação.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await resetPasswordRecovery(tempToken, newPassword);

      setTempToken("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("success");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function handleRestart() {
    setStep("email");
    setCode("");
    setTempToken("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setMessage(null);
  }

  function renderButton(label: string, onPress: () => void) {
    return (
      <Pressable
        onPress={onPress}
        disabled={loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
        style={{
          backgroundColor: loading ? colors.buttonDisabled : colors.primary,
          borderRadius: 13,
          minHeight: 51,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 20,
        }}
      >
        {loading && <ActivityIndicator color={colors.onPrimary} />}
        <Text
          style={{
            color: loading ? colors.textSecondary : colors.onPrimary,
            fontFamily: FONTS.inter[700],
            fontSize: 15,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 36,
        paddingBottom: 35,
        gap: 30,
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Logo />
      </View>

      <View style={{ gap: 23 }}>
        <Pressable
          onPress={onBackToLogin}
          accessibilityRole="button"
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 7,
            paddingVertical: 7,
          }}
        >
          <Ionicons name="arrow-back" size={19} color={colors.primary} />
          <Text
            style={{
              color: colors.primary,
              fontFamily: FONTS.inter[600],
              fontSize: 13,
            }}
          >
            Voltar para o login
          </Text>
        </Pressable>

        <View style={{ gap: 13 }}>
          <View
            style={{
              width: 66,
              height: 66,
              borderRadius: 21,
              backgroundColor: colors.primary + "18",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={
                step === "success"
                  ? "checkmark-circle-outline"
                  : step === "password"
                    ? "lock-closed-outline"
                    : step === "code"
                      ? "shield-checkmark-outline"
                      : "mail-outline"
              }
              size={32}
              color={colors.primary}
            />
          </View>

          <Text
            accessibilityRole="header"
            style={{
              color: colors.text,
              fontFamily: FONTS.sora[700],
              fontSize: 23,
            }}
          >
            {titles[step]}
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: FONTS.inter[400],
              fontSize: 14,
              lineHeight: 22,
            }}
          >
            {subtitles[step]}
          </Text>
        </View>

        {step !== "success" && (
          <View
            style={{
              flexDirection: "row",
              gap: 8,
            }}
          >
            {[1, 2, 3].map((number) => (
              <View
                key={number}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 5,
                  backgroundColor:
                    number <= currentStep
                      ? colors.primary
                      : colors.inputBorder + "35",
                }}
              />
            ))}
          </View>
        )}
      </View>

      <View style={{ gap: 22 }}>
        {step === "email" && (
          <View style={{ gap: 24 }}>
            <InputForm
              label="E-mail"
              placeholder="exemplo@email.com"
              value={email}
              onChangeText={(value) => {
                setEmail(value.toLowerCase());
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
              error={!!error}
            />

            {renderButton("Enviar código", () => {
              void handleRequestCode();
            })}
          </View>
        )}

        {step === "code" && (
          <View style={{ gap: 24 }}>
            <InputForm
              label="Código de verificação"
              placeholder="Digite os 6 dígitos"
              value={code}
              onChangeText={(value) => {
                setCode(value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
              error={!!error}
            />

            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: FONTS.inter[400],
                fontSize: 12,
              }}
            >
              O código expira em 15 minutos.
            </Text>

            {renderButton("Verificar código", () => {
              void handleVerifyCode();
            })}

            <Pressable
              onPress={() => {
                void handleResendCode();
              }}
              disabled={loading}
              accessibilityRole="button"
              style={{ alignItems: "center", padding: 8 }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: FONTS.inter[600],
                  fontSize: 13,
                }}
              >
                Reenviar código
              </Text>
            </Pressable>
          </View>
        )}

        {step === "password" && (
          <View style={{ gap: 22 }}>
            <InputForm
              label="Nova senha"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                setError(null);
              }}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!loading}
              isIcon={
                <Ionicons
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.icon}
                />
              }
              onPress={() => setPasswordVisible(!passwordVisible)}
            />

            <InputForm
              label="Confirmar nova senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setError(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: FONTS.inter[400],
                fontSize: 12,
              }}
            >
              Utilize pelo menos 6 caracteres.
            </Text>

            {renderButton("Redefinir senha", () => {
              void handleResetPassword();
            })}

            <Pressable
              onPress={handleRestart}
              disabled={loading}
              accessibilityRole="button"
              style={{ alignItems: "center", padding: 8 }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: FONTS.inter[600],
                  fontSize: 13,
                }}
              >
                Solicitar outro código
              </Text>
            </Pressable>
          </View>
        )}

        {step === "success" && (
          <View style={{ gap: 17 }}>
            <View
              style={{
                backgroundColor: colors.primary + "14",
                padding: 18,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={25}
                color={colors.primary}
              />
              <Text
                style={{
                  flex: 1,
                  color: colors.text,
                  fontFamily: FONTS.inter[500],
                  fontSize: 13,
                  lineHeight: 20,
                }}
              >
                Sua senha foi atualizada. Utilize a nova senha para entrar.
              </Text>
            </View>

            {renderButton("Voltar ao login", onBackToLogin)}
          </View>
        )}

        {message && (
          <Text
            style={{
              color: colors.textSecondary,
              backgroundColor: colors.cardActive,
              borderRadius: 12,
              padding: 13,
              fontFamily: FONTS.inter[500],
              fontSize: 12,
              lineHeight: 19,
            }}
          >
            {message}
          </Text>
        )}

        {error && (
          <View
            style={{
              flexDirection: "row",
              gap: 9,
              backgroundColor: colors.backgroundError,
              borderRadius: 12,
              padding: 13,
              alignItems: "flex-start",
            }}
          >
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color={colors.messageError}
            />
            <Text
              accessibilityRole="alert"
              style={{
                flex: 1,
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 12,
                lineHeight: 19,
              }}
            >
              {error}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
