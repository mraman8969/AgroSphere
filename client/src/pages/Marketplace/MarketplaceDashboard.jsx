
import React from 'react';

import FarmerProducts from './FarmerProducts';
import BuyerProducts from './BuyerProducts';
import BuyerCart from './BuyerCart';
import Checkout from './Checkout';
import OrderHistory from './OrderHistory';
import SalesEarnings from './SalesEarnings';
import Inventory from './Inventory';
import TrackDeliveries from './TrackDeliveries';
import ManageReturns from './ManageReturns';
import PurchaseRequests from './PurchaseRequests';
import CustomerEnquiries from './CustomerEnquiries';
import Notifications from './Notifications';
import PriceAnalytics from './PriceAnalytics';

import {
  getUserCart,
  getAllOrders
} from './marketplaceStorage';

import './MarketplaceDashboard.css';

// ==========================================
// DASHBOARD CONFIGURATION
// ==========================================

const DASHBOARD_CONFIG = {
  farmer: {
    title: 'Farmer / FPO Dashboard',
    subtitle: 'Manage your agricultural business from one place.',
    icon: 'fas fa-tractor',

    sections: [
      {
        title: 'My Business',
        description: 'Manage your products and available stock.',
        modules: [
          {
            title: 'My Products',
            description: 'Add and manage your agricultural products.',
            icon: 'fas fa-boxes-stacked'
          },
          {
            title: 'Inventory',
            description: 'Monitor your available product stock.',
            icon: 'fas fa-warehouse'
          }
        ]
      },

      {
        title: 'Orders & Delivery',
        description: 'Manage buyer orders and monitor deliveries.',
        modules: [
          {
            title: 'Incoming Orders',
            description: 'View and manage orders from buyers.',
            icon: 'fas fa-shopping-bag'
          },
          {
            title: 'Track Deliveries',
            description: 'Track your deliveries on a live map.',
            icon: 'fas fa-map-location-dot'
          },
          {
            title: 'Manage Returns',
            description: 'Manage returned and cancelled orders.',
            icon: 'fas fa-rotate-left'
          }
        ]
      },

      {
        title: 'Growth & Insights',
        description: 'Understand your business performance.',
        modules: [
          {
            title: 'Sales & Earnings',
            description: 'Track your sales, revenue and earnings.',
            icon: 'fas fa-chart-line'
          },
          {
            title: 'Price Analytics',
            description: 'Explore market prices and price trends.',
            icon: 'fas fa-chart-column'
          }
        ]
      },

      {
        title: 'Customer Relations',
        description: 'Stay connected with your customers.',
        modules: [
          {
            title: 'Customer Enquiries',
            description: 'Respond to buyer questions and requests.',
            icon: 'fas fa-comments'
          },
          {
            title: 'Notifications',
            description: 'Get important order and payment updates.',
            icon: 'fas fa-bell'
          }
        ]
      },

      {
        title: 'Farm Supplies',
        description: 'Connect with agricultural suppliers.',
        modules: [
          {
            title: 'Purchase Requests',
            description: 'Contact dealers for seeds and fertilizers.',
            icon: 'fas fa-seedling'
          }
        ]
      }
    ]
  },

  // ==========================================
  // BUYER DASHBOARD
  // ==========================================

  buyer: {
    title: 'Buyer Dashboard',
    subtitle: 'Discover agricultural products and manage your purchases.',
    icon: 'fas fa-shopping-basket',

    sections: [
      {
        title: 'Shopping',
        description: 'Discover and select agricultural products.',
        modules: [
          {
            title: 'Browse Products',
            description: 'Explore fresh agricultural produce.',
            icon: 'fas fa-store'
          },
          {
            title: 'My Cart',
            description: 'Manage products you want to purchase.',
            icon: 'fas fa-cart-shopping'
          },
          {
            title: 'Wishlist',
            description: 'Save your favourite products.',
            icon: 'fas fa-heart'
          },
          {
            title: 'Compare Products',
            description: 'Compare products from different farmers.',
            icon: 'fas fa-scale-balanced'
          }
        ]
      },

      {
        title: 'My Orders',
        description: 'Manage and track your purchases.',
        modules: [
          {
            title: 'My Orders',
            description: 'View your current and previous orders.',
            icon: 'fas fa-box'
          },
          {
            title: 'Track Orders',
            description: 'Track your delivery on a live map.',
            icon: 'fas fa-map-location-dot'
          },
          {
            title: 'Reorder',
            description: 'Quickly order previously purchased products.',
            icon: 'fas fa-repeat'
          }
        ]
      },

      {
        title: 'Support & Feedback',
        description: 'Get help and share your experience.',
        modules: [
          {
            title: 'Raise Complaints',
            description: 'Report product or order-related issues.',
            icon: 'fas fa-headset'
          },
          {
            title: 'Return & Refund Requests',
            description: 'Submit eligible return and refund requests.',
            icon: 'fas fa-rotate-left'
          },
          {
            title: 'Reviews & Ratings',
            description: 'Rate products and share feedback.',
            icon: 'fas fa-star'
          }
        ]
      },

      {
        title: 'My Account',
        description: 'Manage your personal preferences.',
        modules: [
          {
            title: 'Saved Addresses',
            description: 'Manage your delivery addresses.',
            icon: 'fas fa-location-dot'
          },
          {
            title: 'Notifications',
            description: 'Receive order and delivery updates.',
            icon: 'fas fa-bell'
          }
        ]
      }
    ]
  },

  // ==========================================
  // LOGISTICS DASHBOARD
  // ==========================================

  logistics: {
    title: 'Logistics Dashboard',
    subtitle: 'Manage your transportation and delivery operations.',
    icon: 'fas fa-truck',

    sections: [
      {
        title: 'Delivery Management',
        description: 'Manage available and assigned deliveries.',
        modules: [
          {
            title: 'New Assignments',
            description: 'View new delivery assignments.',
            icon: 'fas fa-clipboard-list'
          },
          {
            title: 'Available Deliveries',
            description: 'Explore available delivery requests.',
            icon: 'fas fa-box-open'
          },
          {
            title: 'My Assigned Deliveries',
            description: 'View your assigned delivery orders.',
            icon: 'fas fa-list-check'
          }
        ]
      },

      {
        title: 'Active Operations',
        description: 'Manage your ongoing delivery operations.',
        modules: [
          {
            title: 'Active Deliveries',
            description: 'Track active deliveries on a live map.',
            icon: 'fas fa-route'
          },
          {
            title: 'Route Optimization',
            description: 'Find efficient routes for deliveries.',
            icon: 'fas fa-map'
          },
          {
            title: 'Update Delivery Status',
            description: 'Update pickup and delivery progress.',
            icon: 'fas fa-truck-fast'
          },
          {
            title: 'Delivery Proof',
            description: 'Submit OTP, photo or delivery confirmation.',
            icon: 'fas fa-file-circle-check'
          }
        ]
      },

      {
        title: 'Fleet Management',
        description: 'Manage your vehicle and location.',
        modules: [
          {
            title: 'Vehicle Management',
            description: 'Manage vehicle details and availability.',
            icon: 'fas fa-truck'
          },
          {
            title: 'Live Location Sharing',
            description: 'Share your GPS location during delivery.',
            icon: 'fas fa-location-crosshairs'
          }
        ]
      },

      {
        title: 'Performance & Support',
        description: 'Review your work and resolve issues.',
        modules: [
          {
            title: 'My Earnings',
            description: 'Track your delivery earnings.',
            icon: 'fas fa-wallet'
          },
          {
            title: 'Delivery History',
            description: 'Review completed deliveries.',
            icon: 'fas fa-clock-rotate-left'
          },
          {
            title: 'Report Issues',
            description: 'Report delivery or transportation problems.',
            icon: 'fas fa-triangle-exclamation'
          },
          {
            title: 'Notifications',
            description: 'Receive assignment and delivery updates.',
            icon: 'fas fa-bell'
          }
        ]
      }
    ]
  }
};


