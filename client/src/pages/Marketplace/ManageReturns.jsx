
import React, { useMemo, useState } from 'react';
import './ManageReturns.css';

const initialReturns = [
  {
    id: 'RET-20261101',
    orderId: 'AGRO-20261028',
    customer: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    product: 'Fresh Tomatoes',
    quantity: '20 KG',
    amount: 600,
    reason: 'Product quality issue',
    description:
      'Some tomatoes arrived damaged and were not suitable for consumption.',
    date: '01 Nov 2026',
    status: 'Pending',
  },
  {
    id: 'RET-20261030',
    orderId: 'AGRO-20261025',
    customer: 'Amit Verma',
    email: 'amit@example.com',
    phone: '9876501234',
    product: 'Fresh Potatoes',
    quantity: '15 KG',
    amount: 450,
    reason: 'Wrong product received',
    description:
      'The delivered product does not match the product ordered.',
    date: '30 Oct 2026',
    status: 'Approved',
  },
  {
    id: 'RET-20261029',
    orderId: 'AGRO-20261022',
    customer: 'Priya Singh',
    email: 'priya@example.com',
    phone: '9876512345',
    product: 'Fresh Onions',
    quantity: '10 KG',
    amount: 350,
    reason: 'Quantity mismatch',
    description:
      'The received quantity is less than the ordered quantity.',
    date: '29 Oct 2026',
    status: 'Rejected',
  },
  {
    id: 'RET-20261027',
    orderId: 'AGRO-20261020',
    customer: 'Vikas Kumar',
    email: 'vikas@example.com',
    phone: '9876523456',
    product: 'Green Peas',
    quantity: '5 KG',
    amount: 400,
    reason: 'Damaged packaging',
    description:
      'The packaging was damaged when the order was delivered.',
    date: '27 Oct 2026',
    status: 'Pending',
  },
];

const statusClass = (status) => {
  switch (status) {
    case 'Approved':
      return 'approved';
    case 'Rejected':
      return 'rejected';
    default:
      return 'pending';
  }
};

