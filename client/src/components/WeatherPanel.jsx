import React, { useState, useEffect } from 'react';
import { 
  fetchLiveWeatherByCoords, 
  getUserLiveCoordinates, 
  PRESET_AGRI_ZONES 
} from '../services/weatherService';

export default function WeatherPanel() {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedZone, setSelectedZone] = useState('');

  // Auto-load default Agri-Hub on mount without nagging for permission immediately
  useEffect(() => {
    loadZoneWeather(PRESET_AGRI_ZONES[0]);
  }, []);

  const loadZoneWeather = async (zone) => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const data = await fetchLiveWeatherByCoords(zone.lat, zone.lon, zone.name);
      setWeather(data);
      setStatus('success');
      setSelectedZone(zone.id);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to fetch weather for selected zone');
      setStatus('error');
    }
  };

  const handleDetectLiveLocation = async () => {
    setStatus('loading');
    setErrorMessage('');
    setSelectedZone('');

    try {
      const coords = await getUserLiveCoordinates();
      const data = await fetchLiveWeatherByCoords(coords.lat, coords.lon);
      setWeather(data);
      setStatus('success');
    } catch (err) {
      if (err.code === 1 || err.message?.includes('denied')) {
        setStatus('denied');
        setErrorMessage('Location permission was denied. You can select an agricultural zone below or enable permissions in browser settings.');
      } else {
        setStatus('error');
        setErrorMessage(err.message || 'Unable to retrieve your current location.');
      }
    }
  };

  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    const zone = PRESET_AGRI_ZONES.find((z) => z.id === zoneId);
    if (zone) {
      loadZoneWeather(zone);
    }
  };

  return (
    <div className="weather-glass-panel">
      {/* Left side: Location & Weather Stats */}
      <div className="weather-info-group">
        <div className="weather-badge-icon" style={{ color: weather?.conditionColor || '#B8D96A' }}>
          {status === 'loading' ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className={weather?.conditionIcon || 'fas fa-cloud-sun'}></i>
          )}
        </div>

        <div>
          <div className="d-flex align-items-baseline gap-2">
            <span className="weather-temp-num">
              {status === 'loading' ? '--' : `${weather?.temp ?? '--'}°C`}
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {status === 'loading' ? 'Loading microclimate...' : (weather?.condition || 'Fair Weather')}
            </span>
          </div>

          <div className="d-flex align-items-center gap-3 mt-1 flex-wrap">
            <span className="weather-location-pill">
              <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-dark)' }}></i>
              {weather?.locationName || 'Detecting Location...'}
            </span>
            {weather?.humidity !== undefined && (
              <span className="weather-meta-label">
                <i className="fas fa-tint" style={{ color: '#60a5fa' }}></i>
                Humidity: <strong style={{ color: 'var(--text-primary)' }}>{weather.humidity}%</strong>
              </span>
            )}
            {weather?.windSpeed !== undefined && (
              <span className="weather-meta-label">
                <i className="fas fa-wind" style={{ color: 'var(--secondary)' }}></i>
                Wind: <strong style={{ color: 'var(--text-primary)' }}>{weather.windSpeed} km/h</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Actions & Zone Fallback */}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <button
          onClick={handleDetectLiveLocation}
          className="btn-glass-install"
          title="Detect live coordinates via GPS"
          disabled={status === 'loading'}
        >
          <i className="fas fa-crosshairs"></i>
          <span>Detect GPS</span>
        </button>

        <select
          value={selectedZone}
          onChange={handleZoneChange}
          className="weather-zone-select"
          title="Choose a specific agricultural belt"
        >
          <option value="" disabled>Select Agri-Belt</option>
          {PRESET_AGRI_ZONES.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            if (selectedZone) {
              const zone = PRESET_AGRI_ZONES.find((z) => z.id === selectedZone);
              if (zone) loadZoneWeather(zone);
            } else {
              handleDetectLiveLocation();
            }
          }}
          className="weather-refresh-btn"
          title="Refresh live environmental data"
          disabled={status === 'loading'}
        >
          <i className={`fas fa-sync-alt ${status === 'loading' ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      {/* Permission Denied / Error Alert Banner */}
      {(status === 'denied' || status === 'error') && (
        <div style={{ width: '100%', marginTop: '10px', fontSize: '0.78rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
