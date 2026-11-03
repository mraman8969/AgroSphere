
import React, { useMemo, useState } from 'react';
import './PurchaseRequests.css';

const initialRequests = [
  {
    id: 'PR-1001',
    buyer: 'FreshMart Retail',
    buyerType: 'Retailer',
    product: 'Wheat',
    quantity: 500,
    unit: 'KG',
    price: 28,
    location: 'Dehradun, Uttarakhand',
    date: '2026-11-02',
    status: 'Pending',
    message: 'Looking for good quality wheat for bulk supply.',
  },
  {
    id: 'PR-1002',
    buyer: 'Green Basket FPO',
    buyerType: 'FPO',
    product: 'Potato',
    quantity: 1000,
    unit: 'KG',
    price: 18,
    location: 'Haridwar, Uttarakhand',
    date: '2026-11-01',
    status: 'Pending',
    message: 'Require fresh potatoes for wholesale distribution.',
  },
  {
    id: 'PR-1003',
    buyer: 'City Wholesale Market',
    buyerType: 'Wholesaler',
    product: 'Tomato',
    quantity: 300,
    unit: 'KG',
    price: 22,
    location: 'Roorkee, Uttarakhand',
    date: '2026-10-30',
    status: 'Accepted',
    message: 'Regular bulk purchase requirement.',
  },
  {
    id: 'PR-1004',
    buyer: 'Daily Needs Store',
    buyerType: 'Retailer',
    product: 'Rice',
    quantity: 200,
    unit: 'KG',
    price: 42,
    location: 'Rishikesh, Uttarakhand',
    date: '2026-10-29',
    status: 'Rejected',
    message: 'Need premium quality rice.',
  },
];

const PurchaseRequests = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === 'Pending').length,
    accepted: requests.filter((r) => r.status === 'Accepted').length,
    rejected: requests.filter((r) => r.status === 'Rejected').length,
  }), [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch = [
        request.id,
        request.buyer,
        request.product,
        request.location,
      ].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      );

      const matchesStatus =
        statusFilter === 'All' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const updateStatus = (requestId, newStatus) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === requestId
          ? { ...request, status: newStatus }
          : request
      )
    );

    setSelectedRequest((previous) =>
      previous?.id === requestId
        ? { ...previous, status: newStatus }
        : previous
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Accepted':
        return 'accepted';
      case 'Rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  return (
    <div className="purchase-requests-page">
      <div className="purchase-requests-header">
        <div>
          <span className="purchase-requests-eyebrow">
            FARMER DASHBOARD
          </span>
          <h2>Purchase Requests</h2>
          <p>Manage bulk purchase enquiries from buyers and FPOs.</p>
        </div>
      </div>

      <div className="purchase-request-stats">
        <div className="purchase-stat-card">
          <span>Total Requests</span>
          <h3>{stats.total}</h3>
        </div>
        <div className="purchase-stat-card">
          <span>Pending</span>
          <h3>{stats.pending}</h3>
        </div>
        <div className="purchase-stat-card">
          <span>Accepted</span>
          <h3>{stats.accepted}</h3>
        </div>
        <div className="purchase-stat-card">
          <span>Rejected</span>
          <h3>{stats.rejected}</h3>
        </div>
      </div>

      <div className="purchase-requests-toolbar">
        <input
          type="search"
          placeholder="Search buyer, product or request ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="purchase-requests-table-wrapper">
        <table className="purchase-requests-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Buyer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Offered Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>
                    <strong>{request.buyer}</strong>
                    <small>{request.buyerType}</small>
                  </td>
                  <td>{request.product}</td>
                  <td>{request.quantity} {request.unit}</td>
                  <td>₹{request.price}/{request.unit}</td>
                  <td>
                    <span className={`purchase-status ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="purchase-view-btn"
                      onClick={() => setSelectedRequest(request)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="purchase-empty">
                  No purchase requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div
          className="purchase-modal-overlay"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="purchase-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="purchase-modal-header">
              <div>
                <span>REQUEST DETAILS</span>
                <h3>{selectedRequest.id}</h3>
              </div>
              <button onClick={() => setSelectedRequest(null)}>×</button>
            </div>

            <div className="purchase-modal-details">
              <p><strong>Buyer:</strong> {selectedRequest.buyer}</p>
              <p><strong>Buyer Type:</strong> {selectedRequest.buyerType}</p>
              <p><strong>Product:</strong> {selectedRequest.product}</p>
              <p><strong>Quantity:</strong> {selectedRequest.quantity} {selectedRequest.unit}</p>
              <p><strong>Offered Price:</strong> ₹{selectedRequest.price}/{selectedRequest.unit}</p>
              <p><strong>Location:</strong> {selectedRequest.location}</p>
              <p><strong>Request Date:</strong> {selectedRequest.date}</p>
              <p><strong>Message:</strong> {selectedRequest.message}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
            </div>

            {selectedRequest.status === 'Pending' && (
              <div className="purchase-modal-actions">
                <button
                  className="purchase-reject-btn"
                  onClick={() => updateStatus(selectedRequest.id, 'Rejected')}
                >
                  Reject Request
                </button>
                <button
                  className="purchase-accept-btn"
                  onClick={() => updateStatus(selectedRequest.id, 'Accepted')}
                >
                  Accept Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequests;
