import {
  createContext,
  useContext,
  useEffect,
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
  biometricsEnabled: boolean;
  saveToken: (token: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithBiometrics: () => Promise<void>;
  enableBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
  lockSession: () => void;
  signOut: () => Promise<void>;
};

const BIOMETRIC_TOKEN_KEY = "stormaid_biometric_token";
const BIOMETRIC_OWNER_KEY = "stormaid_biometric_owner";
const ACCESS_TOKEN_KEY = "stormaid_access_token";
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
  return { user: authenticatedUser, role: getAuthorizedRole(authenticatedUser) };
}

async function checkBiometrics(): Promise<void> {
  if (!(await LocalAuthentication.hasHardwareAsync())) {
    throw new Error("Este dispositivo não possui sensor biométrico disponível.");
  }
  if (!(await LocalAuthentication.isEnrolledAsync())) {
    throw new Error("Cadastre sua digital ou reconhecimento facial nas configurações do dispositivo.");
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRoleType | null>(null);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    setBiometricsEnabled(false);
    if (!user) return;
    SecureStore.getItemAsync(BIOMETRIC_OWNER_KEY)
      .then((owner) => {
        if (active) setBiometricsEnabled(owner === String(user.id));
      })
      .catch(() => {
        if (active) setBiometricsEnabled(false);
      });
    return () => { active = false; };
  }, [user?.id]);

  async function saveToken(accessToken: string) {
    if (!accessToken.trim()) throw new Error("Token de autenticação inválido.");
    const session = await validateAccess(accessToken);
    setToken(accessToken);
    setUser(session.user);
    setRole(session.role);
  }

  async function signIn(email: string, password: string) {
    const response = await loginWithEmail(email.trim().toLowerCase(), password);
    if (!response.accessToken) throw new Error("A API não retornou um token de autenticação.");
    await saveToken(response.accessToken);
    const owner = await SecureStore.getItemAsync(BIOMETRIC_OWNER_KEY);
    if (owner && owner !== String(response.user.id)) {
      // Evita manter a biometria de outra conta ativa neste dispositivo.
      await disableBiometrics();
    }
  }

  async function enableBiometrics() {
    if (!token || !user) throw new Error("Entre com e-mail e senha para ativar a biometria.");
    await checkBiometrics();
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Ativar biometria do Storm Aid",
      cancelLabel: "Cancelar",
      disableDeviceFallback: true,
    });
    if (!result.success) throw new Error("A confirmação biométrica foi cancelada ou não foi reconhecida.");

    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token, {
      requireAuthentication: true,
      authenticationPrompt: "Proteger o acesso ao Storm Aid",
    });
    await SecureStore.setItemAsync(BIOMETRIC_OWNER_KEY, String(user.id));
    setBiometricsEnabled(true);
  }

  async function disableBiometrics() {
    // A remoção é local: não revoga antecipadamente um JWT já emitido pela API.
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_OWNER_KEY);
    setBiometricsEnabled(false);
  }

  async function signInWithBiometrics() {
    await checkBiometrics();
    const storedToken = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY, {
      requireAuthentication: true,
      authenticationPrompt: "Entrar no Storm Aid",
    });
    if (!storedToken) {
      throw new Error("Biometria não ativada. Entre com e-mail e senha primeiro.");
    }
    try {
      await saveToken(storedToken);
    } catch {
      // O token JWT pode ter expirado. Não mantemos credenciais inválidas salvas.
      await disableBiometrics();
      throw new Error("A sessão biométrica expirou. Entre com e-mail e senha e ative-a novamente.");
    }
  }

  function lockSession() {
    setToken(null);
    setUser(null);
    setRole(null);
  }

  async function signOut() {
    // A sessão corrente é encerrada; biometria explicitamente ativada continua
    // protegida no SecureStore para permitir login até o JWT expirar.
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    } finally {
      lockSession();
    }
  }

  return (
    <AuthContext.Provider value={{
      token,
      user,
      role,
      hasToken: !!token,
      isLoading: false,
      biometricsEnabled,
      saveToken,
      signIn,
      signInWithBiometrics,
      enableBiometrics,
      disableBiometrics,
      lockSession,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser utilizado dentro do AuthProvider");
  return context;
}
