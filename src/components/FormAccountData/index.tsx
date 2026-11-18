import { View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import Title from "../Title";
import InputForm from "../InputForm";
import { FontAwesome5 } from "@expo/vector-icons";
import Button from "../Button";
import SubTitle from "../SubTitle";

export default function FormAccountData() {
  const { colors } = useTheme();

  return (
    <View>
      <SubTitle text="Passo 1 de 4" />

      <Title text="Seus dados" marginBottom={20} />

      <View
        style={{
          gap: 20,
        }}
      >
        <InputForm
          label="Nome completo"
          placeholder="Digite seu nome completo"
          fontSizeLabel={17}
        />

        <InputForm
          label="E-mail"
          placeholder="seu.email@exemplo.com"
          fontSizeLabel={17}
          keyboardType="email-address"
        />

        <InputForm
          label="Telefone"
          placeholder="(00) 00000-0000"
          fontSizeLabel={17}
          keyboardType="email-address"
        />

        <InputForm
          label="Senha"
          placeholder="Mínimo de 6 caractéres"
          fontSizeLabel={17}
          keyboardType="email-address"
          secureTextEntry
          isIcon={<FontAwesome5 name={"eye"} size={22} color={colors.icon} />}
        />

        <InputForm
          label="Confirmar senha"
          placeholder="Digite a senha novamente"
          fontSizeLabel={17}
          keyboardType="email-address"
          secureTextEntry
          isIcon={<FontAwesome5 name={"eye"} size={22} color={colors.icon} />}
        />

        <View
          style={{
            marginTop: 30,
            alignItems: "center",
          }}
        >
          <Button
            onPress={() => {}}
            text={"Continuar"}
            colorText={colors.textButton}
          />
        </View>
      </View>
    </View>
  );
}