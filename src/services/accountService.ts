import type { AuthUser } from "./authService";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

type UpdateAccountRequest = {
  fullName: string;
  phoneNumber: string;
};

function getApiUrl(): string {
  if (!API_URL) throw new Error("URL da API Java não configurada.");
  return API_URL;
}

function getErrorMessage(status: number): string {
  if (status === 400) return "Confira o nome e o telefone informados.";
  if (status === 401) return "Sua sessão expirou. Entre novamente.";
  if (status === 403) return "Você não tem permissão para esta operação.";
  if (status === 409) return "Não foi possível concluir a operação devido a um conflito.";
  return "O servidor não concluiu a operação. Tente novamente.";
}

export async function updateMyAccount(
  token: string,
  input: UpdateAccountRequest,
): Promise<AuthUser> {
  const response = await fetch(`${getApiUrl()}/api/v1/users/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(getErrorMessage(response.status));
  return (await response.json()) as AuthUser;
}

/** O Java usa exclusão lógica: status do usuário passa para INACTIVE. */
export async function deactivateMyAccount(token: string): Promise<void> {
  const response = await fetch(`${getApiUrl()}/api/v1/users/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(getErrorMessage(response.status));
}
