import { useRef, useState } from "react";
import LayoutWrapper from "../../components/LayoutWrapper";
import HeaderCreateAccount from "../../components/HeaderCreateAccount";
import FormAccountData from "../../components/FormAccountData";
import FormAddress from "../../components/FormAddress";
import FormAccessibility from "../../components/FormAccessibility";
import FormParents from "../../components/FormParents";
import { useAuth } from "../../context/AuthContext";
import { clearAccountData } from "../../services/registerService";
import { registerFullCitizen } from "../../services/citizenRegistrationService";

export default function CreateAccountScreen() {
  const { saveToken } = useAuth();

  const [step, setStep] = useState(1);

  const createdAccessTokenRef = useRef<string | null>(null);
  const creatingAccountRef = useRef(false);

  function handleNextStep() {
    setStep((previous) => Math.min(previous + 1, 4));
  }

  async function handleCreateAccount() {
    if (creatingAccountRef.current) {
      return;
    }

    creatingAccountRef.current = true;

    try {
      let accessToken = createdAccessTokenRef.current;

      if (!accessToken) {
        const response = await registerFullCitizen();

        accessToken = response.accessToken;
        createdAccessTokenRef.current = accessToken;
      }

      await saveToken(accessToken);

      try {
        await clearAccountData();
      } catch (error) {
        console.warn(
          "Conta criada, mas não foi possível limpar o rascunho.",
          error
        );
      }
    } finally {
      creatingAccountRef.current = false;
    }
  }

  return (
    <LayoutWrapper paddingBottom={80}>
      <HeaderCreateAccount />

      {step === 1 && (
        <FormAccountData onContinue={handleNextStep} />
      )}

      {step === 2 && (
        <FormAddress onContinue={handleNextStep} />
      )}

      {step === 3 && (
        <FormAccessibility onContinue={handleNextStep} />
      )}

      {step === 4 && (
        <FormParents onContinue={handleCreateAccount} />
      )}
    </LayoutWrapper>
  );
}
