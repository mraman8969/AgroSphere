
import React, { useEffect, useRef, useState } from 'react';
import './LiveLocationSharing.css';

const STORAGE_KEY = 'agrosphere_logistics_live_locations';

const readLocations = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export default function LiveLocationSharing({ profile, onBack }) {
  const userEmail = profile?.email || '';
  const watchIdRef = useRef(null);

  const [sharing, setSharing] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [savedLocation, setSavedLocation] = useState(null);

  const stopLocationSharing = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setSharing(false);
  };

  const saveLocation = (position) => {
    const locationData = {
      ownerEmail: userEmail,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date().toISOString(),
      sharing: true,
    };

    setLocation(locationData);
    setSavedLocation(locationData);
    setLastUpdated(new Date());
    setError('');

    try {
      const allLocations = readLocations();
      const otherLocations = allLocations.filter(
        item => item.ownerEmail !== userEmail
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...otherLocations, locationData])
      );
    } catch {
      setError('Unable to save location in browser storage.');
    }
  };

  const startLocationSharing = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    if (!userEmail) {
      setError('Your account email is unavailable. Please sign in again.');
      return;
    }

    setError('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        saveLocation(position);
        setSharing(true);
      },
      (geoError) => {
        const messages = {
          1: 'Location permission denied. Allow location access in browser settings.',
          2: 'Your current location is unavailable. Check your GPS or network.',
          3: 'Location request timed out. Please try again.',
        };

        setError(messages[geoError.code] || 'Unable to retrieve your location.');
        stopLocationSharing();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    setSharing(true);
  };

  useEffect(() => {
    const existing = readLocations().find(
      item => item.ownerEmail === userEmail && item.sharing
    );

    if (existing) {
      setSavedLocation(existing);
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [userEmail]);

  const openMap = () => {
    if (!location) return;

    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleStopSharing = () => {
    stopLocationSharing();

    try {
      const updatedLocations = readLocations().filter(
        item => item.ownerEmail !== userEmail
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations));
    } catch {
      setError('Sharing stopped, but saved location could not be cleared.');
    }

    setSavedLocation(null);
    setLocation(null);
    setLastUpdated(null);
  };

  const displayedLocation = location || savedLocation;

  return (
    <div className="lls-page">
      <div className="lls-header">
        <div>
          <button className="lls-back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <p className="lls-eyebrow">LOGISTICS MANAGEMENT</p>
          <h1>Live Location Sharing</h1>
          <p className="lls-subtitle">
            Share your current GPS location during active deliveries.
          </p>
        </div>
      </div>

      {error && (
        <div className="lls-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <section className="lls-main-card">
        <div className="lls-status-row">
          <div className="lls-location-icon">📍</div>
          <div>
            <h2>Location Sharing Status</h2>
            <p>
              {sharing
                ? 'Your browser is currently tracking your location.'
                : 'Your location is not currently being shared.'}
            </p>
          </div>
          <span className={`lls-status ${sharing ? 'lls-active' : 'lls-inactive'}`}>
            {sharing ? '● Sharing' : '● Stopped'}
          </span>
        </div>

        <div className="lls-map-placeholder">
          <div className="lls-map-content">
            <span className="lls-map-pin">📍</span>
            <h3>{location ? 'GPS Location Detected' : 'Location Not Available'}</h3>
            <p>
              {location
                ? 'Your latest coordinates are available below.'
                : 'Start sharing to retrieve your current GPS coordinates.'}
            </p>
          </div>
        </div>

        <div className="lls-actions">
          {!sharing ? (
            <button
              className="lls-start-btn"
              onClick={startLocationSharing}
            >
              ▶ Start Location Sharing
            </button>
          ) : (
            <button
              className="lls-stop-btn"
              onClick={handleStopSharing}
            >
              ■ Stop Location Sharing
            </button>
          )}

          <button
            className="lls-map-btn"
            onClick={openMap}
            disabled={!location}
          >
            Open in Google Maps ↗
          </button>
        </div>
      </section>

      <section className="lls-details-card">
        <div className="lls-section-heading">
          <div>
            <h2>Location Details</h2>
            <p>Latest GPS information from your device.</p>
          </div>
        </div>

        {displayedLocation ? (
          <div className="lls-details-grid">
            <div className="lls-detail-item">
              <span>Latitude</span>
              <strong>{displayedLocation.latitude.toFixed(6)}</strong>
            </div>

            <div className="lls-detail-item">
              <span>Longitude</span>
              <strong>{displayedLocation.longitude.toFixed(6)}</strong>
            </div>

            <div className="lls-detail-item">
              <span>GPS Accuracy</span>
              <strong>±{Math.round(displayedLocation.accuracy)} metres</strong>
            </div>

            <div className="lls-detail-item">
              <span>Last Updated</span>
              <strong>
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString()
                  : new Date(displayedLocation.timestamp).toLocaleTimeString()}
              </strong>
            </div>
          </div>
        ) : (
          <div className="lls-empty">
            <span>🛰️</span>
            <p>GPS information will appear here after location sharing starts.</p>
          </div>
        )}
      </section>

      <div className="lls-notice">
        <strong>Privacy & implementation note</strong>
        <p>
          Location sharing requires browser permission and a secure connection
          (HTTPS or localhost). This demo stores the latest coordinates in
          browser localStorage. It does not transmit location to buyers,
          farmers, or other devices. A backend real-time service is required
          for cross-device tracking.
        </p>
      </div>
    </div>
  );
}
