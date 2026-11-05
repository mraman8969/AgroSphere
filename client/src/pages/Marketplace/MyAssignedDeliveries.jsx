import React, { useMemo, useState } from 'react';
import { getAllOrders } from './marketplaceStorage';
import './MyAssignedDeliveries.css';

export default function MyAssignedDeliveries({ profile, onBack }) {
  const logisticsEmail = (
    profile?.email ||
    profile?.id ||
    'guest'
  ).trim().toLowerCase();

  const [orders, setOrders] = useState(() => getAllOrders() || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const refreshOrders = () => {
    setOrders(getAllOrders() || []);
  };

  const assignedOrders = useMemo(() => {
    return orders.filter((order) => {
      const assignedTo = (
        order.logisticsEmail ||
        ''
      ).trim().toLowerCase();

      return assignedTo === logisticsEmail;
    });
  }, [orders, logisticsEmail]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return assignedOrders.filter((order) => {
      const orderId = String(order.orderNumber || order.id || '').toLowerCase();
      const buyerName = String(
        order.buyerName || order.customerName || ''
      ).toLowerCase();

      const productNames = (order.items || [])
        .map((item) => item.productName || item.name || '')
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        buyerName.includes(query) ||
        productNames.includes(query);

      const status = String(order.logisticsStatus || 'Assigned');

      const matchesStatus =
        statusFilter === 'All' ||
        status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [assignedOrders, searchTerm, statusFilter]);

  const getStatusClass = (status) => {
    const normalized = String(status || 'Assigned')
      .toLowerCase()
      .replace(/\s+/g, '-');

    return normalized;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not available';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return 'Not available';

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getOrderValue = (order) => {
    const value = Number(order.totalAmount ?? order.total ?? 0);

    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="assigned-deliveries-page">
      <div className="assigned-deliveries-header">
        <div>
          <button
            type="button"
            className="assigned-back-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <p className="assigned-eyebrow">LOGISTICS MANAGEMENT</p>
          <h1>My Assigned Deliveries</h1>
          <p className="assigned-subtitle">
            View and manage orders assigned to your logistics account.
          </p>
        </div>

        <button
          type="button"
          className="assigned-refresh-button"
          onClick={refreshOrders}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="assigned-stats-grid">
        <div className="assigned-stat-card">
          <span className="assigned-stat-label">Total Assigned</span>
          <strong>{assignedOrders.length}</strong>
          <span className="assigned-stat-icon">📦</span>
        </div>

        <div className="assigned-stat-card">
          <span className="assigned-stat-label">Assigned</span>
          <strong>
            {
              assignedOrders.filter(
                (order) =>
                  String(order.logisticsStatus || 'Assigned').toLowerCase() ===
                  'assigned'
              ).length
            }
          </strong>
          <span className="assigned-stat-icon">🧾</span>
        </div>

        <div className="assigned-stat-card">
          <span className="assigned-stat-label">In Transit</span>
          <strong>
            {
              assignedOrders.filter((order) =>
                ['in transit', 'picked up'].includes(
                  String(order.logisticsStatus || '').toLowerCase()
                )
              ).length
            }
          </strong>
          <span className="assigned-stat-icon">🚚</span>
        </div>

        <div className="assigned-stat-card">
          <span className="assigned-stat-label">Delivered</span>
          <strong>
            {
              assignedOrders.filter(
                (order) =>
                  String(order.logisticsStatus || '').toLowerCase() ===
                  'delivered'
              ).length
            }
          </strong>
          <span className="assigned-stat-icon">✅</span>
        </div>
      </div>

      <div className="assigned-toolbar">
        <div className="assigned-search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search order, buyer or product..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by delivery status"
        >
          <option value="All">All Statuses</option>
          <option value="Assigned">Assigned</option>
          <option value="Picked Up">Picked Up</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      <div className="assigned-results-heading">
        <h2>Assigned Orders</h2>
        <span>{filteredOrders.length} orders</span>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="assigned-empty-state">
          <div className="assigned-empty-icon">📭</div>
          <h3>No assigned deliveries found</h3>
          <p>
            {assignedOrders.length === 0
              ? 'Orders you accept from New Assignments will appear here.'
              : 'Try changing your search term or status filter.'}
          </p>

          {assignedOrders.length === 0 && (
            <button
              type="button"
              onClick={onBack}
              className="assigned-empty-button"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      ) : (
        <div className="assigned-orders-list">
          {filteredOrders.map((order) => {
            const status = order.logisticsStatus || 'Assigned';
            const items = order.items || [];

            return (
              <article
                className="assigned-order-card"
                key={order.id || order.orderNumber}
              >
                <div className="assigned-order-top">
                  <div>
                    <span className="assigned-order-label">ORDER ID</span>
                    <h3>
                      #{order.orderNumber || order.id || 'N/A'}
                    </h3>
                  </div>

                  <span
                    className={`assigned-status-badge ${getStatusClass(status)}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="assigned-order-meta">
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
                    <span>Order Value</span>
                    <strong>{getOrderValue(order)}</strong>
                  </div>
                </div>

                <div className="assigned-address">
                  <span>DELIVERY ADDRESS</span>
                  <p>
                    {order.deliveryAddress ||
                      order.shippingAddress ||
                      order.address ||
                      'Delivery address not available'}
                  </p>
                </div>

                <div className="assigned-products">
                  <h4>Order Items ({items.length})</h4>

                  {items.length === 0 ? (
                    <p className="assigned-no-items">
                      No item details available.
                    </p>
                  ) : (
                    items.map((item, index) => (
                      <div
                        className="assigned-product-row"
                        key={item.id || item.productId || index}
                      >
                        <div>
                          <strong>
                            {item.productName || item.name || 'Product'}
                          </strong>
                          <span>
                            Quantity: {item.quantity || 1}
                          </span>
                        </div>

                        <span>
                          {Number(item.price || 0).toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="assigned-order-footer">
                  <span>
                    Assigned on: {formatDate(order.logisticsAssignedAt)}
                  </span>
                  <span>
                    Logistics: {order.logisticsName || profile?.name || 'You'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="assigned-demo-note">
        <strong>Note:</strong> Delivery information is currently loaded from
        the marketplace localStorage. Live dispatch, GPS tracking and backend
        synchronization are not connected yet.
      </div>
    </div>
  );
}