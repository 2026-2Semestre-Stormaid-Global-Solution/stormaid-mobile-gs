
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

import type {
  EmergencyCategory,
  IncidentPublicStatus,
  IncidentResponseType,
} from "../../types/IncidentType";

type CardIncidentProps = {
  incident: IncidentResponseType;
};

const categoryLabels: Record<EmergencyCategory, string> = {
  POLICE_DANGER: "Risco policial",
  MEDICAL_EMERGENCY: "Emergência médica",
  FIRE_RESCUE: "Incêndio ou resgate",
  CLIMATE_DISASTER: "Desastre climático",
  UNKNOWN_EMERGENCY: "Outra emergência",
};

const statusLabels: Record<IncidentPublicStatus, string> = {
  RECEIVED: "Recebido",
  UNDER_REVIEW: "Em análise",
  AWAITING_DISPATCH: "Aguardando acionamento",
  DISPATCHED: "Equipe acionada",
  EN_ROUTE: "A caminho",
  ON_SITE: "No local",
  RESOLVED: "Resolvido",
  CANCELLED: "Cancelado",
  CLOSED_NO_DISPATCH: "Encerrado sem acionamento",
};

export default function CardIncident({
  incident,
}: CardIncidentProps) {
  const { colors } = useTheme();

  const isClosed =
    incident.publicStatus === "RESOLVED" ||
    incident.publicStatus === "CANCELLED" ||
    incident.publicStatus === "CLOSED_NO_DISPATCH";

  const isCancelled =
    incident.publicStatus === "CANCELLED" ||
    incident.publicStatus === "CLOSED_NO_DISPATCH";

  const statusColor = isCancelled
    ? colors.messageError
    : isClosed
      ? colors.textSecondary
      : colors.primary;

  const statusBackground = isCancelled
    ? colors.backgroundError
    : isClosed
      ? colors.background
      : colors.cardActive;

  const createdDate = new Date(incident.createdAt);

  const formattedDate = Number.isNaN(createdDate.getTime())
    ? "Data indisponível"
    : createdDate.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

  const category =
    categoryLabels[incident.emergencyCategory] ??
    "Emergência";

  const status =
    statusLabels[incident.publicStatus] ??
    "Status indisponível";

  const address = incident.location?.addressText?.trim();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.inputBorder + "45",
        padding: 15,
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.inter[500],
            color: colors.textSecondary,
            fontSize: 11,
          }}
        >
          Chamado #{incident.id}
        </Text>

        <View
          style={{
            backgroundColor: statusBackground,
            borderRadius: 20,
            paddingVertical: 6,
            paddingHorizontal: 10,
            flexShrink: 1,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.inter[600],
              color: statusColor,
              fontSize: 10,
              textAlign: "center",
            }}
          >
            {status}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 39,
            height: 39,
            borderRadius: 12,
            backgroundColor: colors.cardActive,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={
              incident.channelType === "SOS_SILENT"
                ? "alert-circle-outline"
                : "document-text-outline"
            }
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              fontFamily: FONTS.inter[700],
              color: colors.text,
              fontSize: 13,
            }}
          >
            {category}
          </Text>

          <Text
            style={{
              fontFamily: FONTS.inter[400],
              color: colors.textSecondary,
              fontSize: 11,
            }}
          >
            {formattedDate}
          </Text>
        </View>
      </View>

      {address ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 7,
          }}
        >
          <Ionicons
            name="location-outline"
            size={15}
            color={colors.textSecondary}
          />

          <Text
            style={{
              flex: 1,
              fontFamily: FONTS.inter[400],
              color: colors.textSecondary,
              fontSize: 11,
              lineHeight: 17,
            }}
          >
            {address}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
