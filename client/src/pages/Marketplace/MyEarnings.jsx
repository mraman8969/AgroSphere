
import React, { useMemo, useState } from 'react';
import { getAllOrders } from './marketplaceStorage';
import './MyEarnings.css';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getOrderEarning = (order) =>
  Number(order.logisticsEarning ?? order.deliveryEarning ?? 0);

export default function MyEarnings({ profile, onBack }) {
  const [orders] = useState(() => {
    try {
      return getAllOrders() || [];
    } catch {
      return [];
    }
  });

  const [period, setPeriod] = useState('All Time');
  const [search, setSearch] = useState('');

  const userEmail = profile?.email || '';

  const deliveredOrders = useMemo(() => {
    return orders.filter(order => {
      const assignedEmail = order.logisticsEmail || '';
      const status = String(order.logisticsStatus || '').toLowerCase();

      return (
        assignedEmail.toLowerCase() === userEmail.toLowerCase() &&
        status === 'delivered'
      );
    });
  }, [orders, userEmail]);

  const filteredOrders = useMemo(() => {
    const now = new Date();

    return deliveredOrders.filter(order => {
      const dateValue = order.deliveredAt || order.updatedAt || order.createdAt;
      const deliveryDate = dateValue ? new Date(dateValue) : null;

      let matchesPeriod = true;

      if (period !== 'All Time' && deliveryDate && !Number.isNaN(deliveryDate.getTime())) {
        const days = period === 'Last 7 Days' ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - days);
        matchesPeriod = deliveryDate >= cutoff && deliveryDate <= now;
      }

      const query = search.toLowerCase();
      const orderId = String(order.orderNumber || order.id || '').toLowerCase();
      const buyer = String(order.buyerName || order.customerName || '').toLowerCase();

      return matchesPeriod && (
        !query ||
        orderId.includes(query) ||
        buyer.includes(query)
      );
    });
  }, [deliveredOrders, period, search]);

  const totalEarnings = deliveredOrders.reduce(
    (sum, order) => sum + getOrderEarning(order),
    0
  );

  const filteredEarnings = filteredOrders.reduce(
    (sum, order) => sum + getOrderEarning(order),
    0
  );

  const thisMonthEarnings = deliveredOrders.reduce((sum, order) => {
    const dateValue = order.deliveredAt || order.updatedAt || order.createdAt;
    if (!dateValue) return sum;

    const date = new Date(dateValue);
    const now = new Date();

    if (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return sum + getOrderEarning(order);
    }

    return sum;
  }, 0);

  const totalTransactions = deliveredOrders.length;
  const recordedTransactions = deliveredOrders.filter(
    order => getOrderEarning(order) > 0
  ).length;

  return (
    <div className="me-page">
      <header className="me-header">
        <div>
          <button className="me-back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <p className="me-eyebrow">LOGISTICS MANAGEMENT</p>
          <h1>My Earnings</h1>
          <p className="me-subtitle">
            Track your delivery earnings and completed transactions.
          </p>
        </div>
      </header>

      <section className="me-summary">
        <div className="me-total-card">
          <span>Total Recorded Earnings</span>
          <strong>{formatCurrency(totalEarnings)}</strong>
          <p>From {totalTransactions} completed deliveries</p>
        </div>

        <div className="me-stat-card">
          <span>This Month</span>
          <strong>{formatCurrency(thisMonthEarnings)}</strong>
          <p>Current calendar month</p>
        </div>

        <div className="me-stat-card">
          <span>Completed Deliveries</span>
          <strong>{totalTransactions}</strong>
          <p>Successfully delivered orders</p>
        </div>

        <div className="me-stat-card">
          <span>Recorded Transactions</span>
          <strong>{recordedTransactions}</strong>
          <p>Deliveries with earning data</p>
        </div>
      </section>

      <section className="me-history-card">
        <div className="me-section-heading">
          <div>
            <h2>Delivery Earnings History</h2>
            <p>View earnings associated with your delivered orders.</p>
          </div>

          <strong className="me-filter-total">
            {formatCurrency(filteredEarnings)}
          </strong>
        </div>

        <div className="me-toolbar">
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search order ID or buyer..."
          />

          <select
            value={period}
            onChange={event => setPeriod(event.target.value)}
          >
            <option>All Time</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="me-empty">
            <span>💰</span>
            <h3>No earnings records found</h3>
            <p>
              Earnings will appear here when your assigned deliveries are
              marked as delivered and earning data is recorded.
            </p>
          </div>
        ) : (
          <div className="me-table-wrap">
            <table className="me-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Buyer</th>
                  <th>Delivery Date</th>
                  <th>Delivery Status</th>
                  <th>Earnings</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(order => {
                  const dateValue =
                    order.deliveredAt || order.updatedAt || order.createdAt;

                  const deliveryDate = dateValue
                    ? new Date(dateValue)
                    : null;

                  return (
                    <tr key={order.id || order.orderNumber}>
                      <td>
                        <strong>
                          {order.orderNumber || order.id || 'N/A'}
                        </strong>
                      </td>

                      <td>
                        {order.buyerName || order.customerName || 'N/A'}
                      </td>

                      <td>
                        {deliveryDate && !Number.isNaN(deliveryDate.getTime())
                          ? deliveryDate.toLocaleDateString('en-IN')
                          : 'N/A'}
                      </td>

                      <td>
                        <span className="me-delivered-badge">
                          Delivered
                        </span>
                      </td>

                      <td className="me-earning-value">
                        {formatCurrency(getOrderEarning(order))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="me-notice">
        <strong>Earnings calculation note</strong>
        <p>
          This module reads the logisticsEarning or deliveryEarning field
          from delivered orders. If neither field exists, the earning is
          displayed as ₹0. It does not calculate commissions, process
          payouts, or verify bank transactions.
        </p>
      </div>
    </div>
  );
}
