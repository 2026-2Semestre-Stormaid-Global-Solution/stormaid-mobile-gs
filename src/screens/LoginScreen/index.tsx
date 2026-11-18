import { View } from "react-native";
import LayoutWrapper from "../../components/LayoutWrapper";
import Logo from "../../components/Logo";
import FormLogin from "../../components/FormLogin";

export default function LoginScreen() {
  return (
    <LayoutWrapper>
      <View
        style={{
          alignItems: "flex-end",
          marginTop: 10,
        }}
      >
        <Logo />
      </View>

      <FormLogin />
    </LayoutWrapper>
  );
}