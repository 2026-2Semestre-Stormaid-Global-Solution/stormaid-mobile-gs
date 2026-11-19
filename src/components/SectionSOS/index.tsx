
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

type SectionSOSProps = {
  onPress: () => void;
};

export default function SectionSOS({
  onPress,
}: SectionSOSProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        marginTop: 29,
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          fontFamily: FONTS.sora[700],
          fontSize: 19,
          color: colors.text,
          textAlign: "center",
        }}
      >
        Precisa de ajuda agora?
      </Text>

      <Text
        style={{
          fontFamily: FONTS.inter[400],
          fontSize: 12,
          color: colors.textSecondary,
          marginTop: 7,
          textAlign: "center",
        }}
      >
        Solicite ajuda à central reguladora.
      </Text>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Solicitar ajuda de emergência"
        accessibilityHint="Abre a confirmação da solicitação SOS"
        style={{
          width: 152,
          height: 152,
          borderRadius: 76,
          backgroundColor: colors.backgroundError,
          borderWidth: 3,
          borderColor: colors.messageError + "45",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 25,
        }}
      >
        <View
          style={{
            width: 126,
            height: 126,
            borderRadius: 63,
            backgroundColor: colors.messageError,
            alignItems: "center",
            justifyContent: "center",
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.sora[700],
              fontSize: 35,
              color: colors.onPrimary,
            }}
          >
            SOS
          </Text>

          <Text
            style={{
              fontFamily: FONTS.inter[700],
              fontSize: 10,
              color: colors.onPrimary,
              marginTop: 3,
            }}
          >
            EMERGÊNCIA
          </Text>
        </View>
      </Pressable>

      <Text
        style={{
          fontFamily: FONTS.inter[400],
          color: colors.textSecondary,
          textAlign: "center",
          fontSize: 11,
          marginTop: 17,
        }}
      >
        Toque para iniciar uma solicitação.
      </Text>
    </View>
  );
}
