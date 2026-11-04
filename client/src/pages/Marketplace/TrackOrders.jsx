
import React, { useMemo, useState } from 'react';
import { getAllOrders } from './marketplaceStorage';
import './TrackOrders.css';

const normalizeStatus = (status) =>
  String(status || 'Pending')
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .trim();

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return 'N/A';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return 'N/A';

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusMeta = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === 'delivered' || normalized === 'completed') {
    return { label: 'Delivered', className: 'success', step: 3 };
  }

  if (normalized === 'in transit' || normalized === 'shipped') {
    return { label: 'In Transit', className: 'info', step: 2 };
  }

  if (
    normalized === 'accepted' ||
    normalized === 'confirmed' ||
    normalized === 'partially accepted'
  ) {
    return {
      label: normalized === 'partially accepted'
        ? 'Partially Accepted'
        : 'Accepted',
      className: 'primary',
      step: 1
    };
  }

  if (
    normalized === 'rejected' ||
    normalized === 'cancelled' ||
    normalized === 'canceled'
  ) {
    return { label: 'Cancelled / Rejected', className: 'danger', step: -1 };
  }

  return { label: 'Pending', className: 'warning', step: 0 };
};

const getItemStatus = (item, order) =>
  item.status || order.status || 'Pending';

export default function TrackOrders({ profile, onBack }) {
  const userKey = profile?.email?.trim().toLowerCase() || 'guest';

  const [allOrders, setAllOrders] = useState(() => getAllOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const refreshOrders = () => {
    setAllOrders(getAllOrders());
  };

  const buyerOrders = useMemo(() => {
    return allOrders
      .filter(
        (order) =>
          order.buyerKey?.trim().toLowerCase() === userKey
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
  }, [allOrders, userKey]);

  const filteredOrders = useMemo(() => {
    return buyerOrders.filter((order) => {
      const searchableText = [
        order.orderNumber,
        order.id,
        ...(order.items || []).map((item) => item.name),
        ...(order.items || []).map((item) => item.farmerName)
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        searchTerm.trim().toLowerCase()
      );

      const normalized = normalizeStatus(order.status);

      const matchesStatus =
        statusFilter === 'all' ||
        normalized === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [buyerOrders, searchTerm, statusFilter]);

  const totalOrders = buyerOrders.length;

  const activeOrders = buyerOrders.filter((order) =>
    ['pending', 'accepted', 'confirmed', 'in transit', 'shipped',
      'partially accepted'].includes(normalizeStatus(order.status))
  ).length;

  const deliveredOrders = buyerOrders.filter(
    (order) => normalizeStatus(order.status) === 'delivered'
  ).length;

  const handleBack = () => {
    setSelectedOrder(null);
    if (onBack) onBack();
  };

  if (selectedOrder) {
    const currentOrder = allOrders.find(
      (order) => order.id === selectedOrder.id
    ) || selectedOrder;

    const items = currentOrder.items || [];
    const address = currentOrder.deliveryAddress || {};

    const orderStatus = getStatusMeta(currentOrder.status);

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
                ORDER TRACKING
              </span>

              <h2 className="mt-2">
                {currentOrder.orderNumber || currentOrder.id}
              </h2>

              <p className="mb-0">
                Ordered on {formatDate(currentOrder.createdAt)}
              </p>
            </div>

            <span className={`badge bg-${orderStatus.className}`}>
              {orderStatus.label}
            </span>
          </section>

          <section className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="mb-4">Order Progress</h5>

              {orderStatus.step === -1 ? (
                <div className="alert alert-danger mb-0">
                  <i className="fas fa-circle-xmark me-2"></i>
                  This order has been cancelled or rejected.
                </div>
              ) : (
                <div className="row text-center g-3">
                  {[
                    { label: 'Order Placed', icon: 'fa-receipt', step: 0 },
                    { label: 'Accepted', icon: 'fa-circle-check', step: 1 },
                    { label: 'In Transit', icon: 'fa-truck', step: 2 },
                    { label: 'Delivered', icon: 'fa-house-circle-check', step: 3 }
                  ].map((stage) => (
                    <div className="col-6 col-md-3" key={stage.step}>
                      <div
                        className={`p-3 rounded border ${
                          orderStatus.step >= stage.step
                            ? 'border-success'
                            : ''
                        }`}
                      >
                        <i
                          className={`fas ${stage.icon} fs-4 mb-2 ${
                            orderStatus.step >= stage.step
                              ? 'text-success'
                              : 'text-muted'
                          }`}
                        ></i>

                        <div className="small fw-semibold">
                          {stage.label}
                        </div>

                        <small className="text-muted">
                          {orderStatus.step >= stage.step
                            ? 'Completed'
                            : 'Pending'}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-muted small mt-3 mb-0">
                Progress is based on the order status currently saved
                in marketplace storage.
              </p>
            </div>
          </section>

          <div className="row g-4">

            <div className="col-lg-8">
              <section className="card shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="mb-3">Ordered Products</h5>

                  {items.length === 0 ? (
                    <p className="text-muted">
                      No product details available.
                    </p>
                  ) : (
                    items.map((item, index) => {
                      const itemStatus = getStatusMeta(
                        getItemStatus(item, currentOrder)
                      );

                      return (
                        <div
                          key={`${item.productId || item.name}-${index}`}
                          className="d-flex justify-content-between align-items-center flex-wrap gap-3 border-bottom py-3"
                        >
                          <div>
                            <h6 className="mb-1">{item.name || 'Product'}</h6>

                            <small className="text-muted d-block">
                              Farmer: {item.farmerName || 'N/A'}
                            </small>

                            <small className="text-muted d-block">
                              Quantity: {item.quantity || 0} kg
                            </small>

                            <span className={`badge bg-${itemStatus.className} mt-2`}>
                              {itemStatus.label}
                            </span>
                          </div>

                          <strong>
                            {formatCurrency(
                              Number(item.price) * Number(item.quantity)
                            )}
                          </strong>
                        </div>
                      );
                    })
                  )}

                  <div className="d-flex justify-content-between mt-4">
                    <span>Order Total</span>
                    <h5 className="mb-0">
                      {formatCurrency(currentOrder.totalAmount)}
                    </h5>
                  </div>
                </div>
              </section>
            </div>

            <div className="col-lg-4">
              <section className="card shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="mb-3">Delivery Address</h5>

                  <h6>{currentOrder.buyerName || 'Buyer'}</h6>

                  <p className="text-muted mb-2">
                    {[
                      address.addressLine,
                      address.address,
                      address.city,
                      address.state,
                      address.pincode
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Address not available'}
                  </p>

                  <p className="mb-0">
                    <i className="fas fa-phone me-2"></i>
                    {currentOrder.phone || 'Phone not available'}
                  </p>
                </div>
              </section>

              <section className="card shadow-sm">
                <div className="card-body p-4">
                  <h5 className="mb-3">Order Information</h5>

                  <p className="mb-2">
                    <strong>Order ID:</strong>
                    <br />
                    {currentOrder.orderNumber || currentOrder.id}
                  </p>

                  <p className="mb-2">
                    <strong>Order Date:</strong>
                    <br />
                    {formatDate(currentOrder.createdAt)}
                  </p>

                  <p className="mb-0">
                    <strong>Payment:</strong>
                    <br />
                    {currentOrder.paymentMethod || 'Not specified'}
                  </p>
                </div>
              </section>
            </div>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <span className="marketplace-eyebrow">
              BUYER DASHBOARD
            </span>

            <h2 className="mt-2">Track My Orders</h2>

            <p className="text-muted mb-0">
              Monitor your purchases and check their current status.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn-dark-glass-secondary"
              onClick={refreshOrders}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </button>

            <button
              type="button"
              className="btn-dark-glass-secondary"
              onClick={handleBack}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </button>
          </div>
        </div>

        <div className="row g-3 mb-4">

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <i className="fas fa-box fs-4 text-primary"></i>
                <h3 className="mt-3 mb-1">{totalOrders}</h3>
                <p className="text-muted mb-0">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <i className="fas fa-truck-fast fs-4 text-warning"></i>
                <h3 className="mt-3 mb-1">{activeOrders}</h3>
                <p className="text-muted mb-0">Active Orders</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <i className="fas fa-circle-check fs-4 text-success"></i>
                <h3 className="mt-3 mb-1">{deliveredOrders}</h3>
                <p className="text-muted mb-0">Delivered Orders</p>
              </div>
            </div>
          </div>

        </div>

        <section className="card shadow-sm">
          <div className="card-body p-4">

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <h5 className="mb-0">Your Orders</h5>

              <span className="text-muted small">
                {filteredOrders.length} order(s) found
              </span>
            </div>

            <div className="row g-3 mb-4">

              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search order ID or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="partially accepted">Partially Accepted</option>
                  <option value="in transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-box-open fs-1 text-muted"></i>

                <h5 className="mt-3">No Orders Found</h5>

                <p className="text-muted mb-0">
                  Your orders will appear here after checkout.
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
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => {
                      const status = getStatusMeta(order.status);

                      return (
                        <tr key={order.id}>
                          <td className="fw-semibold">
                            {order.orderNumber || order.id}
                          </td>

                          <td>
                            {(order.items || []).length} item(s)
                          </td>

                          <td>{formatDate(order.createdAt)}</td>

                          <td className="fw-semibold">
                            {formatCurrency(order.totalAmount)}
                          </td>

                          <td>
                            <span className={`badge bg-${status.className}`}>
                              {status.label}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <i className="fas fa-eye me-1"></i>
                              Track
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  );
}
