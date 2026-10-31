
import React from 'react';
import FarmerProducts from './FarmerProducts';
import OrderHistory from './OrderHistory';
import './MarketplaceDashboard.css';
import BuyerProducts from './BuyerProducts';

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

export default function MarketplaceDashboard({ role, profile, onBack }) {
  const config = DASHBOARD_CONFIG[role];
  const [activeModule, setActiveModule] = React.useState(null);

  if (!config) return <p>Invalid dashboard role.</p>;

  // Farmer Products
  if (role === 'farmer' && activeModule === 'My Products') {
    return (
      <main className="marketplace-dashboard">
        <div className="container">
          <button
            type="button"
            className="btn-dark-glass-secondary mb-3"
            onClick={() => setActiveModule(null)}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Dashboard
          </button>
          <FarmerProducts profile={profile} />
        </div>
      </main>
    );
  }
  // Browse Products
if (role === 'buyer' && activeModule === 'Browse Products') {
  return (
    <BuyerProducts
      userKey={profile?.email?.trim().toLowerCase() || 'guest'}
      onBack={() => setActiveModule(null)}
    />
  );
}

// My Cart
if (role === 'buyer' && activeModule === 'My Cart') {
  return (
    <main className="marketplace-dashboard">
      <div className="container">
        <button
          type="button"
          className="btn-dark-glass-secondary mb-3"
          onClick={() => setActiveModule(null)}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>

        <h3>My Cart</h3>
        <p>Your selected products will appear here.</p>
      </div>
    </main>
  );
}

  // Order History
  if (activeModule === 'Order History') {
    return (
      <OrderHistory
        role={role}
        onBack={() => setActiveModule(null)}
      />
    );
  }

const handleModuleClick = (moduleTitle) => {
  if (
    role === 'farmer' &&
    moduleTitle === 'My Products'
  ) {
    setActiveModule('My Products');
  }

  if (
    role === 'buyer' &&
    moduleTitle === 'Browse Products'
  ) {
    setActiveModule('Browse Products');
  }

  if (
    role === 'buyer' &&
    moduleTitle === 'My Cart'
  ) {
    setActiveModule('My Cart');
  }

  if (
    (role === 'farmer' && moduleTitle === 'Incoming Orders') ||
    (role === 'buyer' && moduleTitle === 'My Orders') ||
    (role === 'logistics' && moduleTitle === 'Delivery History')
  ) {
    setActiveModule('Order History');
  }
};

  return (
    <main className="marketplace-dashboard">
      <div className="container">

        <div className="marketplace-topbar">
          <button
            type="button"
            className="btn-dark-glass-secondary"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Switch Role
          </button>

          <span className="marketplace-role-label">
            <i className={config.icon}></i>
            {role === 'farmer' ? 'Farmer / FPO' : role}
          </span>
        </div>

        <section className="marketplace-welcome-card">
          <div>
            <span className="marketplace-eyebrow">
              AGROSPHERE MARKETPLACE
            </span>
            <h2>
              Welcome, {profile?.fullName || 'Marketplace User'}!
            </h2>
            <p>{config.subtitle}</p>
            <span className="marketplace-location">
              <i className="fas fa-location-dot me-2"></i>
              {profile?.location || 'Your registered location'}
            </span>
          </div>

          <div className="marketplace-welcome-icon">
            <i className={config.icon}></i>
          </div>
        </section>

        {/* Quick Access */}
        <section className="marketplace-dashboard-section">
          <div className="marketplace-section-heading">
            <div>
              <h5>Quick Access</h5>
              <p>Access your essential marketplace features.</p>
            </div>
            <span>{config.modules.length} Modules</span>
          </div>

          <div className="row g-3">
            {config.modules.map((module) => (
              <div className="col-6 col-lg-3" key={module.title}>
                <button
                  type="button"
                  className="marketplace-module-card"
                  onClick={() => handleModuleClick(module.title)}
                  disabled={
                    !(
                      (role === 'farmer' && module.title === 'My Products') ||
                      (role === 'farmer' && module.title === 'Incoming Orders') ||
                      (role === 'buyer' && module.title === 'My Orders') ||
                      (role === 'logistics' && module.title === 'Delivery History')
                    )
                  }
                >
                  <span className="marketplace-module-icon">
                    <i className={module.icon}></i>
                  </span>
                  <span className="marketplace-module-title">
                    {module.title}
                  </span>
                  <span className="marketplace-module-description">
                    {module.description}
                  </span>
                  <span className="marketplace-module-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section className="marketplace-dashboard-section marketplace-recent-orders">
          <div className="marketplace-section-heading">
            <div>
              <h5>Recent Orders</h5>
              <p>Keep track of your latest marketplace orders.</p>
            </div>

            <button
              type="button"
              className="marketplace-view-all-btn"
              onClick={() => setActiveModule('Order History')}
            >
              View All Orders
              <i className="fas fa-arrow-right ms-2"></i>
            </button>
          </div>

          <div className="marketplace-orders-empty">
            <i className="fas fa-box-open"></i>
            <div>
              <h6>No recent orders yet</h6>
              <p className="mb-0">
                Your recent orders will appear here once
                marketplace orders are available.
              </p>
            </div>
          </div>
        </section>

        <section className="marketplace-bottom-note">
          <i className="fas fa-leaf"></i>
          <span>
            Your agricultural marketplace, all in one place.
          </span>
        </section>

      </div>
    </main>
  );
}
