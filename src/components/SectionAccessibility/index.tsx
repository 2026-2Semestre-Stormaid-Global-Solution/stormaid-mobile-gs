import { Text, View } from "react-native";
import { Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import Title from "../Title";
import CardTouchable from "../CardTouchable";
import SectionEssentialEquipments from "../SectionEssentialEquipments";

export default function SectionAccessibility() {
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
          isActive
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
          borderRadius={8}
          justifyContent="center"
          gap={10}
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
            marginTop: 30
        }}
       >
            <SectionEssentialEquipments />
        </View> 
    </View>
  );
}