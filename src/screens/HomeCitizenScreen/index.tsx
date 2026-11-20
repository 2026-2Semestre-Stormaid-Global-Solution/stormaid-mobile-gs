import { useState } from "react";
import LayoutWrapper from "../../components/LayoutWrapper";
import HeaderUser from "../../components/HeaderUser";
import CardWeatherAlert from "../../components/CardWeatherAlert";
import SectionSOS from "../../components/SectionSOS";
import SectionIncidents from "../../components/SectionIncidents";
import ModalConfirmSOS from "../../components/ModalConfirmSOS";
import ModalCreateIncident, {
  type IncidentFormData,
} from "../../components/ModalCreateIncident";
import { useAuth } from "../../context/AuthContext";
import { useWeatherSummary } from "../../hooks/useWeatherSummary";
import { useIncidents } from "../../hooks/useIncidents";
import { useCreateIncident } from "../../hooks/useCreateIncident";
import { useCreateSOS } from "../../hooks/useCreateSOS";

type HomeModal = "sos" | "incident" | null;

export default function HomeCitizenScreen() {
  const { token } = useAuth();

  const [activeModal, setActiveModal] = useState<HomeModal>(null);

  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
    loadWeather,
  } = useWeatherSummary();

  const {
    incidents,
    loading: incidentsLoading,
    error: incidentsError,
    refreshIncidents,
  } = useIncidents(token);

  const {
    submitIncident,
    loading: creatingIncident,
    error: createIncidentError,
    clearError: clearIncidentError,
  } = useCreateIncident(token);

  const {
    confirmSOS,
    loading: creatingSOS,
    error: createSOSError,
    clearError: clearSOSError,
  } = useCreateSOS(token);

  // Block submissions to the production API during development.
  const usingProductionApi = (process.env.EXPO_PUBLIC_API_URL ?? "").includes(
    "stormaid-java-gs.onrender.com",
  );

  const testEnvironmentEnabled =
    __DEV__ &&
    !usingProductionApi &&
    process.env.EXPO_PUBLIC_API_ENVIRONMENT === "test";

  const productionEnvironmentEnabled =
    !__DEV__ &&
    usingProductionApi &&
    process.env.EXPO_PUBLIC_API_ENVIRONMENT === "production";

  const demoEnvironmentEnabled =
    __DEV__ &&
    usingProductionApi &&
    process.env.EXPO_PUBLIC_API_ENVIRONMENT === "demo";

  const submissionEnvironmentEnabled =
    testEnvironmentEnabled ||
    demoEnvironmentEnabled ||
    productionEnvironmentEnabled;

  const incidentSubmissionEnabled =
    submissionEnvironmentEnabled &&
    process.env.EXPO_PUBLIC_ENABLE_INCIDENT_SUBMISSION === "true";

  const sosSubmissionEnabled =
    submissionEnvironmentEnabled &&
    process.env.EXPO_PUBLIC_ENABLE_SOS_SUBMISSION === "true";

  function closeModal() {
    if (creatingIncident || creatingSOS) {
      return;
    }

    clearIncidentError();
    clearSOSError();
    setActiveModal(null);
  }

  async function handleCreateIncident(
    formData: IncidentFormData,
  ): Promise<void> {
    if (!incidentSubmissionEnabled) {
      throw new Error("O envio de chamados ainda não está habilitado.");
    }

    await submitIncident(formData);

    setActiveModal(null);

    void refreshIncidents();
  }

  async function handleConfirmSOS(): Promise<void> {
    if (!sosSubmissionEnabled) {
      throw new Error("O envio SOS ainda não está habilitado.");
    }

    await confirmSOS();

    setActiveModal(null);

    void refreshIncidents();
  }

  return (
    <LayoutWrapper paddingBottom={80} paddingHorizontal={-1}>
      <HeaderUser />

      <CardWeatherAlert
        title={
          weather
            ? `${Math.round(weather.temperature)}°C · ${weather.condition}`
            : "Condições da sua região"
        }
        description={
          weatherError ??
          weather?.message ??
          "Toque para consultar o clima da sua região."
        }
        loading={weatherLoading}
        error={Boolean(weatherError)}
        onPress={loadWeather}
      />

      <SectionSOS onPress={() => setActiveModal("sos")} />

      <SectionIncidents
        incidents={incidents}
        loading={incidentsLoading}
        error={incidentsError}
        onCreate={() => setActiveModal("incident")}
        onRetry={() => {
          void refreshIncidents();
        }}
      />

      <ModalConfirmSOS
        visible={activeModal === "sos"}
        onClose={closeModal}
        onConfirm={sosSubmissionEnabled ? handleConfirmSOS : undefined}
        loading={creatingSOS}
        error={createSOSError}
      />

      <ModalCreateIncident
        visible={activeModal === "incident"}
        onClose={closeModal}
        onSubmit={incidentSubmissionEnabled ? handleCreateIncident : undefined}
        loading={creatingIncident}
        error={createIncidentError}
      />
    </LayoutWrapper>
  );
}
