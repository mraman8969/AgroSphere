
import React, { useMemo, useState } from 'react';
import { getAllOrders } from './marketplaceStorage';
import './RaiseComplaints.css';

const RaiseComplaints = ({ profile, onBack }) => {
  const buyerKey = String(
    profile?.email || profile?.id || profile?.userId || ''
  ).toLowerCase();

  const [orders] = useState(() => getAllOrders());
  const [complaints, setComplaints] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`agrosphere_complaints_${buyerKey}`)
      ) || [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    orderId: '',
    category: 'Order Issue',
    subject: '',
    description: '',
  });

  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const myOrders = useMemo(() => {
    return orders.filter(order => {
      const key = String(
        order.buyerKey || order.buyerEmail ||
        order.customerEmail || ''
      ).toLowerCase();

      return key === buyerKey;
    });
  }, [orders, buyerKey]);

  const filteredComplaints = complaints.filter(item =>
    `${item.complaintId} ${item.subject} ${item.category} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSubmit = event => {
    event.preventDefault();

    if (!form.subject.trim() || !form.description.trim()) {
      setMessage('Please complete all required fields.');
      return;
    }

    const complaint = {
      id: crypto.randomUUID(),
      complaintId: `CMP-${Date.now()}`,
      orderId: form.orderId,
      category: form.category,
      subject: form.subject.trim(),
      description: form.description.trim(),
      status: 'Submitted',
      createdAt: new Date().toISOString(),
    };

    const updated = [complaint, ...complaints];

    setComplaints(updated);
    localStorage.setItem(
      `agrosphere_complaints_${buyerKey}`,
      JSON.stringify(updated)
    );

    setForm({
      orderId: '',
      category: 'Order Issue',
      subject: '',
      description: '',
    });

    setMessage('Complaint submitted successfully.');
  };

  return (
    <div className="complaints-page">
      <div className="complaints-header">
        <button className="complaints-back" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div>
          <span className="complaints-eyebrow">BUYER SUPPORT</span>
          <h1>Raise a Complaint</h1>
          <p>
            Report an issue with your order or marketplace experience.
          </p>
        </div>
      </div>

      <div className="complaints-layout">
        <section className="complaint-form-card">
          <h2>Submit a New Complaint</h2>
          <p>Provide the details below so your issue can be recorded.</p>

          <form onSubmit={handleSubmit}>
            <label>Related Order</label>
            <select
              value={form.orderId}
              onChange={e =>
                setForm({ ...form, orderId: e.target.value })
              }
            >
              <option value="">Select an order (optional)</option>
              {myOrders.map(order => (
                <option
                  key={order.id || order.orderId}
                  value={order.orderNumber || order.orderId || order.id}
                >
                  {order.orderNumber || order.orderId || order.id}
                </option>
              ))}
            </select>

            <label>Complaint Category</label>
            <select
              value={form.category}
              onChange={e =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option>Order Issue</option>
              <option>Product Quality</option>
              <option>Payment Issue</option>
              <option>Delivery Issue</option>
              <option>Farmer Communication</option>
              <option>Other</option>
            </select>

            <label>Subject *</label>
            <input
              type="text"
              placeholder="Briefly describe your issue"
              value={form.subject}
              onChange={e =>
                setForm({ ...form, subject: e.target.value })
              }
              required
            />

            <label>Description *</label>
            <textarea
              rows="5"
              placeholder="Explain your complaint in detail..."
              value={form.description}
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />

            {message && (
              <div className="complaint-message">{message}</div>
            )}

            <button type="submit" className="complaint-submit">
              Submit Complaint
            </button>
          </form>
        </section>

        <section className="complaint-history-card">
          <div className="complaint-history-heading">
            <div>
              <h2>My Complaints</h2>
              <p>View your previously submitted complaints.</p>
            </div>
            <span>{complaints.length} Total</span>
          </div>

          <input
            className="complaint-search"
            type="search"
            placeholder="Search complaints..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {filteredComplaints.length === 0 ? (
            <div className="complaint-empty">
              <span>📋</span>
              <h3>No complaints found</h3>
              <p>Your submitted complaints will appear here.</p>
            </div>
          ) : (
            <div className="complaint-list">
              {filteredComplaints.map(item => (
                <article className="complaint-item" key={item.id}>
                  <div className="complaint-item-top">
                    <strong>{item.complaintId}</strong>
                    <span className="complaint-status">
                      {item.status}
                    </span>
                  </div>

                  <h3>{item.subject}</h3>
                  <p>{item.description}</p>

                  <div className="complaint-meta">
                    <span>{item.category}</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.orderId && (
                    <small>Order: {item.orderId}</small>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RaiseComplaints;
