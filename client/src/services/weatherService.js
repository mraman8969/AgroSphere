/**
 * Real-time Agricultural Weather & Geolocation Service
 * Uses Open-Meteo (Free Open API, no key required) + OpenStreetMap Nominatim
 */

export const PRESET_AGRI_ZONES = [
  { id: 'delhi', name: 'National Agri-Hub (New Delhi)', lat: 28.6139, lon: 77.2090 },
  { id: 'punjab', name: 'Wheat Belt (Ludhiana, Punjab)', lat: 30.9010, lon: 75.8573 },
  { id: 'haryana', name: 'Grain Mandi (Karnal, Haryana)', lat: 29.6857, lon: 76.9905 },
  { id: 'maharashtra', name: 'Vineyard / Onion Hub (Nashik, Maharashtra)', lat: 19.9975, lon: 73.7898 },
  { id: 'karnataka', name: 'Spice & Paddy Zone (Shimoga, Karnataka)', lat: 13.9299, lon: 75.5681 },
  { id: 'up', name: 'Gangetic Plains (Varanasi, UP)', lat: 25.3176, lon: 82.9739 }
];

export function getWmoWeatherInfo(code) {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', icon: 'fas fa-sun', color: '#B8D96A' };
    case 1:
      return { label: 'Mainly Clear', icon: 'fas fa-cloud-sun', color: '#B8D96A' };
    case 2:
      return { label: 'Partly Cloudy', icon: 'fas fa-cloud-sun', color: '#A970FF' };
    case 3:
      return { label: 'Overcast', icon: 'fas fa-cloud', color: '#A8A9BB' };
    case 45:
    case 48:
      return { label: 'Foggy / Dew', icon: 'fas fa-smog', color: '#A8A9BB' };
    case 51:
    case 53:
    case 55:
      return { label: 'Light Drizzle', icon: 'fas fa-cloud-rain', color: '#60a5fa' };
    case 61:
    case 63:
    case 65:
      return { label: 'Monsoon Rain', icon: 'fas fa-cloud-showers-heavy', color: '#38bdf8' };
    case 71:
    case 73:
    case 75:
      return { label: 'Snow Flurries', icon: 'fas fa-snowflake', color: '#e0e7ff' };
    case 80:
    case 81:
    case 82:
      return { label: 'Scattered Showers', icon: 'fas fa-cloud-rain', color: '#38bdf8' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorm Warning', icon: 'fas fa-bolt', color: '#f59e0b' };
    default:
      return { label: 'Fair Agriculture Weather', icon: 'fas fa-cloud-sun', color: '#4F8A52' };
  }
}

export async function fetchLiveWeatherByCoords(lat, lon, overrideName = null) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
  
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) {
    throw new Error('Weather API service temporarily unavailable');
  }
  const weatherData = await weatherRes.json();
  const current = weatherData.current;

  let locationName = overrideName;
  if (!locationName) {
    try {
      const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const city = geoData.city || geoData.locality || geoData.principalSubdivision;
        const country = geoData.countryCode || 'IN';
        locationName = `${city}, ${country}`;
      }
    } catch {
      locationName = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
    }
  }

  const wmo = getWmoWeatherInfo(current.weather_code);

  return {
    temp: Math.round(current.temperature_2m),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    weatherCode: current.weather_code,
    condition: wmo.label,
    conditionIcon: wmo.icon,
    conditionColor: wmo.color,
    locationName: locationName || 'Local Farm Zone',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export function getUserLiveCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser does not support geolocation'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  });
}
