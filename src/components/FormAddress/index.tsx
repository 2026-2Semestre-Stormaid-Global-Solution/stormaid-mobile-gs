import { Text, View } from "react-native";
import SubTitle from "../SubTitle";
import Title from "../Title";
import InputForm from "../InputForm";
import Button from "../Button";

export default function FormAddress() {
  return (
    <View>
      <SubTitle text="Passo 2 de 4" />

      <Title text="Onde você mora?" marginBottom={20} />

      <View
        style={{
            gap: 20
        }}
      >
        <InputForm 
            label="CEP"
            placeholder="00000-000"
            fontSizeLabel={17}
        />
        
        <InputForm 
            label="Rua"
            placeholder="Nome da rua"
            fontSizeLabel={17}
        />

        <View
            style={{
                gap: 10,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <InputForm 
                    label="Número"
                    placeholder="Nº"
                    fontSizeLabel={17}
                    width={171}
                />
                <InputForm 
                    label="Complemento"
                    placeholder="Apto, bloco..."
                    fontSizeLabel={17}
                    width={171}
                />

            </View>
                
            <Text>Sem número</Text>

        </View>

        <InputForm 
            label="Bairro"
            placeholder="Seu bairro"
            fontSizeLabel={17}
        />

        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
            }}
        >
            <InputForm 
                label="Cidade"
                placeholder="Sua cidade"
                fontSizeLabel={17}
                width={261}
            />
            <InputForm 
                label="UF"
                placeholder="UF"
                fontSizeLabel={17}
                width={81}
            />

        </View>

        <View
            style={{
                alignItems: "center",
                marginTop: 20,
            }}
        >
            <Button
                onPress={() => {}}
                text={"Continuar"}
            />
        </View>

      </View>
    </View>
  );
}
