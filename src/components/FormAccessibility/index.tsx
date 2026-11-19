import { Text, View } from "react-native";
import SubTitle from "../SubTitle";
import Title from "../Title";
import { FONTS } from "../../styles/style";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useTheme } from "../../context/ThemeContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import SectionAccessibility from "../SectionAccessibility";
import Button from "../Button";
import CardTouchable from "../CardTouchable";

export default function FormAccessibility() {
  const { colors } = useTheme();

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
          <CardTouchable isActive>
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
          </CardTouchable>
          <CardTouchable>
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
          </CardTouchable>
          <CardTouchable>
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
          </CardTouchable>
          <CardTouchable>
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
          </CardTouchable>
        </View>
      </View>

      <SectionAccessibility />

      <View
        style={{
            alignItems: "center",
            marginTop: 30
        }}
      >
        <Button onPress={() => {}} text={"Continuar"} />
      </View>
    </View>
  );
}
