import { useRef, useState } from "react";
import * as Location from "expo-location";

import {
  getWeatherSummary,
  type WeatherSummaryType,
} from "../services/weatherService";

export function useWeatherSummary() {
  const [weather, setWeather] = useState<WeatherSummaryType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestingRef = useRef(false);

  async function loadWeather() {
    if (requestingRef.current) return;

    requestingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        throw new Error(
          "Permita o acesso à localização para consultar o clima.",
        );
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        throw new Error(
          "A localização do dispositivo está desativada. Ative o GPS e tente novamente.",
        );
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const response = await getWeatherSummary(
        position.coords.latitude,
        position.coords.longitude,
      );

      setWeather(response);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      const locationUnavailable =
        /location is unavailable|location provider is unavailable/i.test(
          message,
        );

      const locationTimeout = /timeout|timed out/i.test(message);

      if (locationUnavailable) {
        setError(
          "Não foi possível obter sua localização. Verifique o GPS do dispositivo e tente novamente.",
        );
      } else if (locationTimeout) {
        setError("A localização demorou para responder. Tente novamente.");
      } else {
        setError(
          message || "Não foi possível consultar as condições meteorológicas.",
        );
      }
    } finally {
      setLoading(false);
      requestingRef.current = false;
    }
  }

  return {
    weather,
    loading,
    error,
    loadWeather,
  };
}