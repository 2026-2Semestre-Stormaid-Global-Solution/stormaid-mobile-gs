import type {
  CitizenProfileContactResponseType,
  EmergencyContactFormType,
} from "../types/EmergencyContactType";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

function getEndpoint(): string {
  if (!API_URL) {
    throw new Error("A URL da API Java não está configurada.");
  }

  return `${API_URL}/api/v1/citizens/me/profile`;
}

function getAuthorization(token: string): string {
  if (!token.trim()) {
    throw new Error("Sessão não encontrada. Faça login novamente.");
  }

  return `Bearer ${token.trim()}`;
}

async function parseResponse(response: Response): Promise<CitizenProfileContactResponseType> {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Sua sessão expirou. Faça login novamente.");
    }

    if (response.status === 403) {
      throw new Error("Você não possui permissão para acessar os contatos.");
    }

    if (response.status >= 500) {
      throw new Error("O serviço de contatos está indisponível. Tente novamente.");
    }

    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message || `Não foi possível salvar ou consultar o contato (HTTP ${response.status}).`);
  }

  let profile: CitizenProfileContactResponseType;

  try {
    profile = (await response.json()) as CitizenProfileContactResponseType;
  } catch {
    throw new Error("A API retornou uma resposta inválida.");
  }

  if (!profile || !Object.prototype.hasOwnProperty.call(profile, "emergencyContact")) {
    throw new Error("A resposta da API não contém os dados do contato de emergência.");
  }

  return profile;
}

export async function getEmergencyContact(
  token: string,
): Promise<CitizenProfileContactResponseType> {
  const endpoint = getEndpoint();
  const authorization = getAuthorization(token);
  let response: Response;

  try {
    response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        Authorization: authorization,
      },
    });
  } catch {
    throw new Error("Não foi possível conectar à API Java.");
  }

  return parseResponse(response);
}

export async function saveEmergencyContact(
  token: string,
  contact: EmergencyContactFormType,
): Promise<CitizenProfileContactResponseType> {
  const endpoint = getEndpoint();
  const authorization = getAuthorization(token);
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({
        emergencyContact: {
          name: contact.name.trim(),
          phoneNumber: contact.phoneNumber,
          relationship: contact.relationship,
        },
      }),
    });
  } catch {
    throw new Error("Não foi possível conectar à API Java.");
  }

  return parseResponse(response);
}
