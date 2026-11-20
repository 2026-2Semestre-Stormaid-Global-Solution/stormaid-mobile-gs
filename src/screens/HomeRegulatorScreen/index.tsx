import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import LayoutWrapper from "../../components/LayoutWrapper";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FONTS } from "../../styles/style";

const DOTNET_URL = (
  process.env.EXPO_PUBLIC_DOTNET_API_URL ||
  "https://stormaid-dotnet-gs.onrender.com"
).replace(/\/$/, "");

const STATUS = [
  "PENDING_REVIEW",
  "UNDER_REVIEW",
  "AWAITING_DISPATCH",
  "DISPATCHED",
  "CLOSED",
] as const;

type RegulationStatus = (typeof STATUS)[number];
type FilterStatus = RegulationStatus | "ALL";
type DecisionType =
  | "DISPATCH_APPROVED"
  | "NO_DISPATCH_REQUIRED"
  | "MORE_INFORMATION_REQUIRED";
type InstitutionType =
  | "FIRE_DEPARTMENT"
  | "EMERGENCY_MEDICAL_SERVICE"
  | "MILITARY_POLICE"
  | "CIVIL_DEFENSE";

type IncidentItem = {
  id: number;
  javaIncidentId: number;
  recipientType: string;
  channelType: string;
  emergencyCategory: string;
  regulationStatus: RegulationStatus;
  location: {
    latitude: number | null;
    longitude: number | null;
    addressText: string | null;
  };
  receivedAt: string;
};

type IncidentDetail = Omit<IncidentItem, "location"> & {
  requesterUserId: number;
  latitude: number | null;
  longitude: number | null;
  addressText: string | null;
  publicStatusVersion: number;
  javaCreatedAt: string | null;
  updatedAt: string;
};