// ==========================================
// MODULES WITHOUT IMPLEMENTED FUNCTIONALITY
// ==========================================

const PLACEHOLDER_MODULES = [
  // Farmer
  //All modules for farmers are implemented, so no placeholders here.

  // Buyer
  'Track Orders',
  'Wishlist',
  'Compare Products',
  'Reorder',
  'Raise Complaints',
  'Return & Refund Requests',
  'Reviews & Ratings',
  'Saved Addresses',

  // Logistics
  'New Assignments',
  'Available Deliveries',
  'My Assigned Deliveries',
  'Active Deliveries',
  'Route Optimization',
  'Update Delivery Status',
  'Delivery Proof',
  'Vehicle Management',
  'Live Location Sharing',
  'My Earnings',
  'Report Issues'
];


// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

export default function MarketplaceDashboard({
  role,
  profile,
  onBack
}) {

  const config = DASHBOARD_CONFIG[role];

  const [activeModule, setActiveModule] = React.useState(null);
  const [placedOrder, setPlacedOrder] = React.useState(null);

  const userKey =
    profile?.email?.trim().toLowerCase() || 'guest';

  const recentOrders = getAllOrders()
  .filter((order) => {
    if (role === 'buyer') {
      return order.buyerKey?.trim().toLowerCase() === userKey;
    }

    if (role === 'farmer') {
      return order.items?.some(
        (item) =>
          item.farmerEmail?.trim().toLowerCase() === userKey
      );
    }

    if (role === 'logistics') {
      return order.status?.toLowerCase() === 'delivered';
    }

    return false;
  })
  .sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  )
  .slice(0, 5);

  // Combine all role-specific modules
  const allModules = config
    ? config.sections.flatMap(section => section.modules)
    : [];

  if (!config) {
    return <p>Invalid dashboard role.</p>;
  }


  // ==========================================
  // NAVIGATION FUNCTIONS
  // ==========================================

  const goToDashboard = () => {
    setActiveModule(null);
  };

  const handleModuleClick = (moduleTitle) => {
    setActiveModule(moduleTitle);
  };


  // ==========================================
  // FARMER - MY PRODUCTS
  // ==========================================

  if (
    role === 'farmer' &&
    activeModule === 'My Products'
  ) {
    return (
      <main className="marketplace-dashboard">
        <div className="container">

          <button
            type="button"
            className="btn-dark-glass-secondary mb-3"
            onClick={goToDashboard}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Dashboard
          </button>

          <FarmerProducts profile={profile} />

        </div>
      </main>
    );
  }


  // ==========================================
  // BUYER - BROWSE PRODUCTS
  // ==========================================

  if (
    role === 'buyer' &&
    activeModule === 'Browse Products'
  ) {
    return (
      <BuyerProducts
        userKey={userKey}
        onBack={goToDashboard}
      />
    );
  }


  // ==========================================
  // BUYER - MY CART
  // ==========================================

  if (
    role === 'buyer' &&
    activeModule === 'My Cart'
  ) {
    return (
      <BuyerCart
        userKey={userKey}
        onBack={goToDashboard}
        onCheckout={() => {
          setActiveModule('Checkout');
        }}
      />
    );
  }


  // ==========================================
  // BUYER - CHECKOUT
  // ==========================================

  if (
    role === 'buyer' &&
    activeModule === 'Checkout'
  ) {
    return (
      <Checkout
        cart={getUserCart(userKey)}
        userKey={userKey}
        profile={profile}
        onBack={() => setActiveModule('My Cart')}
        onOrderPlaced={(order) => {
          setPlacedOrder(order);
          setActiveModule('Order Confirmation');
        }}
      />
    );
  }


  // ==========================================
  // BUYER - ORDER CONFIRMATION
  // ==========================================

  if (
    role === 'buyer' &&
    activeModule === 'Order Confirmation'
  ) {
    return (
      <main className="marketplace-dashboard">
        <div className="container py-4">

          <div className="card shadow-sm">
            <div className="card-body text-center p-5">

              <i className="fas fa-check-circle fa-3x text-success mb-3"></i>

              <h3>Order Placed Successfully!</h3>

              <p>
                Your order has been recorded successfully.
              </p>

              {placedOrder && (
                <p>
                  Order ID:{' '}
                  <strong>
                    {placedOrder.orderNumber}
                  </strong>
                </p>
              )}

              <button
                type="button"
                className="btn-dark-glass-secondary me-2"
                onClick={() => {
                  setActiveModule('My Orders');
                }}
              >
                View My Orders
              </button>

              <button
                type="button"
                className="btn-dark-glass-secondary"
                onClick={goToDashboard}
              >
                Back to Dashboard
              </button>

            </div>
          </div>

        </div>
      </main>
    );
  }


  // ==========================================
  // ORDER HISTORY
  // ==========================================

  if (
    (role === 'farmer' && activeModule === 'Incoming Orders') ||
    (role === 'buyer' && activeModule === 'My Orders') ||
    (role === 'logistics' && activeModule === 'Delivery History')
  ) {
    return (
      <OrderHistory
        role={role}
        profile={profile}
        onBack={goToDashboard}
      />
    );
  }
  
  
  // ==========================================
  // FARMER - SALES & EARNINGS
  // ==========================================

  if (
    role === 'farmer' &&
    activeModule === 'Sales & Earnings'
  ) {
    return (
      <main className="marketplace-dashboard">
        <div className="container py-4">

          <button
            type="button"
            className="btn-dark-glass-secondary mb-4"
            onClick={goToDashboard}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Dashboard
          </button>

          <SalesEarnings userKey={userKey} />

        </div>
      </main>
    );
  }

  // FARMER - INVENTORY MANAGEMENT
