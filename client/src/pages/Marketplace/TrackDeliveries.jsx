
import React, { useMemo, useState } from 'react';
import './TrackDeliveries.css';

const demoDeliveries = [
  {
    id: 'AGRO-20261101',
    customer: 'Rahul Sharma',
    phone: '9876543210',
    address: 'Sector 15, Noida, Uttar Pradesh',
    pincode: '201301',
    items: [
      { name: 'Fresh Tomatoes', quantity: '50 KG' },
      { name: 'Potatoes', quantity: '30 KG' },
    ],
    date: '01 Nov 2026',
    status: 'In Transit',
    driver: 'Demo Delivery Partner',
    vehicle: 'UP 16 AB 1234',
    eta: '25–35 minutes',
    progress: 75,
  },
  {
    id: 'AGRO-20261102',
    customer: 'Amit Verma',
    phone: '9876501234',
    address: 'Indirapuram, Ghaziabad, Uttar Pradesh',
    pincode: '201014',
    items: [{ name: 'Fresh Onions', quantity: '100 KG' }],
    date: '02 Nov 2026',
    status: 'Ready for Pickup',
    driver: 'Not assigned',
    vehicle: 'Not assigned',
    eta: 'Awaiting pickup',
    progress: 50,
  },
  {
    id: 'AGRO-20261030',
    customer: 'Priya Singh',
    phone: '9876512345',
    address: 'Raj Nagar, Ghaziabad, Uttar Pradesh',
    pincode: '201002',
    items: [{ name: 'Fresh Cauliflower', quantity: '40 KG' }],
    date: '30 Oct 2026',
    status: 'Delivered',
    driver: 'Demo Delivery Partner',
    vehicle: 'UP 14 CD 5678',
    eta: 'Delivered',
    progress: 100,
  },
  {
    id: 'AGRO-20261029',
    customer: 'Vikas Kumar',
    phone: '9876523456',
    address: 'Sector 62, Noida, Uttar Pradesh',
    pincode: '201309',
    items: [{ name: 'Green Peas', quantity: '25 KG' }],
    date: '29 Oct 2026',
    status: 'Accepted',
    driver: 'Not assigned',
    vehicle: 'Not assigned',
    eta: 'Not available',
    progress: 25,
  },
];

const trackingStages = [
  'Accepted',
  'Ready for Pickup',
  'In Transit',
  'Delivered',
];

const getStatusClass = (status) => {
  switch (status) {
    case 'Delivered':
      return 'delivered';
    case 'In Transit':
      return 'transit';
    case 'Ready for Pickup':
      return 'pickup';
    default:
      return 'accepted';
  }
};

