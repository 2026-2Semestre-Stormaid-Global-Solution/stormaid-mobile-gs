import {
  getAccountData,
  getAddressData,
  getAccessibilityData,
  getParentsData,
} from "./registerService";

import type { LoginResponse } from "./authService";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function registerFullCitizen(): Promise<LoginResponse> {
  if (!API_URL) {
    throw new Error("URL da API Java não configurada.");
  }

  const [account, address, vulnerability, parents] =
    await Promise.all([
      getAccountData(),
      getAddressData(),
      getAccessibilityData(),
      getParentsData(),
    ]);

  if (!account) {
    throw new Error("Preencha novamente seus dados pessoais.");
  }

  if (!account.cpf || !account.birthDate) {
    throw new Error("Preencha CPF e data de nascimento no primeiro formulário.");
  }

  if (!address) {
    throw new Error("Preencha novamente seu endereço.");
  }

  if (!vulnerability) {
    throw new Error("Preencha novamente os dados de acessibilidade.");
  }

  if (!parents) {
    throw new Error("Preencha novamente os dados do contato.");
  }

  const equipmentDescription =
    vulnerability.equipmentDescription.trim();

  const payload = {
    account: {
      fullName: account.fullName.trim(),
      email: account.email.trim().toLowerCase(),
      phoneNumber: account.phoneNumber,
      cpf: account.cpf.replace(/\D/g, ""),
      birthDate: account.birthDate,
      password: account.password,
    },
    address: {
      postalCode: address.postalCode.replace(/\D/g, ""),
      street: address.street.trim(),
      addressNumber: address.noNumber
        ? null
        : address.addressNumber.trim(),
      complement: address.complement.trim(),
      neighborhood: address.neighborhood.trim(),
      city: address.city.trim(),
      state: address.state.toUpperCase(),
    },
    vulnerability: {
      mobilityStatus: vulnerability.mobilityStatus,
      hasVisualImpairment: vulnerability.hasVisualImpairment,
      hasHearingImpairment: vulnerability.hasHearingImpairment,
      hasSpeechImpairment: vulnerability.hasSpeechImpairment,
      hasCognitiveImpairment: vulnerability.hasCognitiveImpairment,
      dependsOnEquipment:
        !vulnerability.preferNotToInformEquipment &&
        equipmentDescription.length > 0,
      equipmentDescription:
        vulnerability.preferNotToInformEquipment
          ? null
          : equipmentDescription || null,
      equipmentInformationDeclined:
        vulnerability.preferNotToInformEquipment,
    },
    noEmergencyContact: parents.noEmergencyContact,
    emergencyContact: parents.noEmergencyContact
      ? null
      : parents.emergencyContact,
  };

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}/api/v1/auth/register-complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (response.status === 409) {
    throw new Error(
      "Este e-mail já está cadastrado. Volte ao primeiro formulário e corrija o e-mail."
    );
  }

  if (response.status === 400) {
    throw new Error(
      "A API rejeitou os dados do cadastro. Verifique os formulários."
    );
  }

  if (!response.ok) {
    throw new Error(
      "Não foi possível concluir o cadastro. Tente novamente."
    );
  }

  const result = (await response.json()) as LoginResponse;

  if (!result.accessToken) {
    throw new Error(
      "A API criou a conta, mas não retornou o token de autenticação."
    );
  }

  return result;
}
