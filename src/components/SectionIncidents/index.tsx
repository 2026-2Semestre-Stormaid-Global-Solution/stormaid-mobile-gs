
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

import CardIncident from "../CardIncident";
import type { IncidentResponseType } from "../../types/IncidentType";

type SectionIncidentsProps = {
  incidents?: IncidentResponseType[];
  loading?: boolean;
  error?: string | null;
  onCreate: () => void;
  onRetry?: () => void;
};

export default function SectionIncidents({
  incidents,
  loading = false,
  error = null,
  onCreate,
  onRetry,
}: SectionIncidentsProps) {
  const { colors } = useTheme();

  const recentIncidents = incidents?.slice(0, 3);

  return (
    <View
      style={{
        marginHorizontal: 18,
        marginTop: 37,
        gap: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.sora[700],
            color: colors.text,
            fontSize: 17,
          }}
        >
          Seus chamados
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Criar novo chamado"
          onPress={onCreate}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={19}
            color={colors.link}
          />

          <Text
            style={{
              fontFamily: FONTS.inter[600],
              color: colors.link,
              fontSize: 12,
            }}
          >
            Novo chamado
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 30,
            gap: 12,
          }}
        >
          <ActivityIndicator color={colors.primary} />

          <Text
            style={{
              fontFamily: FONTS.inter[400],
              color: colors.textSecondary,
              fontSize: 12,
            }}
          >
            Carregando chamados...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 15,
            padding: 20,
            alignItems: "center",
            gap: 10,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color={colors.messageError}
          />

          <Text
            style={{
              color: colors.messageError,
              fontFamily: FONTS.inter[500],
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {error}
          </Text>

          {onRetry ? (
            <Pressable
              onPress={onRetry}
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontFamily: FONTS.inter[600],
                  color: colors.link,
                  fontSize: 12,
                }}
              >
                Tentar novamente
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : recentIncidents && recentIncidents.length > 0 ? (
        recentIncidents.map((incident) => (
          <CardIncident
            key={incident.id}
            incident={incident}
          />
        ))
      ) : (
        <View
          style={{
            paddingVertical: 27,
            paddingHorizontal: 19,
            alignItems: "center",
            borderRadius: 17,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.inputBorder + "50",
          }}
        >
          <Ionicons
            name="document-text-outline"
            size={36}
            color={colors.textSecondary}
          />

          <Text
            style={{
              fontFamily: FONTS.inter[600],
              color: colors.text,
              fontSize: 14,
              marginTop: 12,
            }}
          >
            Histórico de chamados
          </Text>

          <Text
            style={{
              fontFamily: FONTS.inter[400],
              color: colors.textSecondary,
              fontSize: 12,
              lineHeight: 19,
              textAlign: "center",
              marginTop: 7,
            }}
          >
            {incidents
              ? "Você ainda não possui chamados registrados."
              : "Seu histórico aparecerá aqui após a integração com a API."}
          </Text>
        </View>
      )}
    </View>
  );
}
