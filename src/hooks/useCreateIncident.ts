import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import * as Crypto from "expo-crypto";
import {
  createIncident,
  type IncidentCreateRequestType,
} from "../services/incidentService";
import type { IncidentFormData } from "../components/ModalCreateIncident";
import type { IncidentResponseType } from "../types/IncidentType";

type PendingIncidentRequest = {
  sessionToken: string;
  formData: IncidentFormData;
  payload: IncidentCreateRequestType;
  idempotencyKey: string;
};

export function useCreateIncident(token?: string | null) {
  const sessionToken = token?.trim() || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const pendingRequestRef = useRef<PendingIncidentRequest | null>(null);
  const currentSessionRef = useRef(sessionToken);
  currentSessionRef.current = sessionToken;

  useEffect(() => {
    pendingRequestRef.current = null;
    setError(null);
  }, [sessionToken]);

  const submitIncident = useCallback(
    async (formData: IncidentFormData): Promise<IncidentResponseType> => {
      if (inFlightRef.current) {
        throw new Error("Já existe uma solicitação em andamento.");
      }

      inFlightRef.current = true;
      setLoading(true);
      setError(null);

      try {
        if (!sessionToken) {
          throw new Error("Sessão não encontrada. Faça login novamente.");
        }

        const emergencyCategory = formData.emergencyCategory;
        const textDescription = formData.textDescription.trim();

        if (!emergencyCategory) {
          throw new Error("Selecione o tipo de emergência.");
        }

        if (!textDescription) {
          throw new Error("Informe a descrição da emergência.");
        }

        let pendingRequest = pendingRequestRef.current;

        if (pendingRequest) {
          const sameForm =
            pendingRequest.sessionToken === sessionToken &&
            pendingRequest.formData.emergencyCategory === emergencyCategory &&
            pendingRequest.formData.textDescription === textDescription;

          if (!sameForm) {
            throw new Error(
              "Existe uma tentativa de envio sem confirmação. " +
                "Verifique o histórico antes de alterar os dados " +
                "ou iniciar outro chamado.",
            );
          }
        }

        if (!pendingRequest) {
          const permission = await Location.requestForegroundPermissionsAsync();

          if (!permission.granted) {
            throw new Error(
              "Permita o acesso à localização para enviar o chamado.",
            );
          }

          const gpsEnabled = await Location.hasServicesEnabledAsync();

          if (!gpsEnabled) {
            throw new Error(
              "O GPS está desativado. Ative a localização do dispositivo.",
            );
          }

          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const { latitude, longitude, accuracy } = position.coords;

          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
          ) {
            throw new Error("Não foi possível obter coordenadas válidas.");
          }

          const locationCapturedAt = new Date(position.timestamp).toISOString();

          const payload: IncidentCreateRequestType = {
            recipientType: "SELF",
            requesterOnSite: true,
            channelType: "TEXT_INPUT",
            emergencyCategory,
            textDescription,
            location: {
              source: "CURRENT_LOCATION",
              latitude,
              longitude,
              accuracyMeters:
                accuracy !== null && Number.isFinite(accuracy) && accuracy >= 0
                  ? accuracy
                  : null,
              locationCapturedAt,
            },
          };

          pendingRequest = {
            sessionToken,
            formData: {
              emergencyCategory,
              textDescription,
            },
            payload,
            idempotencyKey: Crypto.randomUUID(),
          };

          pendingRequestRef.current = pendingRequest;
        }

        if (currentSessionRef.current !== sessionToken) {
          throw new Error("A sessão foi alterada. Faça login novamente.");
        }

        const createdIncident = await createIncident(
          sessionToken,
          pendingRequest.payload,
          pendingRequest.idempotencyKey,
        );

        if (currentSessionRef.current !== sessionToken) {
          throw new Error("A sessão foi alterada durante o envio.");
        }

        pendingRequestRef.current = null;

        return createdIncident;
      } catch (exception) {
        let message =
          exception instanceof Error
            ? exception.message
            : "Não foi possível enviar o chamado.";

        if (
          /current location is unavailable|location is unavailable/i.test(
            message,
          )
        ) {
          message =
            "Não foi possível obter sua localização. " +
            "Verifique o GPS e tente novamente.";
        }

        if (/location request timed out|timeout/i.test(message)) {
          message =
            "A localização demorou para responder. " +
            "Verifique o GPS e tente novamente.";
        }

        setError(message);

        throw new Error(message);
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [sessionToken],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    submitIncident,
    loading,
    error,
    clearError,
  };
}
