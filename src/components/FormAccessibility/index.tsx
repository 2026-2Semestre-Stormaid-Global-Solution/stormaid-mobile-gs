import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import SubTitle from "../SubTitle";
import Title from "../Title";
import { FONTS } from "../../styles/style";
import Card from "../CardTouchable";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useTheme } from "../../context/ThemeContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import SectionAccessibility from "../SectionAccessibility";
import Button from "../Button";
import {
  AccessibilityDataType,
  MobilityStatusType,
} from "../../types/AccessibilityDataType";
import {
  getAccessibilityData,
  saveAccessibilityData,
} from "../../services/registerService";

type FormAccessibilityType = {
  onContinue?: () => void;
};

const initialData: AccessibilityDataType = {
  mobilityStatus: "AUTONOMOUS",
  hasVisualImpairment: false,
  hasHearingImpairment: false,
  hasSpeechImpairment: false,
  hasCognitiveImpairment: false,
  equipmentDescription: "",
  preferNotToInformEquipment: false,
};

export default function FormAccessibility({
  onContinue,
}: FormAccessibilityType) {
  const { colors } = useTheme();

  const [data, setData] = useState<AccessibilityDataType>(initialData);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function restoreAccessibility() {
      try {
        const storedData = await getAccessibilityData();

        if (mounted && storedData) {
          setData({
            ...initialData,
            ...storedData,
            equipmentDescription: storedData.equipmentDescription ?? "",
          });
        }
      } catch {
        if (mounted) {
          setSaveError(
            "Não foi possível recuperar os dados de acessibilidade.",
          );
        }
      } finally {
        if (mounted) {
          setRestoring(false);
        }
      }
    }

    restoreAccessibility();

    return () => {
      mounted = false;
    };
  }, []);

  const hasMobilityLimitations = data.mobilityStatus !== "AUTONOMOUS";

  const equipmentError =
    validationAttempted &&
    hasMobilityLimitations &&
    !data.preferNotToInformEquipment &&
    !data.equipmentDescription.trim()
      ? "Informe os equipamentos necessários ou marque a opção Prefiro não informar agora."
      : null;

  const buttonDisabled = restoring || saving || !!equipmentError;

  function handleMobilityChange(value: MobilityStatusType) {
    setSaveError(null);

    if (value === "AUTONOMOUS") {
      setData({ ...initialData });
      return;
    }

    setData((previous) => ({
      ...previous,
      mobilityStatus: value,
    }));
  }

  function handleAccessibilityChange(changes: Partial<AccessibilityDataType>) {
    setData((previous) => ({
      ...previous,
      ...changes,
    }));

    setSaveError(null);
  }

  async function handleContinue() {
    if (buttonDisabled) {
      return;
    }

    setValidationAttempted(true);
    setSaveError(null);

    if (
      hasMobilityLimitations &&
      !data.preferNotToInformEquipment &&
      !data.equipmentDescription.trim()
    ) {
      return;
    }

    try {
      setSaving(true);

      await saveAccessibilityData(data);

      onContinue?.();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os dados de acessibilidade.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <SubTitle text="Passo 3 de 4" />

      <Title text="Como podemos te ajudar melhor?" fontSize={26} />

      <SubTitle
        text="Usamos essas informações para que a equipe possa chegar preparada para você."
        fontFamily={FONTS.inter[500]}
        fontSize={16}
        marginTop={10}
      />

      <View
        style={{
          marginTop: 20,
        }}
      >
        <Title text="Mobilidade" fontSize={20} fontFamily={FONTS.inter[600]} />

        <View
          style={{
            marginTop: 10,
            gap: 15,
          }}
        >
          <Card
            isActive={data.mobilityStatus === "AUTONOMOUS"}
            onPress={() => handleMobilityChange("AUTONOMOUS")}
            accessibilityRole="radio"
            accessibilityState={{
              checked: data.mobilityStatus === "AUTONOMOUS",
            }}
          >
            <FontAwesome5 name="walking" size={24} color={colors.icon} />

            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontFamily: FONTS.inter[500],
              }}
            >
              Ando sem ajuda
            </Text>
          </Card>

          <Card
            isActive={data.mobilityStatus === "ASSISTED"}
            onPress={() => handleMobilityChange("ASSISTED")}
            accessibilityRole="radio"
            accessibilityState={{
              checked: data.mobilityStatus === "ASSISTED",
            }}
          >
            <MaterialIcons name="elderly" size={24} color={colors.icon} />

            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontFamily: FONTS.inter[500],
              }}
            >
              Uso bengala ou andador
            </Text>
          </Card>

          <Card
            isActive={data.mobilityStatus === "WHEELCHAIR_USER"}
            onPress={() => handleMobilityChange("WHEELCHAIR_USER")}
            accessibilityRole="radio"
            accessibilityState={{
              checked: data.mobilityStatus === "WHEELCHAIR_USER",
            }}
          >
            <FontAwesome name="wheelchair" size={23} color={colors.icon} />

            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontFamily: FONTS.inter[500],
              }}
            >
              Uso cadeira de rodas
            </Text>
          </Card>

          <Card
            isActive={data.mobilityStatus === "BEDRIDDEN"}
            onPress={() => handleMobilityChange("BEDRIDDEN")}
            accessibilityRole="radio"
            accessibilityState={{
              checked: data.mobilityStatus === "BEDRIDDEN",
            }}
          >
            <FontAwesome name="bed" size={24} color={colors.icon} />

            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontFamily: FONTS.inter[500],
              }}
            >
              Não consigo sair da cama
            </Text>
          </Card>
        </View>
      </View>

      {hasMobilityLimitations && (
        <SectionAccessibility
          value={data}
          onChange={handleAccessibilityChange}
          equipmentError={equipmentError}
        />
      )}

      <View
        style={{
          alignItems: "center",
          marginTop: 30,
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
          colorText={buttonDisabled ? colors.textSecondary : colors.textButton}
        />

        {saveError && (
          <Text
            accessibilityRole="alert"
            style={{
              color: colors.messageError,
              fontFamily: FONTS.inter[500],
              fontSize: 13,
              textAlign: "center",
              maxWidth: 300,
            }}
          >
            {saveError}
          </Text>
        )}
      </View>
    </View>
  );
}
