const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

type ApiError = {
  message?: string;
};

type VerifyResponse = {
  tempToken: string;
  message: string;
};

async function postRecovery(endpoint: string, body: object): Promise<Response> {
  if (!API_URL) {
    throw new Error("URL da API Java não configurada.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/v1/password-recovery/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique sua conexão.");
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as ApiError | null;

    if (response.status === 429) {
      throw new Error(
        "Muitas solicitações. Aguarde alguns minutos antes de tentar novamente.",
      );
    }

    if (response.status >= 500) {
      throw new Error(
        "O serviço está indisponível no momento. Tente novamente mais tarde.",
      );
    }

    throw new Error(
      data?.message || "Não foi possível concluir a solicitação.",
    );
  }

  return response;
}

export async function requestPasswordRecovery(email: string): Promise<void> {
  await postRecovery("request", {
    email: email.trim().toLowerCase(),
  });
}

export async function verifyPasswordRecovery(
  email: string,
  code: string,
): Promise<string> {
  const response = await postRecovery("verify", {
    email: email.trim().toLowerCase(),
    code,
  });

  const data = (await response.json()) as VerifyResponse;

  if (!data.tempToken) {
    throw new Error("A API não retornou o token de redefinição.");
  }

  return data.tempToken;
}

export async function resetPasswordRecovery(
  token: string,
  newPassword: string,
): Promise<void> {
  await postRecovery("reset", {
    token,
    newPassword,
  });
}
