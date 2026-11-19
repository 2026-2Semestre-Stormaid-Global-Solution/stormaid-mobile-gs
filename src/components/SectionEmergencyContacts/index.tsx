import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import type { EmergencyContactType } from "../../types/EmergencyContactType";
import CardEmergencyContact from "../CardEmergencyContact";

type SectionEmergencyContactsProps = {
  contact: EmergencyContactType | null;
  loading: boolean;
  error: string | null;
  onOpenModal: () => void;
  onRetry: () => void;
};

export default function SectionEmergencyContacts({
  contact,
  loading,
  error,
  onOpenModal,
  onRetry,
}: SectionEmergencyContactsProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            accessibilityRole="header"
            style={{ color: colors.text, fontFamily: FONTS.sora[700], fontSize: 17 }}
          >
            Seus contatos
          </Text>
          <Text style={{ color: colors.textSecondary, fontFamily: FONTS.inter[400], fontSize: 12 }}>
            {loading ? "Carregando..." : contact ? "1 contato cadastrado" : "Cadastre uma pessoa de confiança"}
          </Text>
        </View>
        {!loading && !error && !contact ? (
          <Pressable
            onPress={onOpenModal}
            accessibilityRole="button"
            accessibilityLabel="Adicionar contato de emergência"
            style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12 }}
          >
            <Ionicons name="add" size={17} color={colors.onPrimary} />
            <Text style={{ color: colors.onPrimary, fontFamily: FONTS.inter[600], fontSize: 12 }}>
              Novo contato
            </Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View style={{ alignItems: "center", gap: 12, paddingVertical: 42 }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontFamily: FONTS.inter[500], fontSize: 13 }}>
            Carregando contato...
          </Text>
        </View>
      ) : error ? (
        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 24, alignItems: "center", gap: 13, borderWidth: 1, borderColor: colors.inputBorder + "30" }}>
          <Ionicons name="alert-circle-outline" size={30} color={colors.messageError} />
          <Text accessibilityRole="alert" style={{ color: colors.messageError, textAlign: "center", fontFamily: FONTS.inter[500], fontSize: 13, lineHeight: 19 }}>
            {error}
          </Text>
          <Pressable onPress={onRetry} accessibilityRole="button" style={{ padding: 8 }}>
            <Text style={{ color: colors.primary, fontFamily: FONTS.inter[700] }}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : contact ? (
        <CardEmergencyContact contact={contact} onEdit={onOpenModal} />
      ) : (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.inputBorder + "30",
            paddingVertical: 32,
            paddingHorizontal: 24,
            alignItems: "center",
            gap: 11,
          }}
        >
          <View style={{ backgroundColor: colors.primary + "1B", width: 68, height: 68, borderRadius: 23, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="people-outline" size={32} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontFamily: FONTS.inter[700], fontSize: 15, marginTop: 5 }}>
            Nenhum contato cadastrado
          </Text>
          <Text style={{ color: colors.textSecondary, fontFamily: FONTS.inter[400], fontSize: 12, lineHeight: 19, textAlign: "center" }}>
            Adicione alguém de confiança para manter seus dados de emergência atualizados.
          </Text>
          <Pressable
            onPress={onOpenModal}
            accessibilityRole="button"
            accessibilityLabel="Cadastrar primeiro contato"
            style={{ marginTop: 8, paddingVertical: 13, paddingHorizontal: 22, borderRadius: 13, backgroundColor: colors.primary }}
          >
            <Text style={{ color: colors.onPrimary, fontFamily: FONTS.inter[700], fontSize: 13 }}>
              Cadastrar contato
            </Text>
          </Pressable>
        </View>
      )}

    </View>
  );
}
