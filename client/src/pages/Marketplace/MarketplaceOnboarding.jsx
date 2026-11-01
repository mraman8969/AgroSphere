
import React, { useState } from 'react';
import './MarketplaceOnboarding.css';

const ROLE_CONFIG = {
  farmer: {
    title: 'Farmer',
    fields: [
      { name: 'farmName', label: 'Farm Name', type: 'text', required: true },
      {
        name: 'farmerType',
        label: 'Farmer Type',
        type: 'select',
        required: true,
        options: ['Individual Farmer', 'FPO'],
      },
      {
        name: 'landArea',
        label: 'Land Area (Acres)',
        type: 'number',
        required: true,
      },
      {
        name: 'primaryCrops',
        label: 'Primary Crops',
        type: 'text',
        required: true,
      },
    ],
  },
  buyer: {
    title: 'Buyer',
    fields: [
      {
        name: 'organization',
        label: 'Organization Name',
        type: 'text',
        required: true,
      },
      {
        name: 'buyerType',
        label: 'Buyer Type',
        type: 'select',
        required: true,
        options: [
          'Retailer',
          'Wholesaler',
          'Restaurant',
          'Processor',
          'Individual Consumer',
          'Other',
        ],
      },
      {
        name: 'purchaseNeeds',
        label: 'Purchase Requirements',
        type: 'text',
        required: true,
      },
      {
        name: 'purchaseVolume',
        label: 'Purchase Volume',
        type: 'text',
        required: false,
      },
    ],
  },
  logistics: {
    title: 'Logistics',
    fields: [
      {
        name: 'vehicleType',
        label: 'Vehicle Type',
        type: 'select',
        required: true,
        options: [
          'Mini Truck',
          'Pickup',
          'Truck',
          'Tractor Trolley',
          'Other',
        ],
      },
      {
        name: 'vehicleNumber',
        label: 'Vehicle Number',
        type: 'text',
        required: true,
      },
      {
        name: 'serviceArea',
        label: 'Service Area',
        type: 'text',
        required: true,
      },
      {
        name: 'capacity',
        label: 'Vehicle Capacity',
        type: 'number',
        required: true,
      },
    ],
  },
};

const BENEFITS = [
  {
    icon: 'bi-person-check',
    title: 'Create Your Profile',
    description: 'Set up your marketplace identity.',
  },
  {
    icon: 'bi-shop',
    title: 'Direct Market Access',
    description: 'Connect directly with marketplace users.',
  },
  {
    icon: 'bi-graph-up-arrow',
    title: 'Better Opportunities',
    description: 'Discover new business opportunities.',
  },
];

