import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import { SectionEssentialEquipmentsType } from "../../types/AccessibilityDataType";
import Title from "../Title";
import SubTitle from "../SubTitle";
import InputForm from "../InputForm";

export default function SectionEssentialEquipments({
  equipmentDescription,
  preferNotToInformEquipment,
  error,
  onEquipmentChange,
  onPreferNotInformChange,
}: SectionEssentialEquipmentsType) {
  const { colors } = useTheme();

  return (
    <View>
      <Title
        text="Equipamentos essenciais"
        fontSize={20}
        fontFamily={FONTS.inter[600]}
        marginBottom={10}
      />

      <SubTitle
        text="Informe equipamentos ou itens importantes de que você precisa."
        fontSize={16}
        fontFamily={FONTS.inter[500]}
      />

      <View style={{ gap: 5 }}>
        <InputForm
          label=""
          placeholder="Ex.: cadeira de rodas, medicamentos..."
          gap={-1}
          maxLength={250}
          value={equipmentDescription}
          onChangeText={onEquipmentChange}
          editable={!preferNotToInformEquipment}
          error={!!error}
        />

        {error && (
          <Text
            accessibilityRole="alert"
            style={{
              color: colors.messageError,
              fontFamily: FONTS.inter[500],
              fontSize: 13,
            }}
          >
            {error}
          </Text>
        )}
      </View>

      <Pressable
        onPress={onPreferNotInformChange}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: preferNotToInformEquipment,
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 17,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: preferNotToInformEquipment ? colors.primary : colors.inputBorder,
            backgroundColor: preferNotToInformEquipment ? colors.primary : "transparent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {preferNotToInformEquipment && (
            <Feather name="check" size={15} color={colors.onPrimary} />
          )}
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontFamily: FONTS.inter[400],
            flexShrink: 1,
          }}
        >
          Prefiro não informar agora
        </Text>
      </Pressable>
    </View>
  );
}
