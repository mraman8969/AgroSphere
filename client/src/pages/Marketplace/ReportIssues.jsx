
import React, { useEffect, useMemo, useState } from 'react';
import { getAllOrders } from './marketplaceStorage';
import './ReportIssues.css';

const STORAGE_KEY = 'agrosphere_logistics_issues';

const ISSUE_CATEGORIES = [
  'Pickup Problem',
  'Delivery Address Issue',
  'Customer Unavailable',
  'Vehicle Breakdown',
  'Product Damage',
  'Payment Issue',
  'Other'
];

const getStoredIssues = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const ReportIssues = ({ profile, onBack }) => {
  const [orders, setOrders] = useState([]);
  const [issues, setIssues] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0]);
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');

  const email = profile?.email || profile?.user?.email || '';

  useEffect(() => {
    const allOrders = getAllOrders() || [];

    const assignedOrders = allOrders.filter(order =>
      (order.logisticsEmail || '').toLowerCase() === email.toLowerCase()
    );

    setOrders(assignedOrders);
    setIssues(
      getStoredIssues().filter(issue =>
        (issue.logisticsEmail || '').toLowerCase() === email.toLowerCase()
      )
    );
  }, [email]);

  const saveIssues = (updatedIssues) => {
    const allIssues = getStoredIssues();
    const otherIssues = allIssues.filter(
      issue => (issue.logisticsEmail || '').toLowerCase() !== email.toLowerCase()
    );

    const merged = [...otherIssues, ...updatedIssues];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setIssues(updatedIssues);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    if (!orderId) {
      setMessage('Please select an order.');
      return;
    }

    if (description.trim().length < 10) {
      setMessage('Please provide at least 10 characters in the description.');
      return;
    }

    const selectedOrder = orders.find(order =>
      String(order.id || order.orderNumber) === orderId
    );

    if (!selectedOrder) {
      setMessage('Selected order could not be found.');
      return;
    }

    const newIssue = {
      id: `ISS-${Date.now()}`,
      orderId,
      orderNumber: selectedOrder.orderNumber || selectedOrder.id || orderId,
      logisticsEmail: email,
      logisticsName: profile?.name || profile?.fullName || 'Logistics Partner',
      category,
      priority,
      description: description.trim(),
      status: 'Reported',
      reportedAt: new Date().toISOString()
    };

    saveIssues([newIssue, ...issues]);

    setOrderId('');
    setCategory(ISSUE_CATEGORIES[0]);
    setPriority('Medium');
    setDescription('');
    setMessage('Issue reported successfully.');
  };

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = [
        issue.id,
        issue.orderNumber,
        issue.category,
        issue.description
      ].join(' ').toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === 'All' || issue.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [issues, search, filter]);

  const reportedCount = issues.length;
  const resolvedCount = issues.filter(
    issue => issue.status === 'Resolved'
  ).length;
  const pendingCount = reportedCount - resolvedCount;

  return (
    <div className="log-issues-page">
      <div className="log-issues-header">
        <div>
          <button className="log-issues-back" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <h1>Report Issues</h1>
          <p>Report delivery-related problems and track your submissions.</p>
        </div>
      </div>

      <div className="log-issues-stats">
        <div className="log-issues-stat-card">
          <span>Total Reports</span>
          <strong>{reportedCount}</strong>
        </div>
        <div className="log-issues-stat-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="log-issues-stat-card">
          <span>Resolved</span>
          <strong>{resolvedCount}</strong>
        </div>
      </div>

      <div className="log-issues-form-card">
        <div className="log-issues-section-heading">
          <h2>Submit a New Issue</h2>
          <p>Provide accurate details so the issue can be reviewed.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="log-issues-form-grid">
            <label>
              Select Order *
              <select
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                required
              >
                <option value="">Choose an assigned order</option>
                {orders.map((order, index) => {
                  const value = String(order.id || order.orderNumber || '');
                  return (
                    <option key={value || index} value={value}>
                      {order.orderNumber || order.id || `Order ${index + 1}`}
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              Issue Category *
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {ISSUE_CATEGORIES.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Priority *
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </label>

            <label className="log-issues-description">
              Issue Description *
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explain what happened, where it happened, and what assistance you need..."
                rows={5}
                minLength={10}
                maxLength={1000}
                required
              />
              <small>{description.length}/1000 characters</small>
            </label>
          </div>

          {message && (
            <p className="log-issues-message" role="status">
              {message}
            </p>
          )}

          <button className="log-issues-submit" type="submit">
            Submit Issue
          </button>
        </form>
      </div>

      <div className="log-issues-history">
        <div className="log-issues-section-heading">
          <h2>Reported Issues</h2>
          <p>View the issues you have previously submitted.</p>
        </div>

        <div className="log-issues-toolbar">
          <input
            type="search"
            placeholder="Search by issue, order or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="log-issues-empty">
            <h3>No issues found</h3>
            <p>Your submitted issues will appear here.</p>
          </div>
        ) : (
          <div className="log-issues-list">
            {filteredIssues.map(issue => (
              <article className="log-issues-item" key={issue.id}>
                <div className="log-issues-item-top">
                  <div>
                    <strong>{issue.category}</strong>
                    <span>{issue.id}</span>
                  </div>
                  <span className={`log-issues-status ${issue.status.toLowerCase()}`}>
                    {issue.status}
                  </span>
                </div>

                <div className="log-issues-item-meta">
                  <span>Order: {issue.orderNumber}</span>
                  <span>Priority: {issue.priority}</span>
                  <span>
                    {new Date(issue.reportedAt).toLocaleString()}
                  </span>
                </div>

                <p>{issue.description}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIssues;