type IncidentPage = {
  content: IncidentItem[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

type RescueUnit = {
  id: number;
  unitCode: string;
  displayName: string;
  institutionType: InstitutionType;
  operationalStatus: string;
  active: boolean;
  capacity: number;
  supportsAccessibleTransport: boolean;
};

type UnitPage = {
  items: RescueUnit[];
  totalPages: number;
};

type DispatchResponse = {
  id: number;
  status: string;
};

type ApiProblem = {
  title?: string;
  detail?: string;
  message?: string;
};

const STATUS_NAMES: Record<RegulationStatus, string> = {
  PENDING_REVIEW: "Pendente",
  UNDER_REVIEW: "Em análise",
  AWAITING_DISPATCH: "Aguardando despacho",
  DISPATCHED: "Despachado",
  CLOSED: "Encerrado",
};

const CATEGORY_NAMES: Record<string, string> = {
  POLICE_DANGER: "Risco policial",
  MEDICAL_EMERGENCY: "Emergência médica",
  FIRE_RESCUE: "Incêndio ou resgate",
  CLIMATE_DISASTER: "Desastre climático",
  UNKNOWN_EMERGENCY: "Emergência não especificada",
};

const INSTITUTIONS: { key: InstitutionType; name: string }[] = [
  { key: "FIRE_DEPARTMENT", name: "Bombeiros" },
  { key: "EMERGENCY_MEDICAL_SERVICE", name: "SAMU / Emergência médica" },
  { key: "MILITARY_POLICE", name: "Polícia Militar" },
  { key: "CIVIL_DEFENSE", name: "Defesa Civil" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "Não informado";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Não informado"
    : date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function formatCoordinate(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(6)
    : "Não informada";
}

async function regulationRequest<T>(
  token: string | null,
  path: string,
  method: "GET" | "POST" = "GET",
  body?: object,
): Promise<T> {
  if (!token) {
    throw new Error("Sessão não encontrada. Entre novamente.");
  }

  let response: Response;
  try {
    response = await fetch(`${DOTNET_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API .NET. Verifique a conexão.",
    );
  }

  if (!response.ok) {
    const problem = (await response
      .json()
      .catch(() => null)) as ApiProblem | null;

    if (response.status === 401)
      throw new Error("Sessão expirada. Entre novamente.");
    if (response.status === 403)
      throw new Error("Seu usuário não tem autorização de regulador.");
    if (response.status === 404)
      throw new Error("Registro não encontrado na API .NET.");
    if (response.status === 409) {
      throw new Error(
        problem?.detail ||
          "O chamado foi alterado. Atualize antes de continuar.",
      );
    }
    if (response.status === 429) {
      throw new Error(
        "Limite de solicitações atingido. Aguarde e tente novamente.",
      );
    }
    if (response.status >= 500) {
      throw new Error(
        "A API .NET está indisponível. Confira o serviço no Render.",
      );
    }
    throw new Error(
      problem?.detail ||
        problem?.title ||
        problem?.message ||
        `Erro HTTP ${response.status}.`,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export default function HomeRegulatorScreen() {
  const { token, role, signOut } = useAuth();
  const { colors, isDark } = useTheme();
  const requestId = useRef(0);

  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [decision, setDecision] = useState<DecisionType | null>(null);
  const [justification, setJustification] = useState("");
  const [institution, setInstitution] = useState<InstitutionType | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [units, setUnits] = useState<RescueUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsError, setUnitsError] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [dispatchNotes, setDispatchNotes] = useState("");

  const baseText = {
    color: colors.text,
    fontFamily: FONTS.inter[500],
  } as const;
  const secondaryText = {
    color: colors.textSecondary,
    fontFamily: FONTS.inter[400],
  } as const;

  async function loadIncidents(
    pageNumber = 0,
    append = false,
    showRefreshing = false,
  ) {
    const id = ++requestId.current;
    if (append) setLoadingMore(true);
    else if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setListError(null);

    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        size: "10",
      });
      if (filter !== "ALL") params.set("status", filter);
      const result = await regulationRequest<IncidentPage>(
        token,
        `/api/v1/regulation/incidents?${params.toString()}`,
      );
      if (!Array.isArray(result.content) || !result.page) {
        throw new Error("A API .NET retornou uma listagem inválida.");
      }
      if (id !== requestId.current) return;
      setIncidents((previous) =>
        append
          ? [
              ...previous,
              ...result.content.filter(
                (item) =>
                  !previous.some(
                    (existing) =>
                      existing.javaIncidentId === item.javaIncidentId,
                  ),
              ),
            ]
          : result.content,
      );
      setCurrentPage(result.page.number);
      setTotalPages(result.page.totalPages);
      setTotalItems(result.page.totalElements);
    } catch (error) {
      if (id === requestId.current) {
        setListError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os chamados.",
        );
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void loadIncidents();
    return () => {
      requestId.current += 1;
    };
  }, [filter, token]);

  async function loadDetails(javaIncidentId: number) {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const result = await regulationRequest<IncidentDetail>(
        token,
        `/api/v1/regulation/incidents/${javaIncidentId}`,
      );
      setDetail(result);
      if (result.regulationStatus === "AWAITING_DISPATCH") {
        void loadUnits();
      }
    } catch (error) {
      setDetailError(
        error instanceof Error
          ? error.message
          : "Falha ao consultar o chamado.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function openIncident(item: IncidentItem) {
    setSelectedId(item.javaIncidentId);
    setDetail(null);
    setDecision(null);
    setJustification("");
    setInstitution(null);
    setActionError(null);
    setActionMessage(null);
    setSelectedUnitId(null);
    setDispatchNotes("");
    setUnits([]);
    setModalVisible(true);
    void loadDetails(item.javaIncidentId);
  }

  async function refreshAfterAction(javaIncidentId: number) {
    await Promise.all([loadDetails(javaIncidentId), loadIncidents(0)]);
  }

  async function beginReview() {
    if (!selectedId || processing) return;
    setProcessing(true);
    setActionError(null);
    try {
      await regulationRequest(
        token,
        `/api/v1/regulation/incidents/${selectedId}/review`,
        "POST",
      );
      setActionMessage("Análise iniciada com sucesso.");
      await refreshAfterAction(selectedId);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a análise.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function confirmDecision() {
    if (!selectedId || !decision || processing) return;
    const cleanJustification = justification.trim();
    if (cleanJustification.length < 10 || cleanJustification.length > 1000) {
      setActionError(
        "A justificativa deve conter entre 10 e 1.000 caracteres.",
      );
      return;
    }
    if (decision === "DISPATCH_APPROVED" && !institution) {
      setActionError("Selecione a instituição que realizará o atendimento.");
      return;
    }

    setProcessing(true);
    setActionError(null);
    try {
      await regulationRequest(
        token,
        `/api/v1/regulation/incidents/${selectedId}/decisions`,
        "POST",
        {
          decisionType: decision,
          institutionType:
            decision === "DISPATCH_APPROVED" ? institution : null,
          justification: cleanJustification,
        },
      );
      setActionMessage(
        decision === "DISPATCH_APPROVED"
          ? "Despacho aprovado. Agora selecione uma unidade de resgate."
          : decision === "NO_DISPATCH_REQUIRED"
            ? "Ocorrência encerrada sem despacho."
            : "Solicitação de informações registrada.",
      );
      setDecision(null);
      setJustification("");
      await refreshAfterAction(selectedId);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a decisão.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function loadUnits() {
    setUnitsLoading(true);
    setUnitsError(null);
    try {
      const result = await regulationRequest<UnitPage>(
        token,
        "/api/v1/rescue-units?page=1&pageSize=100",
      );
      if (!Array.isArray(result.items)) {
        throw new Error("A API retornou uma lista de unidades inválida.");
      }
      setUnits(
        result.items.filter(
          (unit) => unit.active && unit.operationalStatus === "AVAILABLE",
        ),
      );
    } catch (error) {
      setUnitsError(
        error instanceof Error
          ? error.message
          : "Falha ao carregar as unidades.",
      );
    } finally {
      setUnitsLoading(false);
    }
  }

  async function createDispatch() {
    if (!selectedId || !selectedUnitId || processing) {
      setActionError("Escolha uma unidade de resgate disponível.");
      return;
    }
    setProcessing(true);
    setActionError(null);
    try {
      const result = await regulationRequest<DispatchResponse>(
        token,
        "/api/v1/dispatches",
        "POST",
        {
          javaIncidentId: selectedId,
          rescueUnitId: selectedUnitId,
          notes: dispatchNotes.trim() || null,
        },
      );
      setActionMessage(`Despacho #${result.id} criado com sucesso.`);
      setSelectedUnitId(null);
      await refreshAfterAction(selectedId);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o despacho.",
      );
    } finally {
      setProcessing(false);
    }
  }

  function openLocation(latitude: number | null, longitude: number | null) {
    if (latitude === null || longitude === null) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude}%2C${longitude}`;
    void Linking.openURL(url).catch(() => {
      Alert.alert("Localização", "Não foi possível abrir o mapa.");
    });
  }

  if (role !== "REGULATOR") {
    return (
      <LayoutWrapper>
        <Text style={{ color: colors.messageError, paddingTop: 30 }}>
          Acesso restrito ao perfil REGULATOR.
        </Text>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper paddingHorizontal={0} paddingBottom={30}>
      <PageHeader
        title="Central de regulação"
        subtitle="Analise ocorrências, tome decisões e coordene o atendimento."
        icon="shield-checkmark-outline"
      />

      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 19 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{ ...baseText, fontFamily: FONTS.sora[700], fontSize: 18 }}
            >
              Fila de chamados
            </Text>
            <Text style={{ ...secondaryText, fontSize: 12 }}>
              {totalItems} ocorrência(s) no filtro selecionado
            </Text>
          </View>
          <Pressable
            onPress={() => void loadIncidents(0, false, true)}
            accessibilityRole="button"
            accessibilityLabel="Atualizar fila de chamados"
            style={{
              backgroundColor: colors.cardActive,
              padding: 11,
              borderRadius: 13,
            }}
          >
            <Ionicons name="refresh-outline" size={21} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert("Sair", "Deseja encerrar sua sessão?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", onPress: () => void signOut() },
              ])
            }
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            style={{
              marginLeft: 9,
              padding: 11,
              borderRadius: 13,
              backgroundColor: colors.surface,
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {(["ALL", ...STATUS] as FilterStatus[]).map((value) => (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === value }}
              style={{
                backgroundColor:
                  filter === value ? colors.primary : colors.surface,
                borderColor:
                  filter === value ? colors.primary : colors.inputBorder + "45",
                borderWidth: 1,
                paddingHorizontal: 13,
                paddingVertical: 10,
                borderRadius: 13,
              }}
            >
              <Text
                style={{
                  color:
                    filter === value ? colors.onPrimary : colors.textSecondary,
                  fontFamily: FONTS.inter[600],
                  fontSize: 12,
                }}
              >
                {value === "ALL" ? "Todos" : STATUS_NAMES[value]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <View style={{ paddingVertical: 55, alignItems: "center", gap: 12 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ ...secondaryText, fontSize: 13 }}>
              Carregando ocorrências...
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {listError ? (
              <View
                style={{
                  backgroundColor: colors.backgroundError,
                  padding: 16,
                  borderRadius: 15,
                  gap: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.messageError,
                    fontFamily: FONTS.inter[500],
                  }}
                >
                  {listError}
                </Text>
                <Pressable
                  onPress={() => void loadIncidents()}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: FONTS.inter[700],
                    }}
                  >
                    Tentar novamente
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {!listError && incidents.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 19,
                  padding: 35,
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={39}
                  color={colors.primary}
                />
                <Text
                  style={{
                    ...baseText,
                    fontFamily: FONTS.inter[700],
                    fontSize: 15,
                  }}
                >
                  Nenhum chamado neste filtro
                </Text>
                <Text
                  style={{
                    ...secondaryText,
                    textAlign: "center",
                    fontSize: 12,
                    lineHeight: 19,
                  }}
                >
                  A fila é alimentada pelos eventos de incidentes recebidos do
                  Java pela API .NET.
                </Text>
              </View>
            ) : null}

            {incidents.map((item) => (
              <Pressable
                key={item.javaIncidentId}
                onPress={() => openIncident(item)}
                accessibilityRole="button"
                accessibilityLabel={`Ver chamado ${item.javaIncidentId}`}
                style={{
                  borderWidth: 1,
                  borderColor: colors.inputBorder + "33",
                  backgroundColor: colors.surface,
                  borderRadius: 17,
                  padding: 17,
                  gap: 13,
                  shadowColor: "#000000",
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  elevation: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 9,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ ...secondaryText, fontSize: 11 }}>
                    Chamado #{item.javaIncidentId}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.cardActive,
                      paddingVertical: 5,
                      paddingHorizontal: 9,
                      borderRadius: 15,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontFamily: FONTS.inter[700],
                        fontSize: 10,
                      }}
                    >
                      {STATUS_NAMES[item.regulationStatus]}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 11,
                  }}
                >
                  <View
                    style={{
                      width: 43,
                      height: 43,
                      borderRadius: 14,
                      backgroundColor: colors.primary + "19",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={
                        item.channelType === "SOS_SILENT"
                          ? "alert-circle-outline"
                          : "document-text-outline"
                      }
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text
                      style={{
                        ...baseText,
                        fontFamily: FONTS.inter[700],
                        fontSize: 14,
                      }}
                    >
                      {CATEGORY_NAMES[item.emergencyCategory] ||
                        item.emergencyCategory}
                    </Text>
                    <Text style={{ ...secondaryText, fontSize: 11 }}>
                      {formatDate(item.receivedAt)} ·{" "}
                      {item.channelType === "SOS_SILENT" ? "SOS" : "Chamado"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={19}
                    color={colors.primary}
                  />
                </View>
                {item.location.addressText ? (
                  <Text
                    numberOfLines={2}
                    style={{ ...secondaryText, fontSize: 12 }}
                  >
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={colors.primary}
                    />{" "}
                    {item.location.addressText}
                  </Text>
                ) : null}
              </Pressable>
            ))}

            {currentPage + 1 < totalPages ? (
              <Pressable
                disabled={loadingMore}
                onPress={() => void loadIncidents(currentPage + 1, true)}
                accessibilityRole="button"
                style={{
                  borderWidth: 1,
                  borderColor: colors.primary,
                  borderRadius: 14,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                {loadingMore ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: FONTS.inter[700],
                    }}
                  >
                    Carregar mais chamados
                  </Text>
                )}
              </Pressable>
            ) : null}
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => {
          if (!processing) setModalVisible(false);
        }}
      >
        <SafeAreaView
          edges={["top", "bottom"]}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <StatusBar style={isDark ? "light" : "dark"} />
          <View
            style={{
              backgroundColor: colors.primary,
              padding: 20,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Pressable
              disabled={processing}
              onPress={() => setModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Voltar para a fila"
            >
              <Ionicons name="arrow-back" size={25} color={colors.onPrimary} />
            </Pressable>
            <View style={{ flex: 1, gap: 3 }}>
              <Text
                style={{
                  color: colors.onPrimary,
                  fontFamily: FONTS.sora[700],
                  fontSize: 18,
                }}
              >
                Chamado #{selectedId}
              </Text>
              <Text
                style={{
                  color: colors.onPrimary,
                  opacity: 0.8,
                  fontFamily: FONTS.inter[400],
                  fontSize: 11,
                }}
              >
                Análise institucional
              </Text>
            </View>
            <Pressable
              disabled={processing}
              onPress={() => {
                if (selectedId) void loadDetails(selectedId);
              }}
              accessibilityRole="button"
            >
              <Ionicons
                name="refresh-outline"
                size={22}
                color={colors.onPrimary}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, paddingBottom: 45, gap: 17 }}
          >
            {detailLoading ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : null}
            {detailError ? (
              <View
                style={{
                  backgroundColor: colors.backgroundError,
                  padding: 15,
                  borderRadius: 14,
                }}
              >
                <Text style={{ color: colors.messageError }}>
                  {detailError}
                </Text>
              </View>
            ) : null}
            {detail && !detailLoading ? (
              <>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 18,
                    padding: 19,
                    gap: 13,
                    borderWidth: 1,
                    borderColor: colors.inputBorder + "32",
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: FONTS.inter[700],
                      fontSize: 12,
                    }}
                  >
                    {STATUS_NAMES[detail.regulationStatus]}
                  </Text>
                  <Text
                    style={{
                      ...baseText,
                      fontFamily: FONTS.sora[700],
                      fontSize: 17,
                    }}
                  >
                    {CATEGORY_NAMES[detail.emergencyCategory] ||
                      detail.emergencyCategory}
                  </Text>
                  {(
                    [
                      [
                        "Solicitação",
                        detail.channelType === "SOS_SILENT"
                          ? "SOS silencioso"
                          : detail.channelType,
                      ],
                      ["Destinatário", detail.recipientType],
                      ["Usuário solicitante", `#${detail.requesterUserId}`],
                      ["Recebido em", formatDate(detail.receivedAt)],
                      ["Criado no Java", formatDate(detail.javaCreatedAt)],
                      ["Última atualização", formatDate(detail.updatedAt)],
                      ["Versão do status", String(detail.publicStatusVersion)],
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <View
                      key={label}
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ ...secondaryText, fontSize: 12 }}>
                        {label}
                      </Text>
                      <Text
                        style={{
                          ...baseText,
                          fontSize: 12,
                          flex: 1,
                          textAlign: "right",
                        }}
                      >
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 18,
                    padding: 19,
                    gap: 12,
                    borderWidth: 1,
                    borderColor: colors.inputBorder + "32",
                  }}
                >
                  <Text
                    style={{
                      ...baseText,
                      fontFamily: FONTS.sora[700],
                      fontSize: 15,
                    }}
                  >
                    Localização
                  </Text>
                  <Text style={{ ...secondaryText, fontSize: 12 }}>
                    {detail.addressText || "Endereço não informado"}
                  </Text>
                  <Text style={{ ...secondaryText, fontSize: 12 }}>
                    Latitude: {formatCoordinate(detail.latitude)}
                  </Text>
                  <Text style={{ ...secondaryText, fontSize: 12 }}>
                    Longitude: {formatCoordinate(detail.longitude)}
                  </Text>
                  {detail.latitude !== null && detail.longitude !== null ? (
                    <Pressable
                      onPress={() =>
                        openLocation(detail.latitude, detail.longitude)
                      }
                      accessibilityRole="button"
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="map-outline"
                        size={19}
                        color={colors.primary}
                      />
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: FONTS.inter[700],
                          fontSize: 12,
                        }}
                      >
                        Abrir localização no mapa
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                <View
                  style={{
                    backgroundColor: colors.cardActive,
                    padding: 15,
                    borderRadius: 14,
                  }}
                >
                  <Text style={{ ...baseText, fontSize: 12, lineHeight: 19 }}>
                    A API .NET retorna a referência operacional. O relato
                    textual completo não faz parte deste contrato de consulta.
                  </Text>
                </View>

                {actionMessage ? (
                  <View
                    style={{
                      backgroundColor: colors.cardActive,
                      padding: 15,
                      borderRadius: 14,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontFamily: FONTS.inter[600],
                        fontSize: 12,
                      }}
                    >
                      {actionMessage}
                    </Text>
                  </View>
                ) : null}
                {actionError ? (
                  <View
                    style={{
                      backgroundColor: colors.backgroundError,
                      padding: 15,
                      borderRadius: 14,
                    }}
                  >
                    <Text
                      accessibilityRole="alert"
                      style={{
                        color: colors.messageError,
                        fontFamily: FONTS.inter[500],
                        fontSize: 12,
                      }}
                    >
                      {actionError}
                    </Text>
                  </View>
                ) : null}

                {detail.regulationStatus === "PENDING_REVIEW" ? (
                  <Pressable
                    disabled={processing}
                    onPress={() => void beginReview()}
                    accessibilityRole="button"
                    style={{
                      backgroundColor: colors.primary,
                      padding: 16,
                      borderRadius: 14,
                      alignItems: "center",
                    }}
                  >
                    {processing ? (
                      <ActivityIndicator color={colors.onPrimary} />
                    ) : (
                      <Text
                        style={{
                          color: colors.onPrimary,
                          fontFamily: FONTS.inter[700],
                          fontSize: 14,
                        }}
                      >
                        Iniciar análise
                      </Text>
                    )}
                  </Pressable>
                ) : null}

                {detail.regulationStatus === "UNDER_REVIEW" ? (
                  <View style={{ gap: 12 }}>
                    <Text
                      style={{
                        ...baseText,
                        fontFamily: FONTS.sora[700],
                        fontSize: 16,
                      }}
                    >
                      Decisão do regulador
                    </Text>
                    <Pressable
                      onPress={() => {
                        setDecision("DISPATCH_APPROVED");
                        setActionError(null);
                      }}
                      disabled={processing}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 9,
                        padding: 14,
                        borderRadius: 13,
                        backgroundColor: colors.cardActive,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={{ ...baseText, fontSize: 13 }}>
                        Aprovar despacho
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setDecision("NO_DISPATCH_REQUIRED");
                        setInstitution(null);
                        setActionError(null);
                      }}
                      disabled={processing}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 9,
                        padding: 14,
                        borderRadius: 13,
                        backgroundColor: colors.surface,
                      }}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color={colors.messageError}
                      />
                      <Text style={{ ...baseText, fontSize: 13 }}>
                        Encerrar sem despacho
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setDecision("MORE_INFORMATION_REQUIRED");
                        setInstitution(null);
                        setActionError(null);
                      }}
                      disabled={processing}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 9,
                        padding: 14,
                        borderRadius: 13,
                        backgroundColor: colors.surface,
                      }}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={{ ...baseText, fontSize: 13 }}>
                        Solicitar mais informações
                      </Text>
                    </Pressable>

                    {decision ? (
                      <View
                        style={{
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.inputBorder + "40",
                          borderRadius: 17,
                          padding: 16,
                          gap: 13,
                        }}
                      >
                        <Text
                          style={{
                            ...baseText,
                            fontFamily: FONTS.inter[700],
                            fontSize: 14,
                          }}
                        >
                          {decision === "DISPATCH_APPROVED"
                            ? "Confirmar aprovação"
                            : decision === "NO_DISPATCH_REQUIRED"
                              ? "Confirmar encerramento"
                              : "Solicitar informações"}
                        </Text>
                        {decision === "DISPATCH_APPROVED" ? (
                          <View style={{ gap: 9 }}>
                            <Text style={{ ...secondaryText, fontSize: 12 }}>
                              Instituição responsável *
                            </Text>
                            {INSTITUTIONS.map((option) => (
                              <Pressable
                                key={option.key}
                                onPress={() => setInstitution(option.key)}
                                disabled={processing}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: 11,
                                  borderRadius: 10,
                                  backgroundColor:
                                    institution === option.key
                                      ? colors.cardActive
                                      : colors.background,
                                }}
                              >
                                <Ionicons
                                  name={
                                    institution === option.key
                                      ? "radio-button-on"
                                      : "radio-button-off"
                                  }
                                  size={19}
                                  color={colors.primary}
                                />
                                <Text style={{ ...baseText, fontSize: 12 }}>
                                  {option.name}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
                        <Text style={{ ...secondaryText, fontSize: 12 }}>
                          Justificativa obrigatória (10 a 1.000 caracteres)
                        </Text>
                        <TextInput
                          value={justification}
                          onChangeText={(text) => {
                            setJustification(text);
                            setActionError(null);
                          }}
                          placeholder="Descreva o motivo da decisão..."
                          placeholderTextColor={colors.placeholder}
                          multiline
                          maxLength={1000}
                          editable={!processing}
                          textAlignVertical="top"
                          style={{
                            minHeight: 105,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.inputBorder,
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            fontFamily: FONTS.inter[400],
                            fontSize: 13,
                            padding: 12,
                          }}
                        />
                        <Text
                          style={{
                            ...secondaryText,
                            fontSize: 11,
                            textAlign: "right",
                          }}
                        >
                          {justification.trim().length}/1000
                        </Text>
                        <View style={{ flexDirection: "row", gap: 9 }}>
                          <Pressable
                            onPress={() => {
                              setDecision(null);
                              setActionError(null);
                            }}
                            disabled={processing}
                            style={{
                              flex: 1,
                              padding: 13,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: colors.inputBorder,
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                ...baseText,
                                fontFamily: FONTS.inter[700],
                                fontSize: 12,
                              }}
                            >
                              Cancelar
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => void confirmDecision()}
                            disabled={processing}
                            style={{
                              flex: 1,
                              padding: 13,
                              borderRadius: 12,
                              backgroundColor: colors.primary,
                              alignItems: "center",
                            }}
                          >
                            {processing ? (
                              <ActivityIndicator color={colors.onPrimary} />
                            ) : (
                              <Text
                                style={{
                                  color: colors.onPrimary,
                                  fontFamily: FONTS.inter[700],
                                  fontSize: 12,
                                }}
                              >
                                Confirmar decisão
                              </Text>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {detail.regulationStatus === "AWAITING_DISPATCH" ? (
                  <View style={{ gap: 13 }}>
                    <Text
                      style={{
                        ...baseText,
                        fontFamily: FONTS.sora[700],
                        fontSize: 16,
                      }}
                    >
                      Criar despacho
                    </Text>
                    <Text
                      style={{ ...secondaryText, fontSize: 12, lineHeight: 19 }}
                    >
                      Escolha uma unidade disponível da instituição aprovada. A
                      API validará a compatibilidade.
                    </Text>
                    {unitsLoading ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : null}
                    {unitsError ? (
                      <Text
                        style={{ color: colors.messageError, fontSize: 12 }}
                      >
                        {unitsError}
                      </Text>
                    ) : null}
                    {!unitsLoading && units.length === 0 ? (
                      <Text style={{ ...secondaryText, fontSize: 12 }}>
                        Nenhuma unidade disponível foi encontrada.
                      </Text>
                    ) : null}
                    {units.map((unit) => (
                      <Pressable
                        key={unit.id}
                        onPress={() => setSelectedUnitId(unit.id)}
                        style={{
                          flexDirection: "row",
                          gap: 9,
                          padding: 13,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor:
                            selectedUnitId === unit.id
                              ? colors.primary
                              : colors.inputBorder + "40",
                          backgroundColor: colors.surface,
                        }}
                      >
                        <Ionicons
                          name={
                            selectedUnitId === unit.id
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={19}
                          color={colors.primary}
                        />
                        <View style={{ flex: 1, gap: 3 }}>
                          <Text
                            style={{
                              ...baseText,
                              fontFamily: FONTS.inter[700],
                              fontSize: 12,
                            }}
                          >
                            {unit.displayName} · {unit.unitCode}
                          </Text>
                          <Text style={{ ...secondaryText, fontSize: 11 }}>
                            {INSTITUTIONS.find(
                              (item) => item.key === unit.institutionType,
                            )?.name || unit.institutionType}{" "}
                            · Capacidade: {unit.capacity}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => void loadUnits()}
                      accessibilityRole="button"
                      style={{ alignSelf: "flex-start", paddingVertical: 8 }}
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: FONTS.inter[600],
                          fontSize: 12,
                        }}
                      >
                        Atualizar unidades
                      </Text>
                    </Pressable>
                    <TextInput
                      value={dispatchNotes}
                      onChangeText={setDispatchNotes}
                      placeholder="Observações para o despacho (opcional)"
                      placeholderTextColor={colors.placeholder}
                      multiline
                      editable={!processing}
                      style={{
                        minHeight: 78,
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: 12,
                        color: colors.text,
                        fontSize: 13,
                        textAlignVertical: "top",
                      }}
                    />
                    <Pressable
                      onPress={() => void createDispatch()}
                      disabled={processing || !selectedUnitId}
                      style={{
                        backgroundColor:
                          processing || !selectedUnitId
                            ? colors.buttonDisabled
                            : colors.primary,
                        padding: 15,
                        borderRadius: 13,
                        alignItems: "center",
                      }}
                    >
                      {processing ? (
                        <ActivityIndicator color={colors.onPrimary} />
                      ) : (
                        <Text
                          style={{
                            color:
                              processing || !selectedUnitId
                                ? colors.textSecondary
                                : colors.onPrimary,
                            fontFamily: FONTS.inter[700],
                            fontSize: 13,
                          }}
                        >
                          Confirmar despacho
                        </Text>
                      )}
                    </Pressable>
                  </View>
                ) : null}

                {detail.regulationStatus === "DISPATCHED" ||
                detail.regulationStatus === "CLOSED" ? (
                  <View
                    style={{
                      backgroundColor: colors.cardActive,
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <Text style={{ ...baseText, fontSize: 12, lineHeight: 19 }}>
                      {detail.regulationStatus === "DISPATCHED"
                        ? "O despacho foi criado. O acompanhamento operacional é realizado pela equipe de resgate."
                        : "Esta ocorrência já foi encerrada na regulação."}
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </LayoutWrapper>
  );
}
