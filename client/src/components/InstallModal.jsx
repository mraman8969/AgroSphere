import React from 'react';

export default function InstallModal({ isOpen, onClose, deferredPrompt, onInstallTriggered }) {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstallTriggered();
      }
      onClose();
    }
  };

  return (
    <div className="glass-modal-overlay" onClick={onClose}>
      <div className="glass-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="glass-modal-close" onClick={onClose} aria-label="Close modal">
          <i className="fas fa-times"></i>
        </button>

        <div className="text-center mb-4">
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '18px', background: 'rgba(184, 217, 106, 0.12)', color: '#B8D96A', marginBottom: '12px' }}>
            <i className="fas fa-mobile-alt" style={{ fontSize: '1.6rem' }}></i>
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            Install AgroSphere Progressive Web App
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '6px' }}>
            Install AgroSphere directly on your device for instant offline access and quick crop diagnostics.
          </p>
        </div>

        {deferredPrompt ? (
          <div className="text-center mb-4">
            <button onClick={handleInstallClick} className="glass-btn-submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <i className="fas fa-download"></i>
              <span>Install AgroSphere App Now</span>
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
            <h5 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fab fa-apple" style={{ color: 'var(--secondary)' }}></i> On iOS (iPhone / iPad):
            </h5>
            <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
              <li>Open AgroSphere in <strong>Safari</strong> browser.</li>
              <li>Tap the <strong>Share</strong> button <i className="fas fa-share-square" style={{ color: '#38bdf8' }}></i> at the bottom.</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong> <i className="fas fa-plus-square" style={{ color: 'var(--accent)' }}></i>.</li>
            </ol>

            <h5 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', margin: '16px 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fab fa-chrome" style={{ color: 'var(--secondary)' }}></i> On Android / Chrome:
            </h5>
            <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
              <li>Tap the <strong>three dots menu (⋮)</strong> in Chrome.</li>
              <li>Tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</li>
            </ol>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <i className="fas fa-check-circle" style={{ color: 'var(--secondary)', marginRight: '5px' }}></i>
            Zero storage footprint (PWA)
          </span>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
