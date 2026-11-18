import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

import {
  loginWithEmail,
  getAuthenticatedUser,
  type AuthUser,
} from "../services/authService";

import { AppRoleType } from "../types/AppRoleType";

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  role: AppRoleType | null;
  hasToken: boolean;
  isLoading: boolean;
  saveToken: (token: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithBiometrics: () => Promise<void>;
  enableBiometrics: () => Promise<void>;
  lockSession: () => void;
  signOut: () => Promise<void>;
};

const BIOMETRIC_KEY = "stormaid_biometric_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthorizedRole(user: AuthUser): AppRoleType {
  if (user.status !== "ACTIVE") {
    throw new Error("Esta conta não está ativa.");
  }

  if (!Array.isArray(user.roles) || user.roles.length !== 1) {
    throw new Error("Perfil de acesso não autorizado.");
  }

  const role = user.roles[0];

  if (role !== "CITIZEN" && role !== "REGULATOR" && role !== "RESPONDER") {
    throw new Error("Perfil de acesso não disponível no aplicativo.");
  }

  return role;
}

async function validateAccess(accessToken: string): Promise<{
  user: AuthUser;
  role: AppRoleType;
}> {
  const authenticatedUser = await getAuthenticatedUser(accessToken);

  const authorizedRole = getAuthorizedRole(authenticatedUser);

  return {
    user: authenticatedUser,
    role: authorizedRole,
  };
}

async function checkBiometrics() {
  const available = await LocalAuthentication.hasHardwareAsync();

  if (!available) {
    throw new Error(
      "Este dispositivo não possui sensor biométrico disponível.",
    );
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();

  if (!enrolled) {
    throw new Error("Nenhuma impressão digital cadastrada no dispositivo.");
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRoleType | null>(null);

  async function saveToken(accessToken: string) {
    if (!accessToken.trim()) {
      throw new Error("Token de autenticação inválido.");
    }

    const session = await validateAccess(accessToken);

    setToken(accessToken);
    setUser(session.user);
    setRole(session.role);
  }

  async function signIn(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const response = await loginWithEmail(normalizedEmail, password);

    if (!response.accessToken) {
      throw new Error("A API não retornou um token de autenticação.");
    }

    await saveToken(response.accessToken);
  }

  async function enableBiometrics() {
    if (!token) {
      throw new Error("Entre com e-mail e senha para ativar a biometria.");
    }

    await checkBiometrics();

    await SecureStore.setItemAsync(BIOMETRIC_KEY, token, {
      requireAuthentication: true,
      authenticationPrompt: "Ativar biometria do Storm Aid",
    });
  }

  async function signInWithBiometrics() {
    await checkBiometrics();

    const storedToken = await SecureStore.getItemAsync(BIOMETRIC_KEY, {
      requireAuthentication: true,
      authenticationPrompt: "Entrar no Storm Aid",
    });

    if (!storedToken) {
      throw new Error(
        "Biometria não ativada. Entre com e-mail e senha primeiro.",
      );
    }

    await saveToken(storedToken);
  }

  function lockSession() {
    setToken(null);
    setUser(null);
    setRole(null);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync("stormaid_access_token");

    lockSession();
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        hasToken: !!token,
        isLoading: false,
        saveToken,
        signIn,
        signInWithBiometrics,
        enableBiometrics,
        lockSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro do AuthProvider");
  }

  return context;
}