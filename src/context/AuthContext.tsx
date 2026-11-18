import { createContext, useContext, useEffect, useState, type PropsWithChildren,} from "react";
import * as SecureStore from "expo-secure-store";
import { loginWithEmail } from "../services/authService";

type AuthContextType = {
  token: string | null;
  hasToken: boolean;
  isLoading: boolean;
  saveToken: (token: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const TOKEN_KEY = "stormaid_access_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreToken() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (isMounted) {
          setToken(storedToken);
        }
      } catch {
        if (isMounted) {
          setToken(null);
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

    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);

    setToken(accessToken);
  }

  async function signIn(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const response = await loginWithEmail(
      normalizedEmail,
      password
    );

    if (!response.accessToken) {
      throw new Error("A API não retornou um token de autenticação.");
    }

    await saveToken(response.accessToken);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
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