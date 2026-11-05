
import React, { useEffect, useMemo, useState } from 'react';
import { getAllOrders, saveAllOrders } from './marketplaceStorage';
import './NewAssignments.css';

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDate = (date) => {
  if (!date) return 'Date unavailable';

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getAddress = (address) => {
  if (!address) return 'Delivery address not available';

  if (typeof address === 'string') return address;

  return [
    address.address,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(', ') || 'Delivery address not available';
};

export default function NewAssignments({ profile, onBack }) {
  const logisticsEmail = String(
    profile?.email || profile?.id || 'guest'
  ).trim().toLowerCase();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const loadOrders = () => {
    const allOrders = getAllOrders();
    setOrders(Array.isArray(allOrders) ? allOrders : []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const availableAssignments = useMemo(() => {
    return orders.filter((order) => {
      const acceptedItems = (order.items || []).filter(
        (item) =>
          String(item.status || '').toLowerCase() === 'accepted'
      );

      const rejectedBy = order.logisticsRejectedBy || [];

      const alreadyAssigned =
        Boolean(order.logisticsEmail) ||
        ['assigned', 'picked up', 'in transit', 'delivered'].includes(
          String(order.logisticsStatus || '').toLowerCase()
        );

      const rejectedByCurrentUser = rejectedBy.some(
        (email) =>
          String(email).trim().toLowerCase() === logisticsEmail
      );

      return (
        acceptedItems.length > 0 &&
        !alreadyAssigned &&
        !rejectedByCurrentUser
      );
    });
  }, [orders, logisticsEmail]);

  const filteredAssignments = useMemo(() => {
    return availableAssignments.filter((order) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        String(order.orderNumber || order.id || '')
          .toLowerCase()
          .includes(query) ||
        String(order.buyerName || '')
          .toLowerCase()
          .includes(query) ||
        (order.items || []).some((item) =>
          String(item.name || '')
            .toLowerCase()
            .includes(query)
        );

      const matchesFilter =
        filter === 'All' ||
        (filter === 'Recent' &&
          new Date(order.createdAt || 0).getTime() >=
            Date.now() - 7 * 24 * 60 * 60 * 1000);

      return matchesSearch && matchesFilter;
    });
  }, [availableAssignments, search, filter]);

  const handleAssignment = (orderId, action) => {
    const updatedOrders = getAllOrders();

    const orderIndex = updatedOrders.findIndex(
      (order) =>
        String(order.id) === String(orderId) ||
        String(order.orderNumber) === String(orderId)
    );

    if (orderIndex === -1) {
      setMessage('Order could not be found. Please refresh.');
      return;
    }

    const order = { ...updatedOrders[orderIndex] };

    if (action === 'accept') {
      if (order.logisticsEmail) {
        setMessage('This order has already been assigned.');
        loadOrders();
        return;
      }

      order.logisticsStatus = 'Assigned';
      order.logisticsEmail = logisticsEmail;
      order.logisticsName = profile?.fullName || 'Logistics Partner';
      order.logisticsAssignedAt = new Date().toISOString();

      order.logisticsRejectedBy = (
        order.logisticsRejectedBy || []
      ).filter(
        (email) =>
          String(email).trim().toLowerCase() !== logisticsEmail
      );

      setMessage('Delivery assignment accepted successfully.');
    } else {
      order.logisticsRejectedBy = [
        ...(order.logisticsRejectedBy || []).filter(
          (email) =>
            String(email).trim().toLowerCase() !== logisticsEmail
        ),
        logisticsEmail,
      ];

      setMessage('Assignment rejected. It remains available to other logistics partners.');
    }

    updatedOrders[orderIndex] = order;
    saveAllOrders(updatedOrders);
    loadOrders();
  };

  const totalAcceptedProducts = (order) =>
    (order.items || []).filter(
      (item) =>
        String(item.status || '').toLowerCase() === 'accepted'
    );

  return (
    <main className="marketplace-dashboard">
      <div className="container py-4 new-assignments-page">

        <div className="new-assignments-header">
          <div>
            <span className="marketplace-eyebrow">
              AGROSPHERE LOGISTICS
            </span>

            <h2>New Assignments</h2>

            <p>
              Review available delivery orders and accept the
              assignments you can fulfil.
            </p>
          </div>

          <button
            type="button"
            className="btn-dark-glass-secondary"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Dashboard
          </button>
        </div>

        <div className="new-assignments-stats">
          <div className="new-assignment-stat-card">
            <span className="stat-icon">
              <i className="fas fa-clipboard-list"></i>
            </span>
            <div>
              <h3>{availableAssignments.length}</h3>
              <p>Available Assignments</p>
            </div>
          </div>

          <div className="new-assignment-stat-card">
            <span className="stat-icon">
              <i className="fas fa-box"></i>
            </span>
            <div>
              <h3>
                {availableAssignments.reduce(
                  (total, order) =>
                    total + totalAcceptedProducts(order).length,
                  0
                )}
              </h3>
              <p>Accepted Products</p>
            </div>
          </div>
        </div>

        <div className="new-assignments-toolbar">
          <div className="assignment-search">
            <i className="fas fa-search"></i>
            <input
              type="search"
              placeholder="Search order, buyer or product..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter assignments"
          >
            <option value="All">All Assignments</option>
            <option value="Recent">Last 7 Days</option>
          </select>
        </div>

        {message && (
          <div className="assignment-feedback" role="status">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage('')}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {filteredAssignments.length === 0 ? (
          <div className="assignments-empty-state">
            <i className="fas fa-truck-fast"></i>
            <h4>No New Assignments</h4>
            <p>
              There are currently no matching delivery assignments.
              New orders will appear here after farmers accept them.
            </p>
          </div>
        ) : (
          <div className="new-assignments-list">
            {filteredAssignments.map((order) => {
              const acceptedItems = totalAcceptedProducts(order);

              return (
                <article
                  className="new-assignment-card"
                  key={order.id || order.orderNumber}
                >
                  <div className="assignment-card-top">
                    <div>
                      <span className="assignment-label">
                        DELIVERY REQUEST
                      </span>
                      <h4>
                        {order.orderNumber || order.id}
                      </h4>
                      <small>
                        <i className="far fa-calendar me-2"></i>
                        {formatDate(order.createdAt)}
                      </small>
                    </div>

                    <span className="assignment-status">
                      Available
                    </span>
                  </div>

                  <div className="assignment-route">
                    <div className="route-point">
                      <span className="route-dot pickup-dot"></span>
                      <div>
                        <small>Pickup information</small>
                        <strong>
                          {acceptedItems
                            .map((item) => item.farmerName)
                            .filter(Boolean)
                            .filter(
                              (name, index, list) =>
                                list.indexOf(name) === index
                            )
                            .join(', ') || 'Farmer details available'}
                        </strong>
                        <p>
                          Pickup address to be coordinated with farmer
                        </p>
                      </div>
                    </div>

                    <div className="route-point">
                      <span className="route-dot delivery-dot"></span>
                      <div>
                        <small>Delivery destination</small>
                        <strong>
                          {order.buyerName || 'Marketplace Buyer'}
                        </strong>
                        <p>{getAddress(order.deliveryAddress)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="assignment-products">
                    <div className="assignment-section-title">
                      <i className="fas fa-box-open"></i>
                      Accepted Products ({acceptedItems.length})
                    </div>

                    {acceptedItems.map((item, index) => (
                      <div
                        className="assignment-product-row"
                        key={item.productId || item.id || index}
                      >
                        <div>
                          <strong>{item.name || 'Agricultural Product'}</strong>
                          <small>
                            {item.quantity || 0} {item.unit || 'units'}
                          </small>
                        </div>

                        <strong>
                          {formatPrice(
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="assignment-card-footer">
                    <div className="assignment-order-value">
                      <small>Order value</small>
                      <strong>
                        {formatPrice(
                          acceptedItems.reduce(
                            (total, item) =>
                              total +
                              Number(item.price || 0) *
                              Number(item.quantity || 0),
                            0
                          )
                        )}
                      </strong>
                    </div>

                    <div className="assignment-actions">
                      <button
                        type="button"
                        className="assignment-reject-btn"
                        onClick={() =>
                          handleAssignment(
                            order.id || order.orderNumber,
                            'reject'
                          )
                        }
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        className="assignment-accept-btn"
                        onClick={() =>
                          handleAssignment(
                            order.id || order.orderNumber,
                            'accept'
                          )
                        }
                      >
                        <i className="fas fa-check me-2"></i>
                        Accept Assignment
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="assignment-demo-note">
          <i className="fas fa-circle-info"></i>
          Assignment information currently uses the marketplace's
          shared local storage. Live dispatch and GPS services are
          not connected.
        </div>

      </div>
    </main>
  );
}
