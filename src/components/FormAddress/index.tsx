import { Pressable, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import SubTitle from "../SubTitle";
import Title from "../Title";
import InputForm from "../InputForm";
import Button from "../Button";
import { getAddressByCep } from "../../services/addressService";
import { getAddressData, saveAddressData} from "../../services/registerService";

type FormAddressType = {
  onContinue?: () => void;
};

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function FormAddress({ onContinue }: FormAddressType) {
  const { colors } = useTheme();
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [noNumber, setNoNumber] = useState(false);
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [searchingCep, setSearchingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cepLookupError, setCepLookupError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const skipLookupCep = useRef<string | null>(null);

  const cepDigits = postalCode.replace(/\D/g, "");

  useEffect(() => {
    let mounted = true;

    async function restoreAddress() {
      try {
        const storedAddress = await getAddressData();

        if (mounted && storedAddress) {
          skipLookupCep.current = storedAddress.postalCode;
          setPostalCode(formatCep(storedAddress.postalCode));
          setStreet(storedAddress.street);
          setAddressNumber(storedAddress.addressNumber);
          setComplement(storedAddress.complement);
          setNoNumber(storedAddress.noNumber);
          setNeighborhood(storedAddress.neighborhood);
          setCity(storedAddress.city);
          setState(storedAddress.state);
        }
      } catch {
        if (mounted) {
          setSaveError("Não foi possível recuperar o endereço salvo.");
        }
      } finally {
        if (mounted) {
          setRestoring(false);
        }
      }
    }

    restoreAddress();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (restoring || cepDigits.length !== 8) {
      return;
    }

    if (skipLookupCep.current === cepDigits) {
      setSearchingCep(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setSearchingCep(true);
        setCepLookupError(null);

        const address = await getAddressByCep(cepDigits, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setStreet(address.logradouro || "");
        setNeighborhood(address.bairro || "");
        setCity(address.localidade || "");
        setState(address.uf || "");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setCepLookupError(
          error instanceof Error ? error.message : "Não foi possível consultar o CEP.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setSearchingCep(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [cepDigits, restoring]);

  const cepValidation =
    cepDigits.length !== 8 ? "Informe um CEP com 8 dígitos." : null;

  const streetValidation = !street.trim()
    ? "Informe sua rua."
    : street.trim().length > 150
      ? "A rua deve conter no máximo 150 caracteres."
      : null;

  const numberValidation =
    !noNumber && !addressNumber.trim()
      ? "Informe o número ou marque Sem número."
      : addressNumber.length > 20
        ? "O número deve conter no máximo 20 caracteres."
        : null;

  const complementValidation =
    complement.length > 100 ? "O complemento deve conter no máximo 100 caracteres." : null;

  const neighborhoodValidation = !neighborhood.trim()
    ? "Informe seu bairro."
    : neighborhood.trim().length > 100
      ? "O bairro deve conter no máximo 100 caracteres."
      : null;

  const cityValidation = !city.trim()
    ? "Informe sua cidade."
    : city.trim().length > 100
      ? "A cidade deve conter no máximo 100 caracteres."
      : null;

  const stateValidation =
    state.length !== 2 || !/^[A-Z]{2}$/.test(state) ? "Informe uma UF válida." : null;

  const cepErrorMessage = (validationAttempted ? cepValidation : null) || cepLookupError;

  const streetErrorMessage = validationAttempted ? streetValidation : null;

  const numberErrorMessage = validationAttempted ? numberValidation : null;

  const complementErrorMessage = validationAttempted ? complementValidation : null;

  const neighborhoodErrorMessage = validationAttempted ? neighborhoodValidation : null;

  const cityErrorMessage = validationAttempted ? cityValidation : null;

  const stateErrorMessage = validationAttempted ? stateValidation : null;

  const hasErrors = !!(
    cepValidation ||
    streetValidation ||
    numberValidation ||
    complementValidation ||
    neighborhoodValidation ||
    cityValidation ||
    stateValidation ||
    cepLookupError
  );

  const buttonDisabled =
    restoring ||
    searchingCep ||
    saving ||
    (validationAttempted && hasErrors) ||
    !!cepLookupError;

  function handleCepChange(value: string) {
    const formatted = formatCep(value);
    const digits = formatted.replace(/\D/g, "");

    setPostalCode(formatted);
    setCepLookupError(null);
    setSaveError(null);
    setSearchingCep(digits.length === 8);

    if (skipLookupCep.current !== digits) {
      skipLookupCep.current = null;
    }
  }

  function handleNoNumberChange() {
    const next = !noNumber;

    setNoNumber(next);

    if (next) {
      setAddressNumber("");
    }
  }

  async function handleContinue() {
    if (buttonDisabled) {
      return;
    }

    setValidationAttempted(true);
    setSaveError(null);

    if (hasErrors) {
      return;
    }

    try {
      setSaving(true);

      await saveAddressData({
        postalCode: cepDigits,
        street: street.trim(),
        addressNumber: noNumber ? "" : addressNumber.trim(),
        complement: complement.trim(),
        noNumber,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
      });

      onContinue?.();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Não foi possível salvar o endereço.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <SubTitle text="Passo 2 de 4" />

      <Title text="Onde você mora?" marginBottom={20} />

      <View style={{ gap: 20 }}>
        <View style={{ gap: 5 }}>
          <InputForm
            label="CEP"
            placeholder="00000-000"
            fontSizeLabel={17}
            keyboardType="number-pad"
            maxLength={9}
            value={postalCode}
            onChangeText={handleCepChange}
            error={!!cepErrorMessage}
            editable={!restoring && !saving}
          />

          {searchingCep && (
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              Consultando CEP...
            </Text>
          )}

          {cepErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {cepErrorMessage}
            </Text>
          )}
        </View>

        <View style={{ gap: 5 }}>
          <InputForm
            label="Rua"
            placeholder="Nome da rua"
            fontSizeLabel={17}
            value={street}
            onChangeText={setStreet}
            error={!!streetErrorMessage}
            editable={!restoring && !saving}
          />

          {streetErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {streetErrorMessage}
            </Text>
          )}
        </View>

        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 15,
            }}
          >
            <View style={{ flex: 1, gap: 5 }}>
              <InputForm
                label="Número"
                placeholder="Nº"
                fontSizeLabel={17}
                keyboardType="number-pad"
                maxLength={20}
                value={addressNumber}
                onChangeText={setAddressNumber}
                error={!!numberErrorMessage}
                editable={!noNumber && !restoring && !saving}
              />

              {numberErrorMessage && (
                <Text
                  accessibilityRole="alert"
                  style={{
                    color: colors.messageError,
                    fontFamily: FONTS.inter[500],
                    fontSize: 13,
                  }}
                >
                  {numberErrorMessage}
                </Text>
              )}
            </View>

            <View style={{ flex: 1, gap: 5 }}>
              <InputForm
                label="Complemento"
                placeholder="Apto, bloco..."
                fontSizeLabel={17}
                maxLength={100}
                value={complement}
                onChangeText={setComplement}
                error={!!complementErrorMessage}
                editable={!restoring && !saving}
              />

              {complementErrorMessage && (
                <Text
                  accessibilityRole="alert"
                  style={{
                    color: colors.messageError,
                    fontFamily: FONTS.inter[500],
                    fontSize: 13,
                  }}
                >
                  {complementErrorMessage}
                </Text>
              )}
            </View>
          </View>

          <Pressable
            onPress={handleNoNumberChange}
            disabled={restoring || saving}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: noNumber }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 1.5,
                borderColor: noNumber ? colors.primary : colors.inputBorder,
                backgroundColor: noNumber ? colors.primary : "transparent",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {noNumber && (
                <Text
                  style={{
                    color: colors.onPrimary,
                    fontSize: 14,
                    fontFamily: FONTS.inter[700],
                  }}
                >
                  ✓
                </Text>
              )}
            </View>

            <Text
              style={{
                color: colors.text,
                fontFamily: FONTS.inter[400],
                fontSize: 15,
              }}
            >
              Sem número
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 5 }}>
          <InputForm
            label="Bairro"
            placeholder="Seu bairro"
            fontSizeLabel={17}
            value={neighborhood}
            onChangeText={setNeighborhood}
            error={!!neighborhoodErrorMessage}
            editable={!restoring && !saving}
          />

          {neighborhoodErrorMessage && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
              }}
            >
              {neighborhoodErrorMessage}
            </Text>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 15,
          }}
        >
          <View style={{ flex: 3, gap: 5 }}>
            <InputForm
              label="Cidade"
              placeholder="Sua cidade"
              fontSizeLabel={17}
              value={city}
              onChangeText={setCity}
              error={!!cityErrorMessage}
              editable={!restoring && !saving}
            />

            {cityErrorMessage && (
              <Text
                accessibilityRole="alert"
                style={{
                  color: colors.messageError,
                  fontFamily: FONTS.inter[500],
                  fontSize: 13,
                }}
              >
                {cityErrorMessage}
              </Text>
            )}
          </View>

          <View style={{ flex: 1, gap: 5 }}>
            <InputForm
              label="UF"
              placeholder="UF"
              fontSizeLabel={17}
              maxLength={2}
              autoCapitalize="characters"
              value={state}
              onChangeText={(value) =>
                setState(value.replace(/[^a-zA-Z]/g, "").toUpperCase())
              }
              error={!!stateErrorMessage}
              editable={!restoring && !saving}
            />

            {stateErrorMessage && (
              <Text
                accessibilityRole="alert"
                style={{
                  color: colors.messageError,
                  fontFamily: FONTS.inter[500],
                  fontSize: 13,
                }}
              >
                {stateErrorMessage}
              </Text>
            )}
          </View>
        </View>

        <View
          style={{
            alignItems: "center",
            marginTop: 20,
            gap: 10,
          }}
        >
          <Button
            onPress={handleContinue}
            disabled={buttonDisabled}
            text={saving ? "Salvando..." : "Continuar"}
            backgroundColor={
              buttonDisabled ? colors.buttonDisabled : colors.primary
            }
            colorText={
              buttonDisabled ? colors.textSecondary : colors.textButton
            }
          />

          {saveError && (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.messageError,
                fontFamily: FONTS.inter[500],
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {saveError}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
