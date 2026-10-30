import React from 'react';

export default function MarketplaceView() {
  return (
    <main
      id="main"
      className="marketplace-view-container"
      style={{ padding: '30px 0 80px' }}
    >
      <div className="container">
        <div className="tools-page-header">
          <div className="tools-title-badge">
            <i className="fas fa-store"></i>
            <span>Direct Farmer Mandi & Commerce</span>
          </div>

          <h2 className="stitle" style={{ color: 'var(--text-primary)' }}>
            AgroSphere <span>Marketplace</span>
          </h2>

          <div className="sline"></div>

          <p
            className="sdesc mx-auto"
            style={{
              maxWidth: '640px',
              color: 'var(--text-secondary)'
            }}
          >
            Connect farmers, FPOs, buyers and logistics partners through
            a unified agricultural marketplace.
          </p>
        </div>
      </div>
    </main>
  );
}