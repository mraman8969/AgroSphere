import React from 'react';

const MARKETPLACE_ROLES = [
  {
    id: 'farmer',
    title: 'Farmer / FPO',
    description: 'Sell agricultural produce directly to buyers and manage your orders.',
    icon: 'fas fa-tractor',
    action: 'Continue as Farmer / FPO'
  },
  {
    id: 'buyer',
    title: 'Buyer',
    description: 'Discover fresh agricultural produce and purchase directly from farmers.',
    icon: 'fas fa-shopping-basket',
    action: 'Continue as Buyer'
  },
  {
    id: 'logistics',
    title: 'Logistic Partner',
    description: 'Manage delivery assignments, transportation and order tracking.',
    icon: 'fas fa-truck',
    action: 'Continue as Logistic Partner'
  }
];

export default function MarketplaceRoleSelection({ onSelectRole }) {
  return (
    <main
      className="marketplace-role-selection"
      style={{ padding: '30px 0 80px' }}
    >
      <div className="container">
        <div className="tools-page-header">
          <div className="tools-title-badge">
            <i className="fas fa-store"></i>
            <span>AgroSphere Marketplace</span>
          </div>

          <h2 className="stitle" style={{ color: 'var(--text-primary)' }}>
            Choose Your <span>Role</span>
          </h2>

          <div className="sline"></div>

          <p
            className="sdesc mx-auto"
            style={{
              maxWidth: '640px',
              color: 'var(--text-secondary)'
            }}
          >
            Select how you want to participate in the agricultural marketplace.
            You can enable multiple roles using the same account.
          </p>
        </div>

        <div className="row g-4 mt-4">
          {MARKETPLACE_ROLES.map((role) => (
            <div className="col-lg-4 col-md-6" key={role.id}>
              <div
                className="glass-card h-100"
                style={{
                  padding: '28px',
                  borderRadius: '18px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                  <i className={role.icon}></i>
                </div>

                <h4 style={{ color: 'var(--text-primary)' }}>
                  {role.title}
                </h4>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    minHeight: '65px',
                    lineHeight: 1.6
                  }}
                >
                  {role.description}
                </p>

                <button
                  type="button"
                  className="glass-btn-submit"
                  style={{ width: '100%' }}
                  onClick={() => onSelectRole?.(role.id)}
                >
                  {role.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}