import { Alert, Linking, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";
import { RELATIONSHIP_OPTIONS } from "../../data/relationshipOptionsData";
import type { EmergencyContactType } from "../../types/EmergencyContactType";

type CardEmergencyContactProps = {
  contact: EmergencyContactType;
  onEdit: () => void;
};

export default function CardEmergencyContact({ contact, onEdit }: CardEmergencyContactProps) {
  const { colors } = useTheme();
  const relationship = RELATIONSHIP_OPTIONS.find((item) => item.value === contact.relationship);
  const initials = (contact.name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  async function handleCall() {
    const digits = contact.phoneNumber?.replace(/\D/g, "") ?? "";
    if (!digits) return;

    try {
      await Linking.openURL(`tel:${digits}`);
    } catch {
      Alert.alert("Ligação indisponível", "Não foi possível abrir o discador.");
    }
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.inputBorder + "33",
        padding: 17,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 9,
        elevation: 2,
        gap: 15,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 53,
            height: 53,
            borderRadius: 18,
            backgroundColor: colors.primary + "1B",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.primary, fontFamily: FONTS.inter[700], fontSize: 19 }}>
            {initials || "?"}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: colors.text, fontFamily: FONTS.inter[700], fontSize: 15 }}>
            {contact.name}
          </Text>
          <Text style={{ color: colors.textSecondary, fontFamily: FONTS.inter[500], fontSize: 12 }}>
            {relationship?.label ?? contact.relationship ?? "Contato de emergência"}
          </Text>
        </View>

        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Editar contato de emergência"
          hitSlop={8}
          style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary + "1B", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="create-outline" color={colors.primary} size={19} />
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: colors.inputBorder + "25" }} />

      <Pressable
        onPress={() => { void handleCall(); }}
        accessibilityRole="button"
        accessibilityLabel={`Abrir discador para ${contact.name ?? "contato"}`}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9, flex: 1 }}>
          <Ionicons name="call-outline" size={17} color={colors.primary} />
          <Text style={{ color: colors.text, fontFamily: FONTS.inter[500], fontSize: 13 }}>
            {contact.phoneNumber}
          </Text>
        </View>
        <Ionicons name="arrow-forward" color={colors.primary} size={17} />
      </Pressable>
    </View>
  );
}
