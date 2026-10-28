import React, { useState } from 'react';

const DEMO_USERS = [
  { name: 'Rameshwar Ghadge', role: 'Farmer (Nashik)', email: 'rameshwar@farmer.in' },
  { name: 'Aditi Sharma', role: 'Retail Mandi Buyer', email: 'aditi@organics.in' },
  { name: 'Dr. A. Swaminathan', role: 'ICAR Agronomist', email: 'arvind@icar.gov.in' }
];

export default function AuthModal({ initialMode = 'login', isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Farmer' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      name: formData.name || (mode === 'login' ? 'Kisan Member' : 'New Farmer'),
      email: formData.email || 'kisan@agrosphere.io',
      role: formData.role || 'Farmer'
    };
    localStorage.setItem('agrosphere_user', JSON.stringify(user));
    onAuthSuccess(user);
    onClose();
  };

  const handleDemoLogin = (demo) => {
    localStorage.setItem('agrosphere_user', JSON.stringify(demo));
    onAuthSuccess(demo);
    onClose();
  };

  return (
    <div className="glass-modal-overlay" onClick={onClose}>
      <div className="glass-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="glass-modal-close" onClick={onClose} aria-label="Close modal">
          <i className="fas fa-times"></i>
        </button>

        <div className="text-center mb-4">
          <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '16px', background: 'rgba(184, 217, 106, 0.1)', color: '#B8D96A', marginBottom: '12px' }}>
            <i className="fas fa-shield-alt" style={{ fontSize: '1.4rem' }}></i>
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
            {mode === 'login' ? 'Sign In to AgroSphere' : 'Create Farmer Account'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '6px' }}>
            Access personalized AI crop health logs, mandi bids, and soil advisory.
          </p>
        </div>

        {/* Tab switch */}
        <div className="glass-auth-tabs">
          <div
            className={`glass-auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </div>
          <div
            className={`glass-auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Create Account
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="glass-input-group">
              <label className="glass-input-label">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rameshwar Ghadge"
                className="glass-input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          )}

          <div className="glass-input-group">
            <label className="glass-input-label">Email or Mobile Number</label>
            <input
              type="text"
              placeholder="kisan@agrosphere.io or 9876543210"
              className="glass-input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="glass-input-group">
            <label className="glass-input-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="glass-input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {mode === 'signup' && (
            <div className="glass-input-group">
              <label className="glass-input-label">I am a</label>
              <select
                className="glass-input-field"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Farmer">Farmer / Grower</option>
                <option value="Retail Mandi Buyer">Wholesale / Mandi Buyer</option>
                <option value="Agronomist">Agronomist / Soil Consultant</option>
              </select>
            </div>
          )}

          <button type="submit" className="glass-btn-submit">
            {mode === 'login' ? 'Sign In to Ecosystem' : 'Register Free Account'}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="demo-account-pills">
          <span style={{ fontSize: '0.72rem', color: '#A8A9BB', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            Quick 1-Click Demo Logins:
          </span>
          <div className="d-flex gap-2 flex-wrap">
            {DEMO_USERS.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                className="demo-pill-btn"
                onClick={() => handleDemoLogin(demo)}
                title={`Sign in as ${demo.role}`}
              >
                <i className="fas fa-user-check"></i>
                <span>{demo.name} ({demo.role.split(' ')[0]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