const ManageReturns = () => {
  const [returns, setReturns] = useState(initialReturns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReturn, setSelectedReturn] = useState(null);

  const stats = {
    total: returns.length,
    pending: returns.filter((item) => item.status === 'Pending').length,
    approved: returns.filter((item) => item.status === 'Approved').length,
    rejected: returns.filter((item) => item.status === 'Rejected').length,
  };

  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      const searchContent = [
        item.id,
        item.orderId,
        item.customer,
        item.product,
        item.reason,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchContent.includes(
        searchTerm.toLowerCase()
      );

      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, statusFilter]);

  const updateReturnStatus = (returnId, newStatus) => {
    setReturns((previousReturns) =>
      previousReturns.map((item) =>
        item.id === returnId
          ? { ...item, status: newStatus }
          : item
      )
    );

    setSelectedReturn((previous) =>
      previous?.id === returnId
        ? { ...previous, status: newStatus }
        : previous
    );
  };

  const closeDetails = () => setSelectedReturn(null);

  return (
    <div className="manage-returns-page">
      {/* Header */}
      <div className="returns-header">
        <div>
          <span className="returns-eyebrow">
            CUSTOMER SERVICE
          </span>
          <h1>Manage Returns</h1>
          <p>
            Review customer return requests and manage their status.
          </p>
        </div>

        <div className="returns-demo-indicator">
          <span></span>
          Demo Mode
        </div>
      </div>

      {/* Statistics */}
      <div className="returns-stats-grid">
        <div className="returns-stat-card">
          <div className="returns-stat-icon total">📦</div>
          <div>
            <p>Total Requests</p>
            <h2>{stats.total}</h2>
          </div>
        </div>

        <div className="returns-stat-card">
          <div className="returns-stat-icon pending">⏳</div>
          <div>
            <p>Pending Review</p>
            <h2>{stats.pending}</h2>
          </div>
        </div>

        <div className="returns-stat-card">
          <div className="returns-stat-icon approved">✓</div>
          <div>
            <p>Approved</p>
            <h2>{stats.approved}</h2>
          </div>
        </div>

        <div className="returns-stat-card">
          <div className="returns-stat-icon rejected">✕</div>
          <div>
            <p>Rejected</p>
            <h2>{stats.rejected}</h2>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="returns-toolbar">
        <div className="returns-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search by return ID, order, customer or product..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter return requests"
        >
          <option value="All">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Return Requests */}
      <section className="returns-list-panel">
        <div className="returns-section-heading">
          <div>
            <h2>Return Requests</h2>
            <p>{filteredReturns.length} requests found</p>
          </div>
        </div>

        <div className="returns-table-wrapper">
          <table className="returns-table">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReturns.length > 0 ? (
                filteredReturns.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.id}</strong>
                      <small>{item.date}</small>
                    </td>

                    <td>
                      <strong>{item.customer}</strong>
                      <small>{item.orderId}</small>
                    </td>

                    <td>
                      <strong>{item.product}</strong>
                      <small>{item.quantity}</small>
                    </td>

                    <td className="returns-amount">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>

                    <td>{item.reason}</td>

                    <td>
                      <span
                        className={`returns-status ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="returns-view-button"
                        onClick={() => setSelectedReturn(item)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="returns-empty-state">
                      <span>📦</span>
                      <h3>No return requests found</h3>
                      <p>Try changing your search or status filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Return Details Modal */}
      {selectedReturn && (
        <div
          className="returns-modal-overlay"
          onClick={closeDetails}
        >
          <div
            className="returns-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="returns-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="returns-modal-header">
              <div>
                <span className="returns-eyebrow">
                  RETURN REQUEST DETAILS
                </span>
                <h2 id="returns-modal-title">
                  {selectedReturn.id}
                </h2>
              </div>

              <button
                type="button"
                className="returns-close-button"
                onClick={closeDetails}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="returns-modal-body">
              <div className="returns-detail-status">
                <span>Current Status</span>
                <span
                  className={`returns-status ${statusClass(
                    selectedReturn.status
                  )}`}
                >
                  {selectedReturn.status}
                </span>
              </div>

              <div className="returns-detail-group">
                <h3>Customer Information</h3>
                <div className="returns-detail-row">
                  <span>Customer</span>
                  <strong>{selectedReturn.customer}</strong>
                </div>
                <div className="returns-detail-row">
                  <span>Email</span>
                  <strong>{selectedReturn.email}</strong>
                </div>
                <div className="returns-detail-row">
                  <span>Phone</span>
                  <strong>{selectedReturn.phone}</strong>
                </div>
              </div>

              <div className="returns-detail-group">
                <h3>Order Information</h3>
                <div className="returns-detail-row">
                  <span>Order ID</span>
                  <strong>{selectedReturn.orderId}</strong>
                </div>
                <div className="returns-detail-row">
                  <span>Product</span>
                  <strong>{selectedReturn.product}</strong>
                </div>
                <div className="returns-detail-row">
                  <span>Quantity</span>
                  <strong>{selectedReturn.quantity}</strong>
                </div>
                <div className="returns-detail-row">
                  <span>Return Amount</span>
                  <strong>
                    ₹{selectedReturn.amount.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div className="returns-detail-group">
                <h3>Return Reason</h3>
                <div className="returns-detail-row">
                  <span>Reason</span>
                  <strong>{selectedReturn.reason}</strong>
                </div>
                <p className="returns-description">
                  {selectedReturn.description}
                </p>
              </div>
            </div>

            <div className="returns-modal-footer">
              {selectedReturn.status === 'Pending' ? (
                <>
                  <button
                    type="button"
                    className="returns-reject-button"
                    onClick={() =>
                      updateReturnStatus(selectedReturn.id, 'Rejected')
                    }
                  >
                    Reject Request
                  </button>

                  <button
                    type="button"
                    className="returns-approve-button"
                    onClick={() =>
                      updateReturnStatus(selectedReturn.id, 'Approved')
                    }
                  >
                    Approve Request
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="returns-done-button"
                  onClick={closeDetails}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="returns-demo-notice">
        <strong>Demo Mode:</strong> Return requests and approval actions
        currently use sample frontend data. Actual return records,
        refund processing and order updates will be connected through
        backend APIs later.
      </div>
    </div>
  );
};

export default ManageReturns;