if (
  role === 'farmer' &&
  activeModule === 'Inventory'
) {
  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">
        <button
          type="button"
          className="btn-dark-glass-secondary mb-4"
          onClick={goToDashboard}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>

        <Inventory profile={profile} />
      </div>
    </main>
  );
}

// FARMER - TRACK DELIVERIES
if (
  role === 'farmer' &&
  activeModule === 'Track Deliveries'
) {
  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">
        <button
          type="button"
          className="btn-dark-glass-secondary mb-4"
          onClick={goToDashboard}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>

        <TrackDeliveries />
      </div>
    </main>
  );
}

// FARMER - MANAGE RETURNS
if (
  role === 'farmer' &&
  activeModule === 'Manage Returns'
) {
  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">
        <button
          type="button"
          className="btn-dark-glass-secondary mb-4"
          onClick={goToDashboard}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>

        <ManageReturns />
      </div>
    </main>
  );
}

// FARMER - PURCHASE REQUESTS
if (
  role === 'farmer' &&
  activeModule === 'Purchase Requests'
) {
  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">
        <button
          type="button"
          className="btn-dark-glass-secondary mb-4"
          onClick={goToDashboard}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>

        <PurchaseRequests />
      </div>
    </main>
  );
}

// FARMER - CUSTOMER ENQUIRIES
if (
  role === 'farmer' &&
  activeModule === 'Customer Enquiries'
) {
  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">
        <button
          type="button"
          className="btn-dark-glass-secondary mb-4"
          onClick={goToDashboard}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>

        <CustomerEnquiries />
      </div>
    </main>
  );
}

