import React, { useMemo, useState } from 'react';
import { getAllOrders } from './marketplaceStorage';
import './RouteOptimization.css';

export default function RouteOptimization({ profile, onBack }) {
  const logisticsEmail = (
    profile?.email ||
    profile?.id ||
    'guest'
  ).trim().toLowerCase();

  const [orders, setOrders] = useState(() => getAllOrders() || []);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const assignedOrders = useMemo(() => {
    return orders.filter((order) => {
      const assignedTo = String(order.logisticsEmail || '')
        .trim()
        .toLowerCase();

      const status = String(order.logisticsStatus || '')
        .trim()
        .toLowerCase();

      return (
        assignedTo === logisticsEmail &&
        ['assigned', 'picked up', 'in transit'].includes(status)
      );
    });
  }, [orders, logisticsEmail]);

  const refreshOrders = () => {
    setOrders(getAllOrders() || []);
    setSelectedOrders([]);
  };

  const toggleOrder = (orderId) => {
    setSelectedOrders((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId]
    );
  };

  const selectAll = () => {
    if (selectedOrders.length === assignedOrders.length) {
      setSelectedOrders([]);
      return;
    }

    setSelectedOrders(
      assignedOrders.map((order) => order.id || order.orderNumber)
    );
  };

  const selectedOrderDetails = useMemo(() => {
    return assignedOrders.filter((order) =>
      selectedOrders.includes(order.id || order.orderNumber)
    );
  }, [assignedOrders, selectedOrders]);

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });

  const getDestination = (order) =>
    order.deliveryAddress ||
    order.shippingAddress ||
    order.address ||
    'Delivery address not available';

  return (
    <div className="route-optimization-page">
      <header className="route-page-header">
        <div>
          <button
            type="button"
            className="route-back-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <p className="route-eyebrow">LOGISTICS MANAGEMENT</p>
          <h1>Route Optimization</h1>
          <p className="route-subtitle">
            Select assigned orders and organize their delivery stops.
          </p>
        </div>

        <button
          type="button"
          className="route-refresh-button"
          onClick={refreshOrders}
        >
          ↻ Refresh Orders
        </button>
      </header>

      <section className="route-overview-grid">
        <div className="route-overview-card">
          <span>Available Orders</span>
          <strong>{assignedOrders.length}</strong>
          <small>Assigned to your account</small>
        </div>

        <div className="route-overview-card">
          <span>Selected Stops</span>
          <strong>{selectedOrders.length}</strong>
          <small>Orders selected for planning</small>
        </div>

        <div className="route-overview-card">
          <span>Selected Order Value</span>
          <strong>
            {formatCurrency(
              selectedOrderDetails.reduce(
                (total, order) =>
                  total + Number(order.totalAmount ?? order.total ?? 0),
                0
              )
            )}
          </strong>
          <small>Combined order value</small>
        </div>
      </section>

      <section className="route-planner-layout">
        <div className="route-orders-panel">
          <div className="route-panel-header">
            <div>
              <h2>Select Deliveries</h2>
              <p>Choose the orders you want to include in your route.</p>
            </div>

            {assignedOrders.length > 0 && (
              <button type="button" onClick={selectAll}>
                {selectedOrders.length === assignedOrders.length
                  ? 'Clear Selection'
                  : 'Select All'}
              </button>
            )}
          </div>

          {assignedOrders.length === 0 ? (
            <div className="route-empty-state">
              <span>📦</span>
              <h3>No assigned orders</h3>
              <p>
                Accept orders from New Assignments to make them available
                for route planning.
              </p>
            </div>
          ) : (
            <div className="route-order-list">
              {assignedOrders.map((order) => {
                const orderId = order.id || order.orderNumber;
                const isSelected = selectedOrders.includes(orderId);

                return (
                  <label
                    className={`route-order-option ${
                      isSelected ? 'selected' : ''
                    }`}
                    key={orderId}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOrder(orderId)}
                    />

                    <div className="route-order-option-content">
                      <div className="route-order-option-top">
                        <strong>
                          #{order.orderNumber || order.id || 'N/A'}
                        </strong>

                        <span
                          className={`route-order-status ${
                            String(order.logisticsStatus || '')
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                          }`}
                        >
                          {order.logisticsStatus || 'Assigned'}
                        </span>
                      </div>

                      <span className="route-buyer-name">
                        {order.buyerName || order.customerName || 'Buyer'}
                      </span>

                      <span className="route-order-destination">
                        {getDestination(order)}
                      </span>

                      <span className="route-order-value">
                        {formatCurrency(
                          order.totalAmount ?? order.total ?? 0
                        )}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="route-plan-panel">
          <div className="route-panel-header">
            <div>
              <h2>Route Plan</h2>
              <p>Your selected delivery stops.</p>
            </div>
          </div>

          {selectedOrderDetails.length === 0 ? (
            <div className="route-empty-plan">
              <span>🗺️</span>
              <h3>No stops selected</h3>
              <p>
                Select one or more assigned orders to build a delivery
                stop list.
              </p>
            </div>
          ) : (
            <div className="route-stop-list">
              <div className="route-start-point">
                <span className="route-stop-marker start-marker">S</span>
                <div>
                  <strong>Route Start</strong>
                  <small>Starting location not configured</small>
                </div>
              </div>

              {selectedOrderDetails.map((order, index) => (
                <div
                  className="route-stop-item"
                  key={order.id || order.orderNumber}
                >
                  <div className="route-stop-marker">
                    {index + 1}
                  </div>

                  <div className="route-stop-information">
                    <strong>
                      Order #{order.orderNumber || order.id || 'N/A'}
                    </strong>
                    <span>
                      {order.buyerName || order.customerName || 'Buyer'}
                    </span>
                    <small>{getDestination(order)}</small>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove order ${order.orderNumber || order.id}`}
                    onClick={() =>
                      toggleOrder(order.id || order.orderNumber)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="route-end-point">
                <span className="route-stop-marker end-marker">E</span>
                <div>
                  <strong>Route End</strong>
                  <small>Final destination not configured</small>
                </div>
              </div>
            </div>
          )}

          <div className="route-plan-notice">
            <strong>Planning preview only</strong>
            <p>
              Stops are displayed in selection order. This module does not
              calculate the shortest route, distance, travel time or traffic.
            </p>
          </div>
        </div>
      </section>

      <div className="route-demo-note">
        <strong>Integration status:</strong> This is a local route-planning
        interface. Map provider, geocoding, GPS and route optimization
        services are not connected.
      </div>
    </div>
  );
}