import LayoutWrapper from "../../components/LayoutWrapper";
import HeaderCreateAccount from "../../components/HeaderCreateAccount";
import FormAccountData from "../../components/FormAccountData";
import FormAddress from "../../components/FormAddress";
import FormAccessibility from "../../components/FormAccessibility";

export default function CreateAccountScreen() {

  return (
    <LayoutWrapper paddingBottom={80}>
      <HeaderCreateAccount />

      {/* <FormAccountData /> */}
      {/* <FormAddress /> */}
      <FormAccessibility />
    </LayoutWrapper>
  );
}
