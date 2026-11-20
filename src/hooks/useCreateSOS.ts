import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import * as Crypto from "expo-crypto";
import {
  createIncident,
  type IncidentCreateRequestType,
} from "../services/incidentService";
import type { IncidentResponseType } from "../types/IncidentType";

type PendingSOSRequest = {
  sessionToken: string;
  payload: IncidentCreateRequestType;
  idempotencyKey: string;
};

export function useCreateSOS(token?: string | null) {
  const sessionToken = token?.trim() || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const pendingRequestRef = useRef<PendingSOSRequest | null>(null);
  const currentSessionRef = useRef(sessionToken);
  currentSessionRef.current = sessionToken;

  useEffect(() => {
    pendingRequestRef.current = null;
    setError(null);
  }, [sessionToken]);

  const confirmSOS = useCallback(async (): Promise<IncidentResponseType> => {
    if (inFlightRef.current) {
      throw new Error("Já existe uma solicitação SOS em andamento.");
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      if (!sessionToken) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      let pendingRequest = pendingRequestRef.current;

      if (pendingRequest && pendingRequest.sessionToken !== sessionToken) {
        pendingRequest = null;
        pendingRequestRef.current = null;
      }

      if (!pendingRequest) {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!permission.granted) {
          throw new Error(
            "Permita o acesso à localização para solicitar o SOS.",
          );
        }

        const gpsEnabled = await Location.hasServicesEnabledAsync();

        if (!gpsEnabled) {
          throw new Error(
            "Ative a localização do dispositivo para solicitar o SOS.",
          );
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
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
          throw new Error("Não foi possível obter uma localização válida.");
        }

        if (currentSessionRef.current !== sessionToken) {
          throw new Error("Sua sessão foi alterada durante a localização.");
        }

        const payload: IncidentCreateRequestType = {
          recipientType: "SELF",
          requesterOnSite: true,
          channelType: "SOS_SILENT",
          emergencyCategory: "UNKNOWN_EMERGENCY",
          location: {
            source: "CURRENT_LOCATION",
            latitude,
            longitude,
            accuracyMeters:
              accuracy !== null && Number.isFinite(accuracy) && accuracy >= 0
                ? accuracy
                : null,
            locationCapturedAt: new Date(position.timestamp).toISOString(),
          },
        };

        pendingRequest = {
          sessionToken,
          payload,
          idempotencyKey: Crypto.randomUUID(),
        };

        pendingRequestRef.current = pendingRequest;
      }

      if (currentSessionRef.current !== sessionToken) {
        throw new Error("Sua sessão foi alterada. Faça login novamente.");
      }

      const createdIncident = await createIncident(
        sessionToken,
        pendingRequest.payload,
        pendingRequest.idempotencyKey,
      );

      if (currentSessionRef.current !== sessionToken) {
        throw new Error("Sua sessão foi alterada durante o envio.");
      }

      pendingRequestRef.current = null;

      return createdIncident;
    } catch (exception) {
      let message =
        exception instanceof Error
          ? exception.message
          : "Não foi possível enviar a solicitação SOS.";

      if (
        /current location is unavailable|location is unavailable/i.test(message)
      ) {
        message =
          "Não foi possível obter sua localização. " +
          "Verifique o GPS do dispositivo.";
      }

      if (/location request timed out|timeout/i.test(message)) {
        message =
          "O GPS demorou para responder. " +
          "Verifique sua localização e tente novamente.";
      }

      setError(message);

      throw new Error(message);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [sessionToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    confirmSOS,
    loading,
    error,
    clearError,
  };
}
