export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  status: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export type ResponderProfileResponse = {
  verificationStatus: "PENDING" | "APPROVED" | "SUSPENDED";
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getResponderProfile(accessToken: string): Promise<ResponderProfileResponse> {
  if (!API_URL) {
    throw new Error("URL da API Java não configurada.");
  }

  const response = await fetch(
    `${API_URL}/api/v1/responders/me/profile`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível validar o cadastro institucional."
    );
  }

  return (await response.json()) as ResponderProfileResponse;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<LoginResponse> {
  if (!API_URL) {
    throw new Error("URL da API Java não configurada.");
  }

  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Verifique os dados informados.");
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error("E-mail ou senha inválidos.");
    }

    throw new Error("Não foi possível realizar o login.");
  }

  return (await response.json()) as LoginResponse;
}

export async function getAuthenticatedUser(
  accessToken: string
): Promise<AuthUser> {
  if (!API_URL) {
    throw new Error("URL da API Java não configurada.");
  }

  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Sessão expirada ou inválida.");
  }

  return (await response.json()) as AuthUser;
}