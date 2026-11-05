
import React, { useMemo, useState } from 'react';
import { getAllOrders, saveAllOrders } from './marketplaceStorage';
import './UpdateDeliveryStatus.css';

const STATUS_FLOW = {
  Assigned: 'Picked Up',
  'Picked Up': 'In Transit',
  'In Transit': 'Delivered',
};

const STATUS_STEPS = ['Assigned', 'Picked Up', 'In Transit', 'Delivered'];

const getOrderId = (order) =>
  order.orderNumber || order.id || 'N/A';

const getBuyerName = (order) =>
  order.buyerName || order.customerName || 'Customer';

const getDeliveryAddress = (order) =>
  order.deliveryAddress ||
  order.shippingAddress ||
  order.address ||
  'Delivery address unavailable';

const getProducts = (order) =>
  Array.isArray(order.items) ? order.items : [];

const UpdateDeliveryStatus = ({ profile, onBack }) => {
  const [orders, setOrders] = useState(() => getAllOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState('');

  const logisticsEmail = (
    profile?.email || profile?.user?.email || ''
  ).toLowerCase();

  const assignedOrders = useMemo(() => {
    return orders.filter((order) => {
      const assignedEmail = (
        order.logisticsEmail || ''
      ).toLowerCase();

      return (
        assignedEmail === logisticsEmail &&
        STATUS_STEPS.includes(order.logisticsStatus)
      );
    });
  }, [orders, logisticsEmail]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return assignedOrders.filter((order) => {
      const matchesSearch =
        !query ||
        String(getOrderId(order)).toLowerCase().includes(query) ||
        getBuyerName(order).toLowerCase().includes(query) ||
        getDeliveryAddress(order).toLowerCase().includes(query) ||
        getProducts(order).some((item) =>
          String(item.productName || item.name || '')
            .toLowerCase()
            .includes(query)
        );

      const matchesStatus =
        statusFilter === 'All' ||
        order.logisticsStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assignedOrders, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    assigned: assignedOrders.filter(
      (order) => order.logisticsStatus === 'Assigned'
    ).length,
    pickedUp: assignedOrders.filter(
      (order) => order.logisticsStatus === 'Picked Up'
    ).length,
    inTransit: assignedOrders.filter(
      (order) => order.logisticsStatus === 'In Transit'
    ).length,
    delivered: orders.filter((order) =>
      (order.logisticsEmail || '').toLowerCase() === logisticsEmail &&
      order.logisticsStatus === 'Delivered'
    ).length,
  }), [assignedOrders, orders, logisticsEmail]);

  const updateStatus = (orderId, nextStatus) => {
    const updatedOrders = orders.map((order) => {
      const sameOrder =
        String(order.id) === String(orderId) ||
        String(order.orderNumber) === String(orderId);

      if (
        !sameOrder ||
        (order.logisticsEmail || '').toLowerCase() !== logisticsEmail
      ) {
        return order;
      }

      const expectedNextStatus = STATUS_FLOW[order.logisticsStatus];

      if (expectedNextStatus !== nextStatus) {
        return order;
      }

      return {
        ...order,
        logisticsStatus: nextStatus,
        logisticsStatusUpdatedAt: new Date().toISOString(),
        ...(nextStatus === 'Picked Up'
          ? { pickedUpAt: new Date().toISOString() }
          : {}),
        ...(nextStatus === 'Delivered'
          ? { deliveredAt: new Date().toISOString() }
          : {}),
      };
    });

    saveAllOrders(updatedOrders);
    setOrders(updatedOrders);

    setMessage(`Delivery status updated to "${nextStatus}".`);

    setTimeout(() => setMessage(''), 3000);
  };

  const getNextAction = (status) => {
    const nextStatus = STATUS_FLOW[status];

    if (!nextStatus) return null;

    const labels = {
      'Picked Up': 'Confirm Pickup',
      'In Transit': 'Start Transit',
      Delivered: 'Mark as Delivered',
    };

    return {
      nextStatus,
      label: labels[nextStatus],
    };
  };

  return (
    <div className="update-delivery-page">
      <header className="update-delivery-header">
        <div>
          <button
            className="uds-back-button"
            onClick={onBack}
            type="button"
          >
            ← Back to Dashboard
          </button>

          <span className="uds-eyebrow">LOGISTICS MANAGEMENT</span>
          <h1>Update Delivery Status</h1>
          <p>
            Manage your assigned shipments and keep delivery
            progress up to date.
          </p>
        </div>
      </header>

      {message && (
        <div className="uds-success-message">
          ✓ {message}
        </div>
      )}

      <section className="uds-stats-grid">
        <div className="uds-stat-card">
          <span>Assigned</span>
          <strong>{stats.assigned}</strong>
        </div>

        <div className="uds-stat-card">
          <span>Picked Up</span>
          <strong>{stats.pickedUp}</strong>
        </div>

        <div className="uds-stat-card">
          <span>In Transit</span>
          <strong>{stats.inTransit}</strong>
        </div>

        <div className="uds-stat-card">
          <span>Delivered</span>
          <strong>{stats.delivered}</strong>
        </div>
      </section>

      <section className="uds-orders-panel">
        <div className="uds-panel-header">
          <div>
            <h2>Assigned Shipments</h2>
            <p>
              {assignedOrders.length} shipment(s) assigned to you
            </p>
          </div>
        </div>

        <div className="uds-toolbar">
          <input
            type="search"
            placeholder="Search order, customer, address or product..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="Picked Up">Picked Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="uds-empty-state">
            <div className="uds-empty-icon">📦</div>
            <h3>No shipments found</h3>
            <p>
              No assigned shipments match your current search
              or status filter.
            </p>
          </div>
        ) : (
          <div className="uds-order-list">
            {filteredOrders.map((order, index) => {
              const orderId = getOrderId(order);
              const status = order.logisticsStatus;
              const action = getNextAction(status);

              return (
                <article
                  className="uds-order-card"
                  key={`${order.id || order.orderNumber || 'order'}-${index}`}
                >
                  <div className="uds-order-top">
                    <div>
                      <span className="uds-order-label">ORDER ID</span>
                      <h3>#{orderId}</h3>
                    </div>

                    <span
                      className={`uds-status-badge uds-status-${status
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="uds-order-details">
                    <div>
                      <span>Customer</span>
                      <strong>{getBuyerName(order)}</strong>
                    </div>

                    <div>
                      <span>Delivery Address</span>
                      <strong>{getDeliveryAddress(order)}</strong>
                    </div>

                    <div>
                      <span>Products</span>
                      <strong>
                        {getProducts(order).length} item(s)
                      </strong>
                    </div>
                  </div>

                  <div className="uds-progress">
                    {STATUS_STEPS.map((step, stepIndex) => {
                      const currentIndex = STATUS_STEPS.indexOf(status);
                      const completed = stepIndex <= currentIndex;

                      return (
                        <div
                          className={`uds-progress-step ${
                            completed ? 'completed' : ''
                          }`}
                          key={step}
                        >
                          <div className="uds-progress-dot">
                            {completed ? '✓' : stepIndex + 1}
                          </div>
                          <span>{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="uds-order-footer">
                    <span className="uds-updated-time">
                      {order.logisticsStatusUpdatedAt
                        ? `Last updated: ${new Date(
                            order.logisticsStatusUpdatedAt
                          ).toLocaleString()}`
                        : 'Awaiting status update'}
                    </span>

                    {action ? (
                      <button
                        className="uds-update-button"
                        type="button"
                        onClick={() =>
                          updateStatus(order.id || order.orderNumber, action.nextStatus)
                        }
                      >
                        {action.label} →
                      </button>
                    ) : (
                      <span className="uds-delivered-label">
                        ✓ Delivery Completed
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default UpdateDeliveryStatus;
