import { CepResponseType } from "../types/CepResponseType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getAddressByCep(
  cep: string,
  signal?: AbortSignal
): Promise<CepResponseType> {
  if (!API_URL) {
    throw new Error("URL da API Java não configurada.");
  }

  const digits = cep.replace(/\D/g, "");

  if (digits.length !== 8) {
    throw new Error("Informe um CEP com 8 dígitos.");
  }

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}/api/v1/addresses/cep/${digits}`,
    { signal }
  );

  if (response.status === 404) {
    throw new Error("CEP não encontrado.");
  }

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP.");
  }

  const address = (await response.json()) as CepResponseType;

  if (!address.cep) {
    throw new Error("CEP não encontrado.");
  }

  return address;
}