const TrackDeliveries = () => {
  const [deliveries] = useState(demoDeliveries);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDelivery, setSelectedDelivery] = useState(
    demoDeliveries[0]
  );

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const matchesSearch = [
        delivery.id,
        delivery.customer,
        delivery.address,
        delivery.pincode,
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        delivery.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, searchTerm, statusFilter]);

  const stats = {
    total: deliveries.length,
    transit: deliveries.filter(
      (item) => item.status === 'In Transit'
    ).length,
    pickup: deliveries.filter(
      (item) => item.status === 'Ready for Pickup'
    ).length,
    delivered: deliveries.filter(
      (item) => item.status === 'Delivered'
    ).length,
  };

  const currentStageIndex = selectedDelivery
    ? trackingStages.indexOf(selectedDelivery.status)
    : -1;

  return (
    <div className="track-deliveries-page">
      <div className="track-deliveries-header">
        <div>
          <span className="tracking-eyebrow">
            LOGISTICS MANAGEMENT
          </span>
          <h1>Track Deliveries</h1>
          <p>
            Monitor your orders and keep track of every delivery.
          </p>
        </div>

        <div className="tracking-live-indicator">
          <span className="tracking-live-dot"></span>
          Demo Tracking Mode
        </div>
      </div>

      {/* Summary Cards */}
      <div className="tracking-stats-grid">
        <div className="tracking-stat-card">
          <span className="tracking-stat-icon">📦</span>
          <div>
            <p>Total Deliveries</p>
            <h2>{stats.total}</h2>
          </div>
        </div>

        <div className="tracking-stat-card">
          <span className="tracking-stat-icon">🚚</span>
          <div>
            <p>In Transit</p>
            <h2>{stats.transit}</h2>
          </div>
        </div>

        <div className="tracking-stat-card">
          <span className="tracking-stat-icon">⏳</span>
          <div>
            <p>Ready for Pickup</p>
            <h2>{stats.pickup}</h2>
          </div>
        </div>

        <div className="tracking-stat-card">
          <span className="tracking-stat-icon">✓</span>
          <div>
            <p>Delivered</p>
            <h2>{stats.delivered}</h2>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="tracking-toolbar">
        <div className="tracking-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search order, customer or PIN code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter deliveries by status"
        >
          <option value="All">All Statuses</option>
          {trackingStages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>

      <div className="tracking-content-grid">
        {/* Delivery List */}
        <section className="tracking-list-panel">
          <div className="tracking-section-heading">
            <div>
              <h2>Delivery Orders</h2>
              <p>{filteredDeliveries.length} orders found</p>
            </div>
          </div>

          <div className="tracking-delivery-list">
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((delivery) => (
                <button
                  type="button"
                  key={delivery.id}
                  className={`tracking-order-card ${
                    selectedDelivery?.id === delivery.id
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="tracking-order-top">
                    <strong>{delivery.id}</strong>
                    <span
                      className={`tracking-status ${getStatusClass(
                        delivery.status
                      )}`}
                    >
                      {delivery.status}
                    </span>
                  </div>

                  <h3>{delivery.customer}</h3>
                  <p className="tracking-order-address">
                    {delivery.address}
                  </p>

                  <div className="tracking-order-footer">
                    <span>{delivery.date}</span>
                    <span>View Details →</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="tracking-empty-state">
                <span>📦</span>
                <h3>No deliveries found</h3>
                <p>Try changing your search or status filter.</p>
              </div>
            )}
          </div>
        </section>

        {/* Selected Delivery Details */}
        <section className="tracking-detail-panel">
          {selectedDelivery ? (
            <>
              <div className="tracking-detail-heading">
                <div>
                  <span className="tracking-eyebrow">
                    ORDER DETAILS
                  </span>
                  <h2>{selectedDelivery.id}</h2>
                </div>

                <span
                  className={`tracking-status ${getStatusClass(
                    selectedDelivery.status
                  )}`}
                >
                  {selectedDelivery.status}
                </span>
              </div>

              {/* Progress Timeline */}
              <div className="tracking-progress-section">
                <h3>Delivery Progress</h3>

                <div className="tracking-timeline">
                  {trackingStages.map((stage, index) => {
                    const completed = index <= currentStageIndex;

                    return (
                      <div
                        key={stage}
                        className={`tracking-timeline-step ${
                          completed ? 'completed' : ''
                        }`}
                      >
                        <div className="tracking-timeline-marker">
                          {completed ? '✓' : index + 1}
                        </div>
                        <span>{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Map Preview */}
              <div className="tracking-map-card">
                <div className="tracking-map-heading">
                  <div>
                    <h3>Live Location</h3>
                    <p>Map integration will be connected later</p>
                  </div>
                  <span className="tracking-map-tag">
                    GPS Preview
                  </span>
                </div>

                <div className="tracking-map-placeholder">
                  <div className="tracking-map-pin">📍</div>
                  <h3>Live Map Tracking</h3>
                  <p>
                    Driver location and route will appear here
                    after backend integration.
                  </p>
                  <span>Map integration pending</span>
                </div>

                <div className="tracking-eta">
                  <div>
                    <span>Estimated Arrival</span>
                    <strong>{selectedDelivery.eta}</strong>
                  </div>
                  <div>
                    <span>Delivery Status</span>
                    <strong>{selectedDelivery.status}</strong>
                  </div>
                </div>
              </div>

              {/* Driver Details */}
              <div className="tracking-info-card">
                <h3>Delivery Partner</h3>
                <div className="tracking-info-row">
                  <span>Partner</span>
                  <strong>{selectedDelivery.driver}</strong>
                </div>
                <div className="tracking-info-row">
                  <span>Vehicle Number</span>
                  <strong>{selectedDelivery.vehicle}</strong>
                </div>
                <div className="tracking-info-row">
                  <span>Contact</span>
                  <strong>Available after integration</strong>
                </div>
              </div>

              {/* Customer and Address */}
              <div className="tracking-info-card">
                <h3>Customer & Delivery Address</h3>
                <div className="tracking-info-row">
                  <span>Customer</span>
                  <strong>{selectedDelivery.customer}</strong>
                </div>
                <div className="tracking-info-row">
                  <span>Phone</span>
                  <strong>{selectedDelivery.phone}</strong>
                </div>
                <div className="tracking-info-row">
                  <span>Address</span>
                  <strong>{selectedDelivery.address}</strong>
                </div>
                <div className="tracking-info-row">
                  <span>PIN Code</span>
                  <strong>{selectedDelivery.pincode}</strong>
                </div>
              </div>

              {/* Order Items */}
              <div className="tracking-info-card">
                <h3>Order Items</h3>
                {selectedDelivery.items.map((item, index) => (
                  <div
                    className="tracking-info-row"
                    key={`${item.name}-${index}`}
                  >
                    <span>{item.name}</span>
                    <strong>{item.quantity}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="tracking-empty-state">
              <h3>Select a delivery</h3>
              <p>Choose an order to see its tracking details.</p>
            </div>
          )}
        </section>
      </div>

      <div className="tracking-demo-notice">
        <strong>Demo Mode:</strong> The displayed orders, driver details,
        statuses and ETA are sample frontend data. Actual order data,
        GPS tracking and live ETA will be connected through backend APIs.
      </div>
    </div>
  );
};

export default TrackDeliveries;
