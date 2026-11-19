import * as SecureStore from "expo-secure-store";
import { RegisterRequestType, RegisterResponseType, RegisterResultType} from "../types/RegisterRequestType";
import { AddressDataType } from "../types/AddressDataType";
import { AccessibilityDataType } from "../types/AccessibilityDataType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const REGISTER_DRAFT_KEY = "stormaid_registration_draft_v1";

export async function saveAccountData(
  data: RegisterRequestType
): Promise<void> {
  await SecureStore.setItemAsync(
    REGISTER_DRAFT_KEY,
    JSON.stringify({
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phoneNumber: data.phoneNumber,
      password: data.password,
    })
  );
}

export async function getAccountData(): Promise<RegisterRequestType | null> {
  const storedData = await SecureStore.getItemAsync(
    REGISTER_DRAFT_KEY
  );

  if (!storedData) {
    return null;
  }

  return JSON.parse(storedData) as RegisterRequestType;
}

export async function clearAccountData(): Promise<void> {
  await SecureStore.deleteItemAsync(REGISTER_DRAFT_KEY);
}

export async function registerAccount(): Promise<RegisterResultType> {
  if (!API_URL) {
    throw new Error("URL da API Java não configurada.");
  }

  const accountData = await getAccountData();

  if (!accountData) {
    throw new Error("Dados de cadastro não encontrados. Preencha o formulário novamente.");
  }

  const response = await fetch(
    `${API_URL}/api/v1/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountData),
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    if (response.status === 400) {
      throw new Error("Os dados do cadastro foram rejeitados pela API.");
    }

    throw new Error("Não foi possível criar a conta. Tente novamente.");
  }

  const user = (await response.json()) as RegisterResponseType;

  let draftCleared = false;

  try {
    await clearAccountData();
    draftCleared = true;
  } catch {
    draftCleared = false;
  }

  return {
    user,
    draftCleared,
  };
}

export async function saveAddressData(
  address: AddressDataType
): Promise<void> {
  const storedData = await SecureStore.getItemAsync(
    REGISTER_DRAFT_KEY
  );

  if (!storedData) {
    throw new Error("Preencha seus dados pessoais primeiro.");
  }

  const draft = JSON.parse(storedData);

  await SecureStore.setItemAsync(
    REGISTER_DRAFT_KEY,
    JSON.stringify({
      ...draft,
      address,
    })
  );
}

export async function getAddressData(): Promise<AddressDataType | null> {
  const storedData = await SecureStore.getItemAsync(
    REGISTER_DRAFT_KEY
  );

  if (!storedData) {
    return null;
  }

  const draft = JSON.parse(storedData);

  return draft.address ?? null;
}

export async function saveAccessibilityData(
  data: AccessibilityDataType
): Promise<void> {
  const storedData = await SecureStore.getItemAsync(
    REGISTER_DRAFT_KEY
  );

  if (!storedData) {
    throw new Error(
      "Preencha seus dados pessoais antes de continuar."
    );
  }

  const draft = JSON.parse(storedData);

  await SecureStore.setItemAsync(
    REGISTER_DRAFT_KEY,
    JSON.stringify({
      ...draft,
      vulnerability: data,
    })
  );
}

export async function getAccessibilityData():
  Promise<AccessibilityDataType | null> {
  const storedData = await SecureStore.getItemAsync(
    REGISTER_DRAFT_KEY
  );

  if (!storedData) {
    return null;
  }

  const draft = JSON.parse(storedData);

  return draft.vulnerability ?? null;
}