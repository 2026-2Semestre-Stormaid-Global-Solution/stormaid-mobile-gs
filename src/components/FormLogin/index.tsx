
import { Text, View } from "react-native";
import { useState } from "react";
import { FONTS } from "../../styles/style";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import InputForm from "../InputForm";
import TextLink from "../TextLink";
import Button from "../Button";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LoginErrorType } from "../../types/LoginErrorType";

export default function FormLogin() {
  const { colors } = useTheme();
  const { signIn, signInWithBiometrics } = useAuth();
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [loginError, setLoginError] = useState<LoginErrorType | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const passwordIsValid = password.length > 0;

  const emailHasError =
    (validationAttempted && !emailIsValid) ||
    loginError?.type === "credentials" ||
    loginError?.type === "email";

  const passwordHasError =
    (validationAttempted && !passwordIsValid) ||
    loginError?.type === "credentials";

  const emailErrorMessage =
    validationAttempted && !emailIsValid
      ? "Informe um e-mail válido."
      : loginError?.type === "email"
        ? loginError.message
        : null;

  const passwordErrorMessage =
    validationAttempted && !passwordIsValid
      ? "Informe sua senha."
      : loginError?.type === "email"
        ? null
        : (loginError?.message ?? null);

  const buttonDisabled =
    loading ||
    (validationAttempted && (!emailIsValid || !passwordIsValid)) ||
    loginError !== null;

  function handleEmailChange(value: string) {
    setEmail(value.toLowerCase());

    if (loginError) {
      setLoginError(null);
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);

    if (loginError) {
      setLoginError(null);
    }
  }

  async function handleBiometricLogin() {
    if (loading) {
      return;
    }

    try {
      setBiometricError(null);
      setLoading(true);

      await signInWithBiometrics();
    } catch (error) {
      setBiometricError(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar a autenticação biométrica."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (buttonDisabled) {
      return;
    }

    setValidationAttempted(true);
    setLoginError(null);

    if (!emailIsValid || !passwordIsValid) {
      return;
    }

    try {
      setLoading(true);
      setBiometricError(null);

      await signIn(normalizedEmail, password);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login.";

      const credentialsInvalid =
        message === "E-mail ou senha inválidos.";

      const emailInvalid =
        message === "E-mail institucional de socorrista inválido." ||
        message === "E-mail institucional de regulador inválido." ||
        message === "Este e-mail é reservado para contas institucionais.";

      setLoginError({
        message,
        type: credentialsInvalid
          ? "credentials"
          : emailInvalid
            ? "email"
            : "general",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        marginTop: 26,
        marginBottom: 40,
        gap: 40,
      }}
    >
      <View>
        <Text
          style={{
            fontFamily: FONTS.inter[500],
            color: colors.textSecondary,
            fontSize: 17,
          }}
        >
          Entre para pedir ajuda ou acompanhar um chamado.
        </Text>
      </View>

      <View>
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
              label="E-mail"
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={handleEmailChange}
              error={emailHasError}
              editable={!loading}
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
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={handlePasswordChange}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!passwordVisible}
              autoComplete="current-password"
              textContentType="password"
              error={passwordHasError}
              editable={!loading}
              isIcon={
                <FontAwesome5
                  name={passwordVisible ? "eye-slash" : "eye"}
                  size={22}
                  color={
                    passwordHasError
                      ? colors.inputBorderError
                      : colors.icon
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
        </View>

        <TextLink
          route="SendCodeToEmail"
          text="Esqueci minha senha"
          textAlign="end"
        />
      </View>

      <View
        style={{
          alignItems: "center",
          gap: 30,
        }}
      >
        <View
          style={{
            alignItems: "center",
            gap: 10,
          }}
        >
          <Button
            onPress={handleLogin}
            disabled={buttonDisabled}
            text={loading ? "Entrando..." : "Entrar"}
            backgroundColor={
              buttonDisabled
                ? colors.buttonDisabled
                : colors.primary
            }
            colorText={
              buttonDisabled
                ? colors.textSecondary
                : colors.textButton
            }
          />
        </View>

        <View
          style={{
            alignItems: "center",
            gap: 10,
          }}
        >
          <Button
            onPress={handleBiometricLogin}
            disabled={loading}
            text="Entrar com biometria"
            colorText={colors.primary}
            borderWidth={1.5}
            borderColor={colors.primary}
            backgroundColor="transparent"
            fontSize={20}
            iconLeft={
              <Ionicons
                name="finger-print-outline"
                size={24}
                color={colors.primary}
              />
            }
          />

          {biometricError && (
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
              {biometricError}
            </Text>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 15,
              fontFamily: FONTS.inter[400],
            }}
          >
            Ainda não tem conta?
          </Text>

          <TextLink text=" Criar conta" route="CreateAccount" />
        </View>
      </View>
    </View>
  );
}
