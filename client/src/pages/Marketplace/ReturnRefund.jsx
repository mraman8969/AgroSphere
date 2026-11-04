
import React, { useMemo, useState } from 'react';
import { getAllOrders } from './marketplaceStorage';
import './ReturnRefund.css';

const ReturnRefund = ({ profile, onBack }) => {
  const buyerKey = String(
    profile?.email || profile?.id || profile?.userId || ''
  ).toLowerCase();

  const [orders] = useState(() => getAllOrders());

  const [requests, setRequests] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`agrosphere_returns_${buyerKey}`)
      ) || [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    orderId: '',
    productName: '',
    reason: 'Damaged Product',
    description: '',
    resolution: 'Refund',
  });

  const [message, setMessage] = useState('');

  const myOrders = useMemo(() => {
    return orders.filter(order => {
      const key = String(
        order.buyerKey ||
        order.buyerEmail ||
        order.customerEmail ||
        ''
      ).toLowerCase();

      return key === buyerKey;
    });
  }, [orders, buyerKey]);

  const selectedOrder = myOrders.find(order =>
    String(order.orderNumber || order.orderId || order.id) ===
    form.orderId
  );

  const selectedItems = selectedOrder?.items || [];

  const handleSubmit = event => {
    event.preventDefault();

    if (!form.orderId || !form.productName || !form.description.trim()) {
      setMessage('Please complete all required fields.');
      return;
    }

    const request = {
      id: crypto.randomUUID(),
      requestId: `RET-${Date.now()}`,
      orderId: form.orderId,
      productName: form.productName,
      reason: form.reason,
      description: form.description.trim(),
      resolution: form.resolution,
      status: 'Requested',
      createdAt: new Date().toISOString(),
    };

    const updated = [request, ...requests];

    setRequests(updated);
    localStorage.setItem(
      `agrosphere_returns_${buyerKey}`,
      JSON.stringify(updated)
    );

    setForm({
      orderId: '',
      productName: '',
      reason: 'Damaged Product',
      description: '',
      resolution: 'Refund',
    });

    setMessage('Return/refund request submitted successfully.');
  };

  return (
    <div className="return-page">
      <header className="return-header">
        <button className="return-back" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <span className="return-eyebrow">BUYER SUPPORT</span>
        <h1>Returns & Refunds</h1>
        <p>
          Request a return or refund and keep track of your requests.
        </p>
      </header>

      <div className="return-layout">
        <section className="return-form-card">
          <h2>New Return Request</h2>
          <p>Choose your order and provide the reason for your request.</p>

          <form onSubmit={handleSubmit}>
            <label>Select Order *</label>
            <select
              value={form.orderId}
              onChange={e =>
                setForm({
                  ...form,
                  orderId: e.target.value,
                  productName: '',
                })
              }
              required
            >
              <option value="">Choose an order</option>
              {myOrders.map(order => {
                const id = order.orderNumber || order.orderId || order.id;

                return (
                  <option key={order.id || id} value={id}>
                    {id}
                  </option>
                );
              })}
            </select>

            <label>Select Product *</label>
            <select
              value={form.productName}
              onChange={e =>
                setForm({ ...form, productName: e.target.value })
              }
              disabled={!form.orderId}
              required
            >
              <option value="">Choose a product</option>
              {selectedItems.map((item, index) => (
                <option
                  key={item.productId || item.id || index}
                  value={item.productName || item.name || item.title}
                >
                  {item.productName || item.name || item.title}
                </option>
              ))}
            </select>

            <label>Reason for Request *</label>
            <select
              value={form.reason}
              onChange={e =>
                setForm({ ...form, reason: e.target.value })
              }
            >
              <option>Damaged Product</option>
              <option>Wrong Product Delivered</option>
              <option>Quality Not as Expected</option>
              <option>Missing Items</option>
              <option>Order Not Delivered</option>
              <option>Other</option>
            </select>

            <label>Preferred Resolution *</label>
            <select
              value={form.resolution}
              onChange={e =>
                setForm({ ...form, resolution: e.target.value })
              }
            >
              <option value="Refund">Refund</option>
              <option value="Replacement">Replacement</option>
            </select>

            <label>Additional Details *</label>
            <textarea
              rows="5"
              placeholder="Describe the issue with your product..."
              value={form.description}
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />

            {message && (
              <div className="return-message">{message}</div>
            )}

            <button type="submit" className="return-submit">
              Submit Request
            </button>
          </form>
        </section>

        <section className="return-history-card">
          <div className="return-history-heading">
            <div>
              <h2>My Requests</h2>
              <p>Track your submitted return and refund requests.</p>
            </div>
            <span>{requests.length} Total</span>
          </div>

          {requests.length === 0 ? (
            <div className="return-empty">
              <span>📦</span>
              <h3>No requests yet</h3>
              <p>Your return and refund requests will appear here.</p>
            </div>
          ) : (
            <div className="return-list">
              {requests.map(request => (
                <article className="return-item" key={request.id}>
                  <div className="return-item-top">
                    <strong>{request.requestId}</strong>
                    <span className="return-status">
                      {request.status}
                    </span>
                  </div>

                  <h3>{request.productName}</h3>
                  <p>{request.description}</p>

                  <div className="return-meta">
                    <span>{request.reason}</span>
                    <span>{request.resolution}</span>
                  </div>

                  <small>
                    Order: {request.orderId} ·{' '}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </small>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReturnRefund;
