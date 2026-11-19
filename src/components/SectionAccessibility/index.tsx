import { Text, View } from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import { SectionAccessibilityType } from "../../types/AccessibilityDataType";
import Title from "../Title";
import CardTouchable from "../CardTouchable";
import SectionEssentialEquipments from "../SectionEssentialEquipments";

export default function SectionAccessibility({
  value,
  onChange,
  equipmentError,
}: SectionAccessibilityType) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginTop: 30,
      }}
    >
      <Title
        text="Acessibilidade"
        fontSize={20}
        fontFamily={FONTS.inter[600]}
      />

      <View
        style={{
          flexWrap: "wrap",
          flexDirection: "row",
          justifyContent: "center",
          gap: 12,
          marginTop: 14,
        }}
      >
        <CardTouchable
          width={163}
          paddingTop={9}
          paddingBottom={9}
          justifyContent="center"
          borderRadius={8}
          gap={10}
          isActive={value.hasVisualImpairment}
          onPress={() =>
            onChange({
              hasVisualImpairment: !value.hasVisualImpairment,
            })
          }
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: value.hasVisualImpairment,
          }}
        >
          <Feather name="eye" size={22} color={colors.icon} />

          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontFamily: FONTS.inter[500],
            }}
          >
            Visual
          </Text>
        </CardTouchable>

        <CardTouchable
          width={163}
          paddingTop={9}
          paddingBottom={9}
          justifyContent="center"
          borderRadius={8}
          gap={10}
          isActive={value.hasHearingImpairment}
          onPress={() =>
            onChange({
              hasHearingImpairment: !value.hasHearingImpairment,
            })
          }
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: value.hasHearingImpairment,
          }}
        >
          <MaterialIcons
            name="spatial-audio-off"
            size={24}
            color={colors.icon}
          />

          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontFamily: FONTS.inter[500],
            }}
          >
            Auditiva
          </Text>
        </CardTouchable>

        <CardTouchable
          width={163}
          paddingTop={9}
          paddingBottom={9}
          justifyContent="center"
          borderRadius={8}
          gap={10}
          isActive={value.hasSpeechImpairment}
          onPress={() =>
            onChange({
              hasSpeechImpairment: !value.hasSpeechImpairment,
            })
          }
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: value.hasSpeechImpairment,
          }}
        >
          <MaterialCommunityIcons
            name="audio-input-xlr"
            size={24}
            color={colors.icon}
          />

          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontFamily: FONTS.inter[500],
            }}
          >
            Fala
          </Text>
        </CardTouchable>

        <CardTouchable
          width={163}
          paddingTop={9}
          paddingBottom={9}
          justifyContent="center"
          borderRadius={8}
          gap={10}
          isActive={value.hasCognitiveImpairment}
          onPress={() =>
            onChange({
              hasCognitiveImpairment: !value.hasCognitiveImpairment,
            })
          }
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: value.hasCognitiveImpairment,
          }}
        >
          <MaterialCommunityIcons
            name="face-recognition"
            size={24}
            color={colors.icon}
          />

          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontFamily: FONTS.inter[500],
            }}
          >
            Cognitiva
          </Text>
        </CardTouchable>
      </View>

      <View
        style={{
          marginTop: 30,
        }}
      >
        <SectionEssentialEquipments
          equipmentDescription={value.equipmentDescription}
          preferNotToInformEquipment={value.preferNotToInformEquipment}
          error={equipmentError}
          onEquipmentChange={(text) => onChange({ equipmentDescription: text })}
          onPreferNotInformChange={() =>
            onChange({
              preferNotToInformEquipment: !value.preferNotToInformEquipment,
              equipmentDescription: "",
            })
          }
        />
      </View>
    </View>
  );
}
