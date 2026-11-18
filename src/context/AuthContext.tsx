import { createContext, useContext, useEffect, useState, type PropsWithChildren,} from "react";
import * as SecureStore from "expo-secure-store";
import { loginWithEmail, getAuthenticatedUser, getResponderProfile, type AuthUser,} from "../services/authService";
import { AppRoleType } from "../types/AppRoleType";

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  role: AppRoleType | null;
  hasToken: boolean;
  isLoading: boolean;
  saveToken: (token: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const TOKEN_KEY = "stormaid_access_token";

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

  const domain = user.email.trim().toLowerCase().split("@")[1];

  const responderDomain = "responderstormaid.com.br";
  const regulatorDomain = "regulatorstormaid.com.br";

  if (role === "RESPONDER" && domain !== responderDomain) {
    throw new Error("E-mail institucional de socorrista inválido.");
  }

  if (role === "REGULATOR" && domain !== regulatorDomain) {
    throw new Error("E-mail institucional de regulador inválido.");
  }

  if ( role === "CITIZEN" && (domain === responderDomain || domain === regulatorDomain)) {
    throw new Error("Este e-mail é reservado para contas institucionais.");
  }

  return role;
}

async function validateAccess(accessToken: string): Promise<{
  user: AuthUser;
  role: AppRoleType;
}> {
  const authenticatedUser = await getAuthenticatedUser(accessToken);

  const authorizedRole = getAuthorizedRole(authenticatedUser);

  if (authorizedRole === "RESPONDER") {
    const profile = await getResponderProfile(accessToken);

    if (profile.verificationStatus !== "APPROVED") {
      throw new Error("Sua conta de socorrista ainda não está aprovada.");
    }
  }

  return {
    user: authenticatedUser,
    role: authorizedRole,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRoleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreToken() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (!storedToken) {
          return;
        }

        const session = await validateAccess(storedToken);

        if (isMounted) {
          setToken(storedToken);
          setUser(session.user);
          setRole(session.role);
        }
      } catch {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setRole(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreToken();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveToken(accessToken: string) {
    if (!accessToken.trim()) {
      throw new Error("Token de autenticação inválido.");
    }
    const session = await validateAccess(accessToken);

    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);

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

  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    setToken(null);
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        hasToken: !!token,
        isLoading,
        saveToken,
        signIn,
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