import React, { useMemo, useState } from 'react';
import { getAllOrders } from './marketplaceStorage';
import './ActiveDeliveries.css';

export default function ActiveDeliveries({ profile, onBack }) {
  const logisticsEmail = (
    profile?.email ||
    profile?.id ||
    'guest'
  ).trim().toLowerCase();

  const [orders, setOrders] = useState(() => getAllOrders() || []);
  const [searchTerm, setSearchTerm] = useState('');

  const refreshOrders = () => {
    setOrders(getAllOrders() || []);
  };

  const activeOrders = useMemo(() => {
    return orders.filter((order) => {
      const assignedTo = String(order.logisticsEmail || '')
        .trim()
        .toLowerCase();

      const status = String(order.logisticsStatus || '')
        .trim()
        .toLowerCase();

      return (
        assignedTo === logisticsEmail &&
        ['picked up', 'in transit'].includes(status)
      );
    });
  }, [orders, logisticsEmail]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return activeOrders;

    return activeOrders.filter((order) => {
      const orderId = String(
        order.orderNumber || order.id || ''
      ).toLowerCase();

      const buyerName = String(
        order.buyerName || order.customerName || ''
      ).toLowerCase();

      const address = String(
        order.deliveryAddress ||
        order.shippingAddress ||
        order.address ||
        ''
      ).toLowerCase();

      const products = (order.items || [])
        .map((item) => item.productName || item.name || '')
        .join(' ')
        .toLowerCase();

      return (
        orderId.includes(query) ||
        buyerName.includes(query) ||
        address.includes(query) ||
        products.includes(query)
      );
    });
  }, [activeOrders, searchTerm]);

  const pickedUpCount = activeOrders.filter(
    (order) =>
      String(order.logisticsStatus || '').toLowerCase() === 'picked up'
  ).length;

  const inTransitCount = activeOrders.filter(
    (order) =>
      String(order.logisticsStatus || '').toLowerCase() === 'in transit'
  ).length;

  const formatDate = (value) => {
    if (!value) return 'Not available';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Not available';

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="active-deliveries-page">
      <header className="active-deliveries-header">
        <div>
          <button
            type="button"
            className="active-back-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <p className="active-eyebrow">LOGISTICS MANAGEMENT</p>
          <h1>Active Deliveries</h1>
          <p className="active-subtitle">
            Monitor orders that have been picked up or are currently in transit.
          </p>
        </div>

        <button
          type="button"
          className="active-refresh-button"
          onClick={refreshOrders}
        >
          ↻ Refresh
        </button>
      </header>

      <section className="active-stats-grid">
        <div className="active-stat-card">
          <span>Total Active</span>
          <strong>{activeOrders.length}</strong>
          <small>Currently in progress</small>
        </div>

        <div className="active-stat-card">
          <span>Picked Up</span>
          <strong>{pickedUpCount}</strong>
          <small>Collected from seller</small>
        </div>

        <div className="active-stat-card">
          <span>In Transit</span>
          <strong>{inTransitCount}</strong>
          <small>On the way to buyer</small>
        </div>
      </section>

      <section className="active-toolbar">
        <div className="active-search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search order, buyer, product or address..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <span className="active-result-count">
          {filteredOrders.length} active orders
        </span>
      </section>

      {filteredOrders.length === 0 ? (
        <section className="active-empty-state">
          <div className="active-empty-icon">🚚</div>
          <h2>No active deliveries</h2>
          <p>
            {activeOrders.length === 0
              ? 'Orders will appear here after their delivery status changes to Picked Up or In Transit.'
              : 'No active delivery matches your search.'}
          </p>

          {activeOrders.length === 0 && (
            <button type="button" onClick={onBack}>
              Back to Dashboard
            </button>
          )}
        </section>
      ) : (
        <section className="active-delivery-list">
          {filteredOrders.map((order) => {
            const status = String(
              order.logisticsStatus || 'Picked Up'
            );

            const items = order.items || [];

            return (
              <article
                className="active-delivery-card"
                key={order.id || order.orderNumber}
              >
                <div className="active-card-header">
                  <div>
                    <span className="active-order-label">ORDER ID</span>
                    <h2>
                      #{order.orderNumber || order.id || 'N/A'}
                    </h2>
                  </div>

                  <span
                    className={`active-status-badge ${
                      status.toLowerCase() === 'in transit'
                        ? 'in-transit'
                        : 'picked-up'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="active-delivery-details">
                  <div>
                    <span>Buyer</span>
                    <strong>
                      {order.buyerName || order.customerName || 'Buyer'}
                    </strong>
                  </div>

                  <div>
                    <span>Order Date</span>
                    <strong>
                      {formatDate(order.createdAt || order.orderDate)}
                    </strong>
                  </div>

                  <div>
                    <span>Assigned To</span>
                    <strong>
                      {order.logisticsName || profile?.name || 'You'}
                    </strong>
                  </div>
                </div>

                <div className="active-route-block">
                  <div className="active-route-point">
                    <span className="active-route-dot pickup-dot" />
                    <div>
                      <small>PICKUP</small>
                      <p>
                        Pickup location to be coordinated with farmer
                      </p>
                    </div>
                  </div>

                  <div className="active-route-line" />

                  <div className="active-route-point">
                    <span className="active-route-dot delivery-dot" />
                    <div>
                      <small>DELIVERY DESTINATION</small>
                      <p>
                        {order.deliveryAddress ||
                          order.shippingAddress ||
                          order.address ||
                          'Delivery address not available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="active-items-section">
                  <h3>Shipment Items ({items.length})</h3>

                  {items.length === 0 ? (
                    <p className="active-no-items">
                      No item details available.
                    </p>
                  ) : (
                    items.map((item, index) => (
                      <div
                        className="active-item-row"
                        key={item.id || item.productId || index}
                      >
                        <span>
                          {item.productName || item.name || 'Product'}
                        </span>
                        <strong>Qty: {item.quantity || 1}</strong>
                      </div>
                    ))
                  )}
                </div>

                <footer className="active-card-footer">
                  <span>
                    Assigned: {formatDate(order.logisticsAssignedAt)}
                  </span>
                  <span>
                    Status updates are managed in Update Delivery Status.
                  </span>
                </footer>
              </article>
            );
          })}
        </section>
      )}

      <div className="active-demo-note">
        <strong>Demo limitation:</strong> This module reads delivery status
        from localStorage. Live GPS coordinates, map routing and automatic
        location updates are not connected.
      </div>
    </div>
  );
}