const MarketplaceOnboarding = ({
  role,
  currentUser,
  onBack,
  onComplete,
}) => {
  const roleConfig = ROLE_CONFIG[role];

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    location: '',
    farmName: '',
    farmerType: '',
    landArea: '',
    primaryCrops: '',
    organization: '',
    buyerType: '',
    purchaseNeeds: '',
    purchaseVolume: '',
    vehicleType: '',
    vehicleNumber: '',
    serviceArea: '',
    capacity: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    const updatedValue =
      name === 'phone'
        ? value.replace(/\D/g, '').slice(0, 10)
        : value;

    setFormData((previous) => ({
      ...previous,
      [name]: updatedValue,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: '',
    }));

    setError('');
  };

  const validateForm = () => {
    const errors = {};

    const fullName = String(formData.fullName || '').trim();
    const email = String(formData.email || '').trim();
    const phone = String(formData.phone || '').trim();
    const location = String(formData.location || '').trim();

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!fullName) {
      errors.fullName = 'Full name is required.';
    }

    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!emailPattern.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!phone) {
      errors.phone = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (!location) {
      errors.location = 'Location is required.';
    }

    if (roleConfig) {
      roleConfig.fields.forEach((field) => {
        const value = String(formData[field.name] ?? '').trim();

        if (field.required && !value) {
          errors[field.name] = `${field.label} is required.`;
          return;
        }

        if (field.type === 'number' && value) {
          const numberValue = Number(value);

          if (!Number.isFinite(numberValue) || numberValue <= 0) {
            errors[field.name] =
              `${field.label} must be greater than 0.`;
          }
        }
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const renderFieldError = (fieldName) => {
    if (!fieldErrors[fieldName]) return null;

    return (
      <span className="marketplace-field-error" role="alert">
        <i className="bi bi-exclamation-circle" />
        {fieldErrors[fieldName]}
      </span>
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!roleConfig) {
      setError('Invalid role selected. Please go back and try again.');
      return;
    }

    if (!validateForm()) {
      setError('Please correct the highlighted fields before continuing.');
      return;
    }

    const normalizedEmail = String(formData.email)
      .trim()
      .toLowerCase();

    const userKey = normalizedEmail || currentUser?.id || 'guest';
    const storageKey =
      `agrosphere_marketplace_profiles_${userKey}`;

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
      fullName: String(formData.fullName).trim(),
      email: normalizedEmail,
      phone: String(formData.phone).trim(),
      location: String(formData.location).trim(),
      role,
      completed: true,
      updatedAt: new Date().toISOString(),
    };

    const updatedProfiles = {
      ...existingProfiles,
      [role]: profile,
    };

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(updatedProfiles)
      );

      onComplete?.(profile);
    } catch {
      setError('Unable to save your profile. Please try again.');
    }
  };

  if (!roleConfig) {
    return (
      <main className="marketplace-onboarding">
        <div className="container marketplace-onboarding-container">
          <p>Invalid marketplace role selected.</p>
          <button
            type="button"
            className="btn btn-dark-glass-secondary"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left" /> Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="marketplace-onboarding">
      <div className="container marketplace-onboarding-container">

        {/* Back Navigation */}
        <div className="marketplace-onboarding-nav">
          <button
            type="button"
            className="btn btn-dark-glass-secondary"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left" />
            Back to Role Selection
          </button>
        </div>

        {/* Hero Section */}
        <section className="marketplace-registration-hero">
          <div className="marketplace-hero-badge">
            <i className="bi bi-shield-check" />
            AGROSPHERE MARKETPLACE REGISTRATION
          </div>

          <h1>
            Join the <span>AgroSphere</span> Marketplace
          </h1>

          <div className="marketplace-hero-underline" />

          <p>
            Complete your {roleConfig.title.toLowerCase()} profile
            to access the AgroSphere marketplace and connect with
            the agricultural community.
          </p>
        </section>

        {/* Benefits */}
        <section className="marketplace-benefits-strip">
          {BENEFITS.map((benefit, index) => (
            <div className="marketplace-benefit-item" key={benefit.title}>
              <div className="marketplace-benefit-icon">
                <i className={`bi ${benefit.icon}`} />
              </div>

              <div className="marketplace-benefit-content">
                <h5>{benefit.title}</h5>
                <p>{benefit.description}</p>
              </div>

              {index !== BENEFITS.length - 1 && (
                <div className="marketplace-benefit-divider" />
              )}
            </div>
          ))}
        </section>

        {/* Registration Form */}
        <section className="marketplace-registration-section">
          <div className="marketplace-form-heading">
            <span>PROFILE SETUP</span>
            <h3>Complete Your {roleConfig.title} Profile</h3>
            <p>All fields marked with * are required.</p>
          </div>

          <form
            className="marketplace-registration-form glass-card"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Personal Information */}
            <h5 className="marketplace-form-section-title">
              <i className="bi bi-person-circle me-2" />
              Personal Information
            </h5>

            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label" htmlFor="fullName">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  className={`form-control ${fieldErrors.fullName ? 'is-invalid' : ''}`}
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  aria-invalid={!!fieldErrors.fullName}
                />
                {renderFieldError('fullName')}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={!!currentUser?.email}
                  placeholder="Enter your email address"
                  aria-invalid={!!fieldErrors.email}
                />
                {renderFieldError('email')}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="phone">
                  Mobile Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  aria-invalid={!!fieldErrors.phone}
                />
                {renderFieldError('phone')}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="location">
                  Location *
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  className={`form-control ${fieldErrors.location ? 'is-invalid' : ''}`}
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your city or village"
                  aria-invalid={!!fieldErrors.location}
                />
                {renderFieldError('location')}
              </div>
            </div>

            <hr className="marketplace-form-divider" />

            {/* Role-specific Information */}
            <h5 className="marketplace-form-section-title">
              <i className="bi bi-card-checklist me-2" />
              {roleConfig.title} Details
            </h5>

            <div className="row g-4">
              {roleConfig.fields.map((field) => (
                <div className="col-md-6" key={field.name}>
                  <label
                    className="form-label"
                    htmlFor={field.name}
                  >
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      className={`form-select ${fieldErrors[field.name] ? 'is-invalid' : ''}`}
                      value={formData[field.name]}
                      onChange={handleChange}
                      aria-invalid={!!fieldErrors[field.name]}
                    >
                      <option value="">
                        Select {field.label}
                      </option>

                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.name}
                      type={field.type}
                      name={field.name}
                      className={`form-control ${fieldErrors[field.name] ? 'is-invalid' : ''}`}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      min={field.type === 'number' ? '0' : undefined}
                      step={field.type === 'number' ? 'any' : undefined}
                      aria-invalid={!!fieldErrors[field.name]}
                    />
                  )}

                  {renderFieldError(field.name)}
                </div>
              ))}
            </div>

            {/* General Error */}
            {error && (
              <div className="marketplace-form-error" role="alert">
                <i className="bi bi-exclamation-triangle me-2" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn glass-btn-submit marketplace-registration-submit"
            >
              Complete Registration
              <i className="bi bi-arrow-right-circle ms-2" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default MarketplaceOnboarding;
