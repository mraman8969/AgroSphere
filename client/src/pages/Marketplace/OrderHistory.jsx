
import React, { useMemo, useState } from 'react';
import {
  getAllOrders,
  updateFarmerOrderStatus
} from './marketplaceStorage';

const normalizeStatus = (status) =>
  String(status || 'Pending').toLowerCase().replace(/[_-]/g, ' ');

const formatDate = (date) => {
  if (!date) return 'N/A';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return 'N/A';

  return parsedDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);

const getStatusClass = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === 'delivered' || normalized === 'completed') {
    return 'bg-success';
  }

  if (
    normalized === 'cancelled' ||
    normalized === 'rejected'
  ) {
    return 'bg-danger';
  }

  if (
    normalized === 'in transit' ||
    normalized === 'shipped' ||
    normalized === 'assigned'
  ) {
    return 'bg-info text-dark';
  }

  if (normalized === 'confirmed' || normalized === 'accepted') {
    return 'bg-primary';
  }

  return 'bg-warning text-dark';
};

export default function OrderHistory({ role, profile, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [allOrders, setAllOrders] = useState(() => getAllOrders());

  const userKey =
    profile?.email?.trim().toLowerCase() || 'guest';


  // Filter orders according to logged-in role.
  const orders = useMemo(() => {
    return allOrders.filter((order) => {
      if (role === 'buyer') {
        return (
          order.buyerKey?.trim().toLowerCase() === userKey
        );
      }

      if (role === 'farmer') {
        return order.items?.some(
          (item) =>
            item.farmerEmail?.trim().toLowerCase() === userKey
        );
      }

      if (role === 'logistics') {
        return normalizeStatus(order.status) === 'delivered';
      }

      return false;
    });
  }, [allOrders, role, userKey]);

  // Search, status and date filtering.
  const filteredOrders = useMemo(() => {
    const today = new Date();

    return orders.filter((order) => {
      const orderItems = order.items || [];

      const searchableText = [
        order.orderNumber,
        order.id,
        order.buyerName,
        order.buyerEmail,
        ...orderItems.map((item) => item.name),
        ...orderItems.map((item) => item.farmerName)
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        searchTerm.trim().toLowerCase()
      );

      const orderStatus = normalizeStatus(order.status);

      const matchesStatus =
        statusFilter === 'all' ||
        orderStatus === statusFilter;

      let matchesDate = true;

      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt);

        if (Number.isNaN(orderDate.getTime())) {
          matchesDate = false;
        } else {
          const days = Number(dateFilter);
          const cutoff = new Date(today);

          cutoff.setDate(today.getDate() - days);

          matchesDate = orderDate >= cutoff;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const sortedOrders = [...filteredOrders].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  const totalSpent = orders.reduce(
    (total, order) =>
      total + Number(order.totalAmount || 0),
    0
  );

  const handleFarmerStatusUpdate = (orderId, newStatus) => {
  const updatedOrders = updateFarmerOrderStatus(
    orderId,
    userKey,
    newStatus
  );

  setAllOrders(updatedOrders);

  const updatedSelectedOrder = updatedOrders.find(
    (order) => order.id === orderId
  );

  if (updatedSelectedOrder) {
    setSelectedOrder(updatedSelectedOrder);
  }
};

  const handleBack = () => {
    setSelectedOrder(null);

    if (onBack) {
      onBack();
    }
  };

  // Order Details Screen
  if (selectedOrder) {
    const items = selectedOrder.items || [];
    const address = selectedOrder.deliveryAddress || {};

    return (
      <main className="marketplace-dashboard">
        <div className="container py-4">

          <button
            type="button"
            className="btn-dark-glass-secondary mb-4"
            onClick={() => setSelectedOrder(null)}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Orders
          </button>

          <section className="marketplace-welcome-card mb-4">
            <div>
              <span className="marketplace-eyebrow">
                ORDER DETAILS
              </span>

              <h2>
                {selectedOrder.orderNumber || selectedOrder.id}
              </h2>

              <p>
                Placed on {formatDate(selectedOrder.createdAt)}
              </p>
            </div>

            <span
              className={`badge ${getStatusClass(selectedOrder.status)}`}
            >
              {selectedOrder.status || 'Pending'}
            </span>
          </section>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="mb-3">Ordered Products</h5>

              {items.length === 0 ? (
                <p>No product information available.</p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={`${item.productId || item.name}-${index}`}
                    className="d-flex flex-wrap align-items-center justify-content-between border-bottom py-3 gap-3"
                  >
                    <div>
                      <h6 className="mb-1">{item.name}</h6>

                      <small className="text-muted">
                        Farmer: {item.farmerName || 'N/A'}
                      </small>

                      <br />

                      <small className="text-muted">
                        Quantity: {item.quantity} kg
                      </small>

                      <br />

                      <small className="text-muted">
                        Item Status: {item.status || selectedOrder.status || 'Pending'}
                      </small>

                      <small className="text-muted">
  Item Status: {item.status || selectedOrder.status || 'Pending'}
</small>

{role === 'farmer' &&
  item.farmerEmail?.trim().toLowerCase() === userKey &&
  (item.status || 'Pending') === 'Pending' && (
    <div className="d-flex gap-2 mt-2">
      <button
        type="button"
        className="btn btn-sm btn-success"
        onClick={() =>
          handleFarmerStatusUpdate(selectedOrder.id, 'Accepted')
        }
      >
        Accept
      </button>

      <button
        type="button"
        className="btn btn-sm btn-danger"
        onClick={() =>
          handleFarmerStatusUpdate(selectedOrder.id, 'Rejected')
        }
      >
        Reject
      </button>
    </div>
  )}
                    </div>

                    <strong>
                      {formatCurrency(
                        Number(item.price) * Number(item.quantity)
                      )}
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="row g-4">

            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="mb-3">
                    <i className="fas fa-user me-2"></i>
                    Customer Information
                  </h5>

                  <p>
                    <strong>Name:</strong>{' '}
                    {selectedOrder.buyerName || 'N/A'}
                  </p>

                  <p>
                    <strong>Email:</strong>{' '}
                    {selectedOrder.buyerEmail || 'N/A'}
                  </p>

                  <p className="mb-0">
                    <strong>Phone:</strong>{' '}
                    {selectedOrder.buyerPhone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="mb-3">
                    <i className="fas fa-location-dot me-2"></i>
                    Delivery Address
                  </h5>

                  <p>{address.address || 'Address unavailable'}</p>

                  <p>
                    <strong>City:</strong> {address.city || 'N/A'}
                  </p>

                  <p className="mb-0">
                    <strong>PIN Code:</strong> {address.pincode || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h5>Payment Summary</h5>

              <div className="d-flex justify-content-between mt-3">
                <span>Subtotal</span>
                <strong>
                  {formatCurrency(selectedOrder.subtotal)}
                </strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <strong>Total Amount</strong>

                <strong className="text-success">
                  {formatCurrency(selectedOrder.totalAmount)}
                </strong>
              </div>
            </div>
          </div>

        </div>
      </main>
    );
  }

  // Main Order History Screen
  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">

          <div>
            <button
              type="button"
              className="btn-dark-glass-secondary mb-3"
              onClick={handleBack}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </button>

            <h2 className="mb-1">Order History</h2>

            <p className="text-muted mb-0">
              View and manage your marketplace orders.
            </p>
          </div>

        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">

          <div className="col-6 col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <small className="text-muted">Total Orders</small>

                <h3 className="mt-2 mb-0">
                  {orders.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <small className="text-muted">Pending Orders</small>

                <h3 className="mt-2 mb-0">
                  {orders.filter(
                    (order) =>
                      normalizeStatus(order.status) === 'pending'
                  ).length}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <small className="text-muted">
                  {role === 'buyer' ? 'Total Purchase Value' : 'Total Order Value'}
                </small>

                <h3 className="mt-2 mb-0">
                  {formatCurrency(totalSpent)}
                </h3>
              </div>
            </div>
          </div>

        </div>

        {/* Search and Filters */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">

            <div className="row g-3">

              <div className="col-md-5">
                <label className="form-label">
                  Search Orders
                </label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search order ID, product or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Order Status
                </label>

                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="assigned">Assigned</option>
                  <option value="in transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Date Range
                </label>

                <select
                  className="form-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
              </div>

            </div>

          </div>
        </div>

        {/* Orders List */}
        <div className="card shadow-sm">
          <div className="card-body">

            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">Your Orders</h5>

              <span className="text-muted">
                {sortedOrders.length} Results
              </span>
            </div>

            {sortedOrders.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-box-open fa-3x text-muted mb-3"></i>

                <h5>No Orders Found</h5>

                <p className="text-muted mb-0">
                  {orders.length === 0
                    ? 'Your marketplace orders will appear here.'
                    : 'Try changing your search or filters.'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Products</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedOrders.map((order) => (
                      <tr key={order.id || order.orderNumber}>
                        <td>
                          <strong>
                            {order.orderNumber || order.id}
                          </strong>
                        </td>

                        <td>
                          {(order.items || [])
                            .map((item) => item.name)
                            .filter(Boolean)
                            .join(', ') || 'N/A'}
                        </td>

                        <td>{formatDate(order.createdAt)}</td>

                        <td>
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td>
                          <span
                            className={`badge ${getStatusClass(order.status)}`}
                          >
                            {order.status || 'Pending'}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
