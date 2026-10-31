
import React, { useState } from 'react';
import './MarketplaceOnboarding.css';

const ROLE_CONFIG = {
  farmer: {
    title: 'Farmer / FPO Registration',
    subtitle: 'Tell us about your farm or farmer organization.',
    fields: [
      { name: 'farmName', label: 'Farm / FPO Name', type: 'text', required: true },
      { name: 'farmerType', label: 'Account Type', type: 'select', options: ['Individual Farmer', 'FPO'], required: true },
      { name: 'landArea', label: 'Land Area (Acres)', type: 'number', required: true },
      { name: 'primaryCrops', label: 'Primary Crops', type: 'text', required: true }
    ]
  },
  buyer: {
    title: 'Buyer Registration',
    subtitle: 'Tell us about your purchasing requirements.',
    fields: [
      { name: 'organization', label: 'Organization / Business Name', type: 'text', required: true },
      { name: 'buyerType', label: 'Buyer Type', type: 'select', options: ['Retailer', 'Wholesaler', 'Restaurant', 'Processor', 'Individual Consumer', 'Other'], required: true },
      { name: 'purchaseNeeds', label: 'Products You Usually Purchase', type: 'text', required: true },
      { name: 'purchaseVolume', label: 'Approximate Purchase Volume', type: 'text', required: false }
    ]
  },
  logistics: {
    title: 'Logistic Partner Registration',
    subtitle: 'Provide your transportation and service details.',
    fields: [
      { name: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['Mini Truck', 'Pickup', 'Truck', 'Tractor Trolley', 'Other'], required: true },
      { name: 'vehicleNumber', label: 'Vehicle Registration Number', type: 'text', required: true },
      { name: 'serviceArea', label: 'Service Area / District', type: 'text', required: true },
      { name: 'capacity', label: 'Vehicle Capacity (in KG)', type: 'number', required: true }
    ]
  }
};

export default function MarketplaceOnboarding({
  role,
  currentUser,
  onBack,
  onComplete
}) {
  const config = ROLE_CONFIG[role];

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    location: '',
    ...Object.fromEntries(
      (config?.fields || []).map(field => [field.name, ''])
    )
  });

  const [error, setError] = useState('');

  if (!config) {
    return <p>Invalid Marketplace role selected.</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const userKey = formData.email?.trim().toLowerCase() || 'guest';

    const storageKey = `agrosphere_marketplace_profiles_${userKey}`;

    let existingProfiles = {};

    try {
      existingProfiles = JSON.parse(
        localStorage.getItem(storageKey) || '{}'
      );
    } catch {
      existingProfiles = {};
    }

    const profile = {
      ...formData,
      role,
      completed: true,
      updatedAt: new Date().toISOString()
    };

    const updatedProfiles = {
      ...existingProfiles,
      [role]: profile
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedProfiles));

    onComplete?.(profile);
  };

  return (
    <main
      className="marketplace-onboarding"
      style={{ padding: '30px 0 80px' }}
    >
      <div className="container" style={{ maxWidth: '760px' }}>

        <button
          type="button"
          onClick={onBack}
          className="btn-dark-glass-secondary"
          style={{ padding: '8px 16px', marginBottom: '25px' }}
        >
          <i className="fas fa-arrow-left me-1"></i>
          Back to Roles
        </button>

        <div className="tools-page-header">
          <div className="tools-title-badge">
            <i className="fas fa-user-plus"></i>
            <span>Marketplace Onboarding</span>
          </div>

          <h2 className="stitle" style={{ color: 'var(--text-primary)' }}>
            {config.title}
          </h2>

          <div className="sline"></div>

          <p className="sdesc" style={{ color: 'var(--text-secondary)' }}>
            {config.subtitle}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card"
          style={{
            padding: '28px',
            borderRadius: '18px',
            marginTop: '30px'
          }}
        >
          <h5 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>
            Basic Information
          </h5>

          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                readOnly={!!currentUser?.email}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">City / District *</label>
              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="Enter your location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '28px 0' }} />

          <h5 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>
            Role-Specific Information
          </h5>

          <div className="row g-3">
            {config.fields.map(field => (
              <div className="col-md-6" key={field.name}>
                <label className="form-label">
                  {field.label} {field.required ? '*' : ''}
                </label>

                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    className="form-select"
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                  >
                    <option value="">Select an option</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    className="form-control"
                    value={formData[field.name]}
                    onChange={handleChange}
                    min={field.type === 'number' ? '0' : undefined}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: '#ef4444', marginTop: '18px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="glass-btn-submit"
            style={{ width: '100%', marginTop: '28px' }}
          >
            Complete Registration
            <i className="fas fa-arrow-right ms-2"></i>
          </button>

        </form>
      </div>
    </main>
  );
}
