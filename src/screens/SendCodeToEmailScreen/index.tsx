import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LayoutWrapper from "../../components/LayoutWrapper";
import FormPasswordRecovery from "../../components/FormPasswordRecovery";
import type { RootStackParamListType } from "../../types/RootStackParamListType";

export default function SendCodeToEmailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamListType>>();

  return (
    <LayoutWrapper paddingBottom={30}>
      <FormPasswordRecovery
        onBackToLogin={() => navigation.replace("Login")}
      />
    </LayoutWrapper>
  );
}