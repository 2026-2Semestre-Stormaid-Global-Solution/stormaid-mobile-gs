import { View } from "react-native";
import Title from "../Title";
import { FONTS } from "../../styles/style";
import SubTitle from "../SubTitle";
import InputForm from "../InputForm";

export default function SectionEssentialEquipments() {
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

      <InputForm
        label=""
        placeholder="Ex.: cadeira de rodas, medicamentos..."
        gap={-1}
      />

      {/* Tem que colocar o checkbox */}
      <SubTitle text="Prefiro não informar agora" fontSize={16} marginTop={17}/>
    </View>
  );
}