// FARMER - NOTIFICATIONS
if (
  role === 'farmer' &&
  activeModule === 'Notifications'
) {
  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">
        <button
          type="button"
          className="btn-dark-glass-secondary mb-4"
          onClick={goToDashboard}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>

        <Notifications />
      </div>
    </main>
  );
}

// FARMER - PRICE ANALYTICS
if (
  role === 'farmer' &&
  activeModule === 'Price Analytics'
) {
  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">
        <button
          type="button"
          className="btn-dark-glass-secondary mb-4"
          onClick={goToDashboard}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>

        <PriceAnalytics profile={profile} />
      </div>
    </main>
  );
}

  // ==========================================
  // PLACEHOLDER MODULES
  // ==========================================

  if (PLACEHOLDER_MODULES.includes(activeModule)) {

    const currentModule = allModules.find(
      (module) => module.title === activeModule
    );

    return (
      <main className="marketplace-dashboard">
        <div className="container py-4">

          <button
            type="button"
            className="btn-dark-glass-secondary mb-4"
            onClick={goToDashboard}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Dashboard
          </button>

          <section className="marketplace-welcome-card">

            <div>

              <span className="marketplace-eyebrow">
                AGROSPHERE MARKETPLACE
              </span>

              <h2>{activeModule}</h2>

              <p>{currentModule?.description}</p>

              <p>
                This module is accessible. Its complete
                functionality will be connected in the
                next implementation phase.
              </p>

            </div>

            <div className="marketplace-welcome-icon">
              <i className={currentModule?.icon}></i>
            </div>

          </section>

        </div>
      </main>
    );
  }


  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <main className="marketplace-dashboard">
      <div className="container">


        {/* TOPBAR */}

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


        {/* WELCOME SECTION */}

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


        {/* ORGANIZED MODULE SECTIONS */}

        <section className="marketplace-dashboard-section">

          <div className="marketplace-section-heading">

            <div>
              <h5>Explore Your Workspace</h5>

              <p>
                All your marketplace tools, organized for easy access.
              </p>
            </div>

            <span>
              {allModules.length} Modules
            </span>

          </div>


          {/* CATEGORY-WISE MODULES */}

          {config.sections.map((section) => (

            <div
              className="marketplace-module-group mb-4"
              key={section.title}
            >

              {/* CATEGORY HEADING */}

              <div className="marketplace-section-heading mb-3">

                <div>
                  <h5>{section.title}</h5>

                  <p>{section.description}</p>
                </div>

                <span>
                  {section.modules.length} Features
                </span>

              </div>


              {/* MODULE CARDS */}

              <div className="row g-3">

                {section.modules.map((module) => (

                  <div
                    className="col-6 col-lg-3"
                    key={module.title}
                  >

                    <button
                      type="button"
                      className="marketplace-module-card"
                      onClick={() => handleModuleClick(module.title)}
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

            </div>

          ))}

        </section>


        {/* RECENT ORDERS */}

        <section className="marketplace-dashboard-section marketplace-recent-orders">

          <div className="marketplace-section-heading">

            <div>
              <h5>Recent Orders</h5>

              <p>
                Keep track of your latest marketplace orders.
              </p>
            </div>

            <button
              type="button"
              className="marketplace-view-all-btn"
              onClick={() => {

                if (role === 'buyer') {
                  setActiveModule('My Orders');

                } else if (role === 'farmer') {
                  setActiveModule('Incoming Orders');

                } else {
                  setActiveModule('Delivery History');
                }

              }}
            >
              View All Orders

              <i className="fas fa-arrow-right ms-2"></i>
            </button>

          </div>


          
{recentOrders.length === 0 ? (
  <div className="marketplace-orders-empty">
    <i className="fas fa-box-open"></i>

    <div>
      <h6>No recent orders yet</h6>
      <p className="mb-0">
        Your recent marketplace orders will appear here.
      </p>
    </div>
  </div>
) : (
  <div className="row g-3">
    {recentOrders.map((order) => {
      const visibleItems =
        role === 'farmer'
          ? (order.items || []).filter(
              (item) =>
                item.farmerEmail?.trim().toLowerCase() === userKey
            )
          : order.items || [];

      const farmerOrderValue = visibleItems.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) * Number(item.quantity || 0),
        0
      );

      return (
        <div className="col-12" key={order.id}>
          <div className="card shadow-sm">
            <div className="card-body">

              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">

                <div>
                  <h6 className="mb-1">
                    {order.orderNumber || order.id}
                  </h6>

                  <small className="text-muted">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </small>
                </div>

                <span className="badge bg-warning text-dark">
                  {role === 'farmer'
                    ? visibleItems.every(
                        (item) => item.status === 'Accepted'
                      )
                      ? 'Accepted'
                      : visibleItems.every(
                          (item) => item.status === 'Rejected'
                        )
                        ? 'Rejected'
                        : 'Pending / Partial'
                    : order.status || 'Pending'}
                </span>

              </div>

              <hr />

              <div>
                <strong>Products:</strong>

                <p className="mb-2">
                  {visibleItems.map((item) => item.name).join(', ')}
                </p>
              </div>

              {role === 'farmer' && (
                <p className="mb-0">
                  <strong>Order Value:</strong>{' '}
                  ₹{farmerOrderValue.toLocaleString('en-IN')}
                </p>
              )}

              {role === 'buyer' && (
                <p className="mb-0">
                  <strong>Total:</strong>{' '}
                  ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                </p>
              )}

            </div>
          </div>
        </div>
      );
    })}
  </div>
)}


        </section>


        {/* BOTTOM NOTE */}

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
