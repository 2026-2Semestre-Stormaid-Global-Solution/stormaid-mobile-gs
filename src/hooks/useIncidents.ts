import { useCallback, useEffect, useRef, useState } from "react";
import { listMyIncidents } from "../services/incidentService";
import type { IncidentResponseType } from "../types/IncidentType";

type IncidentsState = {
  sessionKey: string | null;
  incidents: IncidentResponseType[] | undefined;
  totalElements: number | null;
  loading: boolean;
  error: string | null;
};

export function useIncidents(token?: string | null) {
  const sessionKey = token?.trim() || null;

  const requestIdRef = useRef(0);

  const [state, setState] = useState<IncidentsState>({
    sessionKey,
    incidents: undefined,
    totalElements: null,
    loading: false,
    error: null,
  });

  const refreshIncidents = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!sessionKey) {
      setState({
        sessionKey: null,
        incidents: undefined,
        totalElements: null,
        loading: false,
        error: null,
      });

      return;
    }

    setState((previous) => ({
      sessionKey,
      incidents:
        previous.sessionKey === sessionKey ? previous.incidents : undefined,
      totalElements:
        previous.sessionKey === sessionKey ? previous.totalElements : null,
      loading: true,
      error: null,
    }));

    try {
      const response = await listMyIncidents(sessionKey, 0, 3);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        sessionKey,
        incidents: response.content,
        totalElements: response.totalElements,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        sessionKey,
        incidents: undefined,
        totalElements: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os chamados.",
      });
    }
  }, [sessionKey]);

  useEffect(() => {
    void refreshIncidents();

    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshIncidents]);

  const isCurrentSession = state.sessionKey === sessionKey;

  return {
    incidents: isCurrentSession ? state.incidents : undefined,
    totalElements: isCurrentSession ? state.totalElements : null,
    loading: isCurrentSession ? state.loading : Boolean(sessionKey),
    error: isCurrentSession ? state.error : null,
    refreshIncidents,
  };
}
