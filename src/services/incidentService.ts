import type {
  EmergencyCategory,
  IncidentResponseType,
} from "../types/IncidentType";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export type IncidentCreateRequestType = {
  recipientType: "SELF";
  requesterOnSite: boolean;
  channelType: "TEXT_INPUT";
  emergencyCategory: EmergencyCategory;
  textDescription: string;
  location: {
    source: "CURRENT_LOCATION";
    latitude: number;
    longitude: number;
    accuracyMeters?: number | null;
    locationCapturedAt: string;
  };
};

export type IncidentPageResponseType = {
  content: IncidentResponseType[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error("A URL da API não foi configurada.");
  }

  return API_URL;
}

function getAuthorizationHeader(token: string): string {
  if (!token.trim()) {
    throw new Error("Sessão não encontrada. Faça login novamente.");
  }

  return `Bearer ${token}`;
}

async function handleApiError(response: Response): Promise<never> {
  let errorData: ApiErrorResponse | null = null;

  try {
    errorData = (await response.json()) as ApiErrorResponse;
  } catch {
    // The API may return an empty or non-JSON error body.
  }

  if (response.status === 401) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  if (response.status === 403) {
    throw new Error("Você não possui permissão para consultar os chamados.");
  }

  if (response.status >= 500) {
    throw new Error(
      "O serviço de chamados está indisponível. Tente novamente.",
    );
  }

  throw new Error(
    errorData?.message ??
      `Não foi possível consultar os chamados (HTTP ${response.status}).`,
  );
}

export async function listMyIncidents(
  token: string,
  page = 0,
  size = 3,
): Promise<IncidentPageResponseType> {
  const url = new URL(`${getApiUrl()}/api/v1/incidents`);

  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  url.searchParams.set("sort", "createdAt,desc");

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: getAuthorizationHeader(token),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Sessão não encontrada")
    ) {
      throw error;
    }

    throw new Error("Não foi possível conectar à API de chamados.");
  }

  if (!response.ok) {
    await handleApiError(response);
  }

  let data: IncidentPageResponseType;

  try {
    data = (await response.json()) as IncidentPageResponseType;
  } catch {
    throw new Error("A API retornou uma resposta inválida.");
  }

  if (!data || !Array.isArray(data.content)) {
    throw new Error("O formato da listagem de chamados é inválido.");
  }

  return data;
}

export async function createIncident(
  token: string,
  payload: IncidentCreateRequestType,
  idempotencyKey: string,
): Promise<IncidentResponseType> {
  const authorization = getAuthorizationHeader(token);
  const apiUrl = getApiUrl();

  const key = idempotencyKey.trim();

  if (key.length === 0 || key.length > 100 || key.startsWith("auto-")) {
    throw new Error("Identificador da solicitação inválido.");
  }

  if (!payload.textDescription.trim()) {
    throw new Error("Informe a descrição da emergência.");
  }

  const { latitude, longitude } = payload.location;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Localização inválida para o chamado.");
  }

  let response: Response;

  try {
    response = await fetch(`${apiUrl}/api/v1/incidents`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorization,
        "Idempotency-Key": key,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique sua conexão.");
  }

  if (!response.ok) {
    await handleApiError(response);
  }

  let createdIncident: IncidentResponseType;

  try {
    createdIncident = (await response.json()) as IncidentResponseType;
  } catch {
    throw new Error("A API retornou uma resposta inválida ao criar o chamado.");
  }

  if (!createdIncident || typeof createdIncident.id !== "number") {
    throw new Error("Não foi possível confirmar o registro do chamado.");
  }

  return createdIncident;
}
