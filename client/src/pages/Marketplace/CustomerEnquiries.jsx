
import React, { useMemo, useState } from 'react';
import './CustomerEnquiries.css';

const initialEnquiries = [
  {
    id: 'ENQ-1001',
    customer: 'Rahul Sharma',
    email: 'rahul@example.com',
    product: 'Organic Wheat',
    subject: 'Bulk order availability',
    message: 'I need approximately 200 KG of organic wheat. Is this quantity available?',
    date: '2026-11-02',
    status: 'New',
    reply: '',
  },
  {
    id: 'ENQ-1002',
    customer: 'Priya Verma',
    email: 'priya@example.com',
    product: 'Fresh Potatoes',
    subject: 'Product quality',
    message: 'Are these potatoes freshly harvested? Please share the quality details.',
    date: '2026-11-01',
    status: 'Replied',
    reply: 'Yes, these are freshly harvested potatoes.',
  },
  {
    id: 'ENQ-1003',
    customer: 'Amit Kumar',
    email: 'amit@example.com',
    product: 'Basmati Rice',
    subject: 'Price negotiation',
    message: 'Can you offer a better price for an order of 100 KG?',
    date: '2026-10-30',
    status: 'New',
    reply: '',
  },
  {
    id: 'ENQ-1004',
    customer: 'Neha Singh',
    email: 'neha@example.com',
    product: 'Fresh Tomatoes',
    subject: 'Delivery information',
    message: 'How many days will delivery take after placing the order?',
    date: '2026-10-29',
    status: 'Closed',
    reply: 'Delivery usually takes 2–3 working days.',
  },
];

const CustomerEnquiries = () => {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');

  const stats = useMemo(() => ({
    total: enquiries.length,
    new: enquiries.filter((item) => item.status === 'New').length,
    replied: enquiries.filter((item) => item.status === 'Replied').length,
    closed: enquiries.filter((item) => item.status === 'Closed').length,
  }), [enquiries]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch = [
        item.id,
        item.customer,
        item.product,
        item.subject,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, statusFilter]);

  const openEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setReplyText(enquiry.reply || '');
  };

  const sendReply = () => {
    const message = replyText.trim();

    if (!message || !selectedEnquiry) return;

    const updatedEnquiries = enquiries.map((item) =>
      item.id === selectedEnquiry.id
        ? { ...item, reply: message, status: 'Replied' }
        : item
    );

    setEnquiries(updatedEnquiries);

    setSelectedEnquiry((previous) => ({
      ...previous,
      reply: message,
      status: 'Replied',
    }));

    setReplyText(message);
  };

  const closeEnquiry = () => {
    if (!selectedEnquiry) return;

    const updatedEnquiries = enquiries.map((item) =>
      item.id === selectedEnquiry.id
        ? { ...item, status: 'Closed' }
        : item
    );

    setEnquiries(updatedEnquiries);
    setSelectedEnquiry(null);
    setReplyText('');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Replied':
        return 'replied';
      case 'Closed':
        return 'closed';
      default:
        return 'new';
    }
  };

  return (
    <div className="customer-enquiries-page">
      <div className="customer-enquiries-header">
        <div>
          <span className="customer-enquiries-eyebrow">
            FARMER DASHBOARD
          </span>
          <h2>Customer Enquiries</h2>
          <p>View customer questions and manage your responses.</p>
        </div>
      </div>

      <div className="customer-enquiry-stats">
        <div className="customer-enquiry-stat">
          <span>Total Enquiries</span>
          <h3>{stats.total}</h3>
        </div>
        <div className="customer-enquiry-stat">
          <span>New</span>
          <h3>{stats.new}</h3>
        </div>
        <div className="customer-enquiry-stat">
          <span>Replied</span>
          <h3>{stats.replied}</h3>
        </div>
        <div className="customer-enquiry-stat">
          <span>Closed</span>
          <h3>{stats.closed}</h3>
        </div>
      </div>

      <div className="customer-enquiries-toolbar">
        <input
          type="search"
          placeholder="Search customer, product or enquiry ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Enquiries</option>
          <option value="New">New</option>
          <option value="Replied">Replied</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="customer-enquiries-table-wrapper">
        <table className="customer-enquiries-table">
          <thead>
            <tr>
              <th>Enquiry ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredEnquiries.length > 0 ? (
              filteredEnquiries.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <strong>{item.customer}</strong>
                    <small>{item.email}</small>
                  </td>
                  <td>{item.product}</td>
                  <td>{item.subject}</td>
                  <td>{item.date}</td>
                  <td>
                    <span className={`customer-enquiry-status ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="customer-enquiry-view-btn"
                      onClick={() => openEnquiry(item)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="customer-enquiry-empty">
                  No enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedEnquiry && (
        <div
          className="customer-enquiry-overlay"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="customer-enquiry-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="customer-enquiry-modal-header">
              <div>
                <span>ENQUIRY DETAILS</span>
                <h3>{selectedEnquiry.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                aria-label="Close enquiry details"
              >
                ×
              </button>
            </div>

            <div className="customer-enquiry-details">
              <p><strong>Customer:</strong> {selectedEnquiry.customer}</p>
              <p><strong>Email:</strong> {selectedEnquiry.email}</p>
              <p><strong>Product:</strong> {selectedEnquiry.product}</p>
              <p><strong>Subject:</strong> {selectedEnquiry.subject}</p>
              <p><strong>Date:</strong> {selectedEnquiry.date}</p>
              <p><strong>Question:</strong> {selectedEnquiry.message}</p>
              <p>
                <strong>Status:</strong> {selectedEnquiry.status}
              </p>
            </div>

            <div className="customer-enquiry-reply">
              <label htmlFor="customer-enquiry-reply">
                Your Reply
              </label>
              <textarea
                id="customer-enquiry-reply"
                rows="4"
                placeholder="Write your response to the customer..."
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                disabled={selectedEnquiry.status === 'Closed'}
              />

              {selectedEnquiry.reply && (
                <p className="customer-enquiry-existing-reply">
                  <strong>Saved reply:</strong> {selectedEnquiry.reply}
                </p>
              )}
            </div>

            <div className="customer-enquiry-actions">
              {selectedEnquiry.status !== 'Closed' && (
                <>
                  <button
                    type="button"
                    className="customer-enquiry-close-btn"
                    onClick={closeEnquiry}
                  >
                    Close Enquiry
                  </button>
                  <button
                    type="button"
                    className="customer-enquiry-send-btn"
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                  >
                    Save Reply
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerEnquiries;
