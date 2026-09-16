/**
 * Open-Meteo Weather Integration for VANGUARD
 * Free, open-access meteorological API (no API key required).
 * Surfaces real-time conditions and farming advisories on rural requests.
 */

export interface WeatherData {
  temperatureC: number;
  weatherCode: number;
  condition: string;
  isRaining: boolean;
  windSpeedKmH: number;
  humidityPct?: number;
  advisory?: string;
  source: string;
}

// WMO Weather interpretation codes (http://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)
function interpretWeatherCode(code: number): { condition: string; isRaining: boolean; advisory: string } {
  if (code === 0) return { condition: "Clear Sky", isRaining: false, advisory: "Clear skies; optimal for harvesting and outdoor civic repairs." };
  if (code === 1 || code === 2 || code === 3) return { condition: "Partly Cloudy", isRaining: false, advisory: "Favorable weather for field labor and maintenance." };
  if (code >= 51 && code <= 55) return { condition: "Light Drizzle", isRaining: true, advisory: "Light moisture; inspect electrical wiring and road drainage." };
  if (code >= 61 && code <= 65) return { condition: "Rain Shower", isRaining: true, advisory: "Active rain; monitor low-lying crop beds and canal feeder channels." };
  if (code >= 80 && code <= 82) return { condition: "Heavy Rain", isRaining: true, advisory: "⚠️ Heavy precipitation; prioritize waterlogging drainage and transformer protection." };
  if (code >= 95) return { condition: "Thunderstorm", isRaining: true, advisory: "🚨 Severe thunderstorm risk; halt high-wire electrical repairs immediately." };
  return { condition: "Mild Weather", isRaining: false, advisory: "Normal seasonal rural conditions." };
}

export async function fetchLocationWeather(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const current = data.current;
      const code = current.weather_code ?? 0;
      const interp = interpretWeatherCode(code);

      return {
        temperatureC: Math.round(current.temperature_2m),
        weatherCode: code,
        condition: interp.condition,
        isRaining: interp.isRaining || (current.precipitation > 0),
        windSpeedKmH: Math.round(current.wind_speed_10m),
        humidityPct: Math.round(current.relative_humidity_2m),
        advisory: interp.advisory,
        source: "Open-Meteo Live API",
      };
    }
  } catch {
    // Graceful fallback below
  }

  // Graceful offline fallback
  return {
    temperatureC: 28,
    weatherCode: 1,
    condition: "Partly Cloudy (Simulated)",
    isRaining: false,
    windSpeedKmH: 12,
    humidityPct: 60,
    advisory: "Favorable dry conditions for field repair and labor dispatch.",
    source: "Mock Fallback (Offline Safe)",
  };
}
