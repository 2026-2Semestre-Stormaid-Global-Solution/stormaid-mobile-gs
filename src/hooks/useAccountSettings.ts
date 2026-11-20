import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { deactivateMyAccount, updateMyAccount } from "../services/accountService";

type AccountAction = "editing" | "deactivating" | "signingOut" | "enablingBiometrics" | "disablingBiometrics";

export function useAccountSettings() {
  const {
    token,
    user,
    saveToken,
    signOut,
    enableBiometrics,
    disableBiometrics,
    biometricsEnabled,
  } = useAuth();
  const [pending, setPending] = useState<AccountAction | null>(null);

  async function withPending<T>(action: AccountAction, task: () => Promise<T>): Promise<T> {
    if (pending) throw new Error("Já existe uma operação em andamento.");
    setPending(action);
    try { return await task(); } finally { setPending(null); }
  }

  async function updateAccount(input: { fullName: string; phoneNumber: string }) {
    return withPending("editing", async () => {
      if (!token) throw new Error("Você precisa entrar novamente na sua conta.");
      const response = await updateMyAccount(token, input);
      await saveToken(token); // Atualiza o usuário do contexto lendo GET /api/v1/auth/me.
      return response;
    });
  }

  async function deactivateAccount() {
    return withPending("deactivating", async () => {
      if (!token) throw new Error("Você precisa entrar novamente na sua conta.");
      await deactivateMyAccount(token);
      try {
        await disableBiometrics();
      } finally {
        await signOut();
      }
    });
  }

  async function logout() {
    return withPending("signingOut", signOut);
  }

  async function activateBiometrics() {
    return withPending("enablingBiometrics", enableBiometrics);
  }

  async function removeBiometrics() {
    return withPending("disablingBiometrics", disableBiometrics);
  }

  return {
    user,
    pending,
    biometricsEnabled,
    updateAccount,
    deactivateAccount,
    logout,
    activateBiometrics,
    removeBiometrics,
  };
}
