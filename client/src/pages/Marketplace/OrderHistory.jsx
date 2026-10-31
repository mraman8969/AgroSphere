
import React from 'react';

export default function OrderHistory({ role, onBack }) {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('all');
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  const orders = [];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.product.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === 'all' || order.status === status;

    return matchesSearch && matchesStatus;
  });

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setDateRange('all');
  };

  if (selectedOrder) {
    return (
      <main className="marketplace-dashboard">
        <div className="container">
          <button
            className="btn-dark-glass-secondary mb-3"
            onClick={() => setSelectedOrder(null)}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Orders
          </button>

          <div className="glass-card p-4">
            <h4>Order Details</h4>
            <p>Order ID: {selectedOrder.id}</p>
            <p>Product: {selectedOrder.product}</p>
            <p>Quantity: {selectedOrder.quantity}</p>
            <p>Amount: {selectedOrder.amount}</p>
            <p>Status: {selectedOrder.status}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="marketplace-dashboard">
      <div className="container">

        <button
          className="btn-dark-glass-secondary mb-3"
          onClick={onBack}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>

        <div className="marketplace-dashboard-section">

          <div className="marketplace-section-heading">
            <div>
              <h5>Order History</h5>
              <p>
                {role === 'farmer'
                  ? 'Manage orders received for your products.'
                  : role === 'buyer'
                  ? 'View your purchased orders.'
                  : 'Review your assigned deliveries.'}
              </p>
            </div>
          </div>

          <div className="marketplace-order-filters">

            <input
              type="text"
              placeholder="Search Order ID or Product"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
              <option value="365">Last Year</option>
            </select>

            <button
              type="button"
              className="btn-dark-glass-secondary"
              onClick={resetFilters}
            >
              Reset Filters
            </button>

          </div>

          {filteredOrders.length === 0 ? (
            <div className="marketplace-orders-empty">
              <i className="fas fa-box-open"></i>
              <div>
                <h6>No orders found</h6>
                <p className="mb-0">
                  Orders will appear here when order records
                  are available.
                </p>
              </div>
            </div>
          ) : (
            <div className="marketplace-order-list">
              {filteredOrders.map((order) => (
                <button
                  key={order.id}
                  className="marketplace-order-row"
                  onClick={() => setSelectedOrder(order)}
                >
                  <span>
                    <strong>{order.id}</strong>
                    <small>{order.product}</small>
                  </span>

                  <span>{order.amount}</span>
                  <span>{order.status}</span>
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
