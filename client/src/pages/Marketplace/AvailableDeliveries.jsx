
import React, { useEffect, useMemo, useState } from 'react';
import { getAllOrders, saveAllOrders } from './marketplaceStorage';
import './AvailableDeliveries.css';

const AvailableDeliveries = ({ profile, onBack }) => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');

  const email = profile?.email || profile?.user?.email || '';
  const logisticsName =
    profile?.name || profile?.fullName || 'Logistics Partner';

  const loadOrders = () => {
    const allOrders = getAllOrders() || [];
    setOrders(allOrders);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getOrderStatus = (order) =>
    String(order.status || order.orderStatus || '').toLowerCase();

  const availableOrders = useMemo(() => {
    return orders.filter(order => {
      const status = getOrderStatus(order);
      const assignedEmail = (order.logisticsEmail || '').toLowerCase();
      const rejectedBy = Array.isArray(order.logisticsRejectedBy)
        ? order.logisticsRejectedBy
        : [];

      const isAccepted =
        ['accepted', 'confirmed', 'processing'].includes(status);

      const isUnassigned =
        !assignedEmail && !order.logisticsStatus;

      const notRejected = !rejectedBy.some(
        rejectedEmail =>
          String(rejectedEmail).toLowerCase() === email.toLowerCase()
      );

      return isAccepted && isUnassigned && notRejected;
    });
  }, [orders, email]);

  const filteredOrders = useMemo(() => {
    return availableOrders.filter(order => {
      const orderNumber = String(order.orderNumber || order.id || '');
      const buyer = String(
        order.buyerName || order.customerName || order.userName || ''
      );
      const address = String(
        order.deliveryAddress?.address ||
        order.deliveryAddress ||
        order.shippingAddress?.address ||
        order.shippingAddress ||
        ''
      );

      const products = Array.isArray(order.items)
        ? order.items.map(item => item.productName || item.name || '').join(' ')
        : '';

      const searchableText =
        `${orderNumber} ${buyer} ${address} ${products}`.toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesFilter =
        filter === 'All' ||
        getOrderStatus(order) === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [availableOrders, search, filter]);

  const getOrderTotal = (order) => {
    const total = Number(
      order.totalAmount ?? order.total ?? order.grandTotal ?? 0
    );
    return Number.isFinite(total) ? total : 0;
  };

  const getItems = (order) => {
    if (Array.isArray(order.items)) return order.items;
    if (Array.isArray(order.orderItems)) return order.orderItems;
    return [];
  };

  const getAddress = (order) => {
    const address =
      order.deliveryAddress || order.shippingAddress || order.address || '';

    if (typeof address === 'string') return address;

    if (address && typeof address === 'object') {
      return [
        address.address,
        address.street,
        address.city,
        address.state,
        address.pincode
      ].filter(Boolean).join(', ');
    }

    return 'Delivery address not available';
  };

  const handleAccept = (selectedOrder) => {
    const orderKey = selectedOrder.id ?? selectedOrder.orderNumber;

    const latestOrders = getAllOrders() || [];
    const index = latestOrders.findIndex(order =>
      String(order.id ?? order.orderNumber) === String(orderKey)
    );

    if (index === -1) {
      setMessage('Order could not be found. Please refresh.');
      return;
    }

    const latestOrder = latestOrders[index];
    const assignedEmail = (latestOrder.logisticsEmail || '').toLowerCase();

    if (assignedEmail || latestOrder.logisticsStatus) {
      setMessage('This order has already been assigned.');
      loadOrders();
      return;
    }

    const rejectedBy = Array.isArray(latestOrder.logisticsRejectedBy)
      ? latestOrder.logisticsRejectedBy
      : [];

    const alreadyRejected = rejectedBy.some(
      rejectedEmail =>
        String(rejectedEmail).toLowerCase() === email.toLowerCase()
    );

    if (alreadyRejected) {
      setMessage('You have already rejected this order.');
      return;
    }

    latestOrders[index] = {
      ...latestOrder,
      logisticsStatus: 'Assigned',
      logisticsEmail: email,
      logisticsName,
      logisticsAssignedAt: new Date().toISOString()
    };

    saveAllOrders(latestOrders);
    setMessage('Delivery accepted and assigned to your account.');
    loadOrders();
  };

  const handleReject = (selectedOrder) => {
    const orderKey = selectedOrder.id ?? selectedOrder.orderNumber;

    const latestOrders = getAllOrders() || [];
    const index = latestOrders.findIndex(order =>
      String(order.id ?? order.orderNumber) === String(orderKey)
    );

    if (index === -1) {
      setMessage('Order could not be found. Please refresh.');
      return;
    }

    const latestOrder = latestOrders[index];

    if (
      latestOrder.logisticsEmail ||
      latestOrder.logisticsStatus
    ) {
      setMessage('This order has already been assigned.');
      loadOrders();
      return;
    }

    const rejectedBy = Array.isArray(latestOrder.logisticsRejectedBy)
      ? latestOrder.logisticsRejectedBy
      : [];

    if (!rejectedBy.some(
      rejectedEmail =>
        String(rejectedEmail).toLowerCase() === email.toLowerCase()
    )) {
      rejectedBy.push(email);
    }

    latestOrders[index] = {
      ...latestOrder,
      logisticsRejectedBy: rejectedBy
    };

    saveAllOrders(latestOrders);
    setMessage('Order rejected. It will no longer appear in your list.');
    loadOrders();
  };

  return (
    <div className="available-deliveries-page">
      <div className="available-deliveries-header">
        <div>
          <button
            className="available-deliveries-back"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
          <h1>Available Deliveries</h1>
          <p>Explore and accept delivery requests available in the marketplace.</p>
        </div>
      </div>

      <div className="available-deliveries-stats">
        <div className="available-deliveries-stat">
          <span>Available Orders</span>
          <strong>{availableOrders.length}</strong>
        </div>
        <div className="available-deliveries-stat">
          <span>Showing Results</span>
          <strong>{filteredOrders.length}</strong>
        </div>
      </div>

      {message && (
        <div className="available-deliveries-message" role="status">
          {message}
          <button onClick={() => setMessage('')} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className="available-deliveries-toolbar">
        <input
          type="search"
          placeholder="Search order, buyer, product or address..."
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        <select
          value={filter}
          onChange={event => setFilter(event.target.value)}
        >
          <option value="All">All Accepted Orders</option>
          <option value="accepted">Accepted</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="available-deliveries-empty">
          <h3>No available deliveries</h3>
          <p>
            New accepted orders will appear here when they are ready
            for logistics assignment.
          </p>
        </div>
      ) : (
        <div className="available-deliveries-list">
          {filteredOrders.map((order, index) => {
            const items = getItems(order);
            const orderNumber = order.orderNumber || order.id || `Order ${index + 1}`;
            const buyer =
              order.buyerName ||
              order.customerName ||
              order.userName ||
              'Buyer';

            return (
              <article
                className="available-delivery-card"
                key={String(order.id || order.orderNumber || index)}
              >
                <div className="available-delivery-card-header">
                  <div>
                    <span className="available-delivery-label">ORDER</span>
                    <h3>#{orderNumber}</h3>
                  </div>
                  <span className="available-delivery-status">
                    {order.status || order.orderStatus || 'Accepted'}
                  </span>
                </div>

                <div className="available-delivery-details">
                  <div>
                    <span>Buyer</span>
                    <strong>{buyer}</strong>
                  </div>
                  <div>
                    <span>Order Value</span>
                    <strong>₹{getOrderTotal(order).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span>Delivery Address</span>
                    <strong>{getAddress(order)}</strong>
                  </div>
                </div>

                <div className="available-delivery-products">
                  <span>Order Items</span>
                  {items.length > 0 ? (
                    <ul>
                      {items.map((item, itemIndex) => (
                        <li key={item.id || item.productId || itemIndex}>
                          {item.productName || item.name || 'Product'}
                          {item.quantity ? ` × ${item.quantity}` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Product details unavailable.</p>
                  )}
                </div>

                <div className="available-delivery-actions">
                  <button
                    className="available-delivery-reject"
                    onClick={() => handleReject(order)}
                  >
                    Reject
                  </button>
                  <button
                    className="available-delivery-accept"
                    onClick={() => handleAccept(order)}
                  >
                    Accept Delivery
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableDeliveries;
