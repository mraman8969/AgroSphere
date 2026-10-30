
import React from 'react';

const DASHBOARD_CONFIG = {
  farmer: {
    title: 'Farmer / FPO Dashboard',
    subtitle: 'Manage your agricultural business from one place.',
    icon: 'fas fa-tractor',
    modules: [
      { title: 'My Products', description: 'Manage your listed agricultural products.', icon: 'fas fa-boxes-stacked' },
      { title: 'Incoming Orders', description: 'View and manage buyer orders.', icon: 'fas fa-shopping-bag' },
      { title: 'Inventory', description: 'Monitor available product stock.', icon: 'fas fa-warehouse' },
      { title: 'Sales & Earnings', description: 'Track your sales and earnings.', icon: 'fas fa-chart-line' }
    ]
  },

  buyer: {
    title: 'Buyer Dashboard',
    subtitle: 'Discover agricultural products and manage your purchases.',
    icon: 'fas fa-shopping-basket',
    modules: [
      { title: 'Browse Products', description: 'Explore fresh agricultural produce.', icon: 'fas fa-store' },
      { title: 'My Cart', description: 'Manage products you want to purchase.', icon: 'fas fa-cart-shopping' },
      { title: 'My Orders', description: 'View your current and previous orders.', icon: 'fas fa-box' },
      { title: 'Track Deliveries', description: 'Follow your order delivery status.', icon: 'fas fa-truck' }
    ]
  },

  logistics: {
    title: 'Logistics Dashboard',
    subtitle: 'Manage your transportation and delivery operations.',
    icon: 'fas fa-truck',
    modules: [
      { title: 'New Assignments', description: 'View available delivery assignments.', icon: 'fas fa-clipboard-list' },
      { title: 'Active Deliveries', description: 'Manage ongoing deliveries.', icon: 'fas fa-route' },
      { title: 'Delivery History', description: 'Review completed deliveries.', icon: 'fas fa-clock-rotate-left' },
      { title: 'My Earnings', description: 'Track your delivery earnings.', icon: 'fas fa-wallet' }
    ]
  }
};

export default function MarketplaceDashboard({
  role,
  profile,
  onBack
}) {
  const config = DASHBOARD_CONFIG[role];

  if (!config) {
    return <p>Invalid dashboard role.</p>;
  }

  return (
    <main
      className="marketplace-dashboard"
      style={{ padding: '35px 0 80px' }}
    >
      <div className="container">

        <button
          type="button"
          className="btn-dark-glass-secondary"
          onClick={onBack}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Switch Role
        </button>

        <div className="tools-page-header mt-4">
          <div className="tools-title-badge">
            <i className={config.icon}></i>
            <span>AgroSphere Marketplace</span>
          </div>

          <h2 className="stitle">
            {config.title}
          </h2>

          <p className="sdesc">
            {config.subtitle}
          </p>
        </div>

        <div className="glass-card p-4 mb-4">
          <h5>Welcome, {profile?.fullName || 'Marketplace User'}!</h5>
          <p className="mb-0">
            {profile?.location || 'Your registered location'}
          </p>
        </div>

        <div className="row g-4">
          {config.modules.map((module) => (
            <div
              className="col-lg-3 col-md-6"
              key={module.title}
            >
              <div className="glass-card h-100 p-4">
                <div className="mb-3" style={{ fontSize: '28px' }}>
                  <i className={module.icon}></i>
                </div>

                <h5>{module.title}</h5>

                <p className="mb-0">
                  {module.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
