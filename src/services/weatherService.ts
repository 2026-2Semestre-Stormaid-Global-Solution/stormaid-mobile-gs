const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type WeatherSummaryType = {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  rainProbability: number;
  weatherCode: number;
  message: string;
  source: string;
  status: string;
  updatedAt: string;
};

export async function getWeatherSummary(
  latitude: number,
  longitude: number,
): Promise<WeatherSummaryType> {
  if (!API_URL) {
    throw new Error("URL da API Java não configurada.");
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}/api/v1/weather/summary?${params}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível consultar as condições meteorológicas.");
  }

  return (await response.json()) as WeatherSummaryType;
}