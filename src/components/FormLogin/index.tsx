import { Text, View } from "react-native";
import { FONTS } from "../../styles/style";
import { useTheme } from "../../context/ThemeContext";
import InputForm from "../InputForm";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useState } from "react";
import TextLink from "../TextLink";
import Button from "../Button";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamListType } from "../../types/RootStackParamListType";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function FormLogin() {
  const { colors } = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamListType>>();

  return (
    <View
      style={{
        marginTop: 26,
        marginBottom: 40,
        gap: 40,
      }}
    >
      <View>
        <Text
          style={{
            fontFamily: FONTS.inter[500],
            color: colors.textSecondary,
            fontSize: 17,
          }}
        >
          Entre para pedir ajuda ou acompanhar um chamado.
        </Text>
      </View>

      <View>
        <View
          style={{
            gap: 30,
          }}
        >
          <InputForm label="E-mail" placeholder="exemplo@email.com" />
          <InputForm
            label="Senha"
            placeholder="Digite sua senha"
            isIcon={
              <FontAwesome5
                name={passwordVisible ? "eye-slash" : "eye"}
                size={22}
                color={colors.icon}
              />
            }
            onPress={() => setPasswordVisible(!passwordVisible)}
            secureTextEntry={!passwordVisible}
          />
        </View>
        <TextLink route="Login" text="Esqueci minha senha" textAlign="end" />
      </View>

      <View
        style={{
            alignItems: 'center',
            gap: 30,
        }}
      >
          <Button 
            onPress={() => navigation.navigate("Login")}
            text="Entrar"
          />

          <Button 
            onPress={() => navigation.navigate("Login")}
            text="Entrar com biometria"
            colorText={colors.primary}
            borderWidth={1.5}
            borderColor={colors.primary}
            backgroundColor="transparent"
            fontSize={20}
            iconLeft={
                <Ionicons name="finger-print-outline" size={24} color={colors.primary} />
            }
          />

          <Text
            style={{
                fontSize: 15,
                fontFamily: FONTS.inter[400]
            }}
          >
            Ainda não tem conta?
            <TextLink text=" Criar conta" route="Login"/> 
          </Text>
      </View>
    </View>
  );
}
