import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getEmergencyContact,
  saveEmergencyContact,
} from "../services/emergencyContactService";
import type {
  EmergencyContactFormType,
  EmergencyContactType,
} from "../types/EmergencyContactType";

function normalizeContact(value: EmergencyContactType | null): EmergencyContactType | null {
  if (!value?.name?.trim() || !value.phoneNumber?.trim()) {
    return null;
  }

  return value;
}

export function useEmergencyContact(token?: string | null) {
  const sessionToken = token?.trim() || null;
  const requestIdRef = useRef(0);
  const [contact, setContact] = useState<EmergencyContactType | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionToken));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshContact = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!sessionToken) {
      setContact(null);
      setLoading(false);
      setError("Faça login para consultar seus contatos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await getEmergencyContact(sessionToken);

      if (requestId === requestIdRef.current) {
        setContact(normalizeContact(profile.emergencyContact));
      }
    } catch (reason) {
      if (requestId === requestIdRef.current) {
        setError(reason instanceof Error ? reason.message : "Não foi possível carregar o contato.");
        setContact(null);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [sessionToken]);

  useFocusEffect(
    useCallback(() => {
      void refreshContact();

      return () => {
        requestIdRef.current += 1;
      };
    }, [refreshContact]),
  );

  const saveContact = useCallback(
    async (data: EmergencyContactFormType) => {
      if (!sessionToken) {
        throw new Error("Faça login para salvar seu contato.");
      }

      setSaving(true);

      try {
        const profile = await saveEmergencyContact(sessionToken, data);
        const saved = normalizeContact(profile.emergencyContact);

        if (!saved) {
          throw new Error("A API não confirmou o contato salvo.");
        }

        setContact(saved);
        setError(null);
      } finally {
        setSaving(false);
      }
    },
    [sessionToken],
  );

  return {
    contact,
    loading,
    saving,
    error,
    refreshContact,
    saveContact,
  };
}
