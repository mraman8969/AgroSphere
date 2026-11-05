
import React, { useMemo, useState } from 'react';
import { getAllOrders, saveAllOrders } from './marketplaceStorage';
import './DeliveryProof.css';

const getOrderId = (order) =>
  order.orderNumber || order.id || 'N/A';

const getBuyerName = (order) =>
  order.buyerName || order.customerName || 'Customer';

const DeliveryProof = ({ profile, onBack }) => {
  const [orders, setOrders] = useState(() => getAllOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState({});
  const [notes, setNotes] = useState({});
  const [message, setMessage] = useState('');

  const logisticsEmail = (
    profile?.email || profile?.user?.email || ''
  ).toLowerCase();

  const assignedOrders = useMemo(() => {
    return orders.filter((order) =>
      (order.logisticsEmail || '').toLowerCase() === logisticsEmail
    );
  }, [orders, logisticsEmail]);

  const deliveredOrders = assignedOrders.filter(
    (order) => order.logisticsStatus === 'Delivered'
  );

  const pendingProofOrders = deliveredOrders.filter(
    (order) => !order.deliveryProof
  );

  const filteredOrders = deliveredOrders.filter((order) => {
    const query = searchTerm.trim().toLowerCase();

    return (
      !query ||
      String(getOrderId(order)).toLowerCase().includes(query) ||
      getBuyerName(order).toLowerCase().includes(query)
    );
  });

  const handleFileChange = (orderKey, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be 5 MB or less.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setSelectedFiles((previous) => ({
        ...previous,
        [orderKey]: reader.result,
      }));
      setMessage('');
    };

    reader.onerror = () => {
      setMessage('Unable to read the selected image.');
    };

    reader.readAsDataURL(file);
  };

  const saveProof = (order) => {
    const orderKey = String(order.id || order.orderNumber);
    const image = selectedFiles[orderKey];
    const note = notes[orderKey] || '';

    if (!image) {
      setMessage('Please upload a delivery proof image first.');
      return;
    }

    const updatedOrders = orders.map((item) => {
      const sameOrder =
        String(item.id) === String(order.id) ||
        String(item.orderNumber) === String(order.orderNumber);

      if (
        !sameOrder ||
        (item.logisticsEmail || '').toLowerCase() !== logisticsEmail ||
        item.logisticsStatus !== 'Delivered'
      ) {
        return item;
      }

      return {
        ...item,
        deliveryProof: {
          image,
          notes: note.trim(),
          uploadedAt: new Date().toISOString(),
          uploadedBy: logisticsEmail,
        },
      };
    });

    saveAllOrders(updatedOrders);
    setOrders(updatedOrders);
    setMessage(`Delivery proof saved for order #${getOrderId(order)}.`);

    setSelectedFiles((previous) => ({
      ...previous,
      [orderKey]: '',
    }));
  };

  return (
    <div className="delivery-proof-page">
      <header className="dp-header">
        <button
          type="button"
          className="dp-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <span className="dp-eyebrow">LOGISTICS MANAGEMENT</span>
        <h1>Delivery Proof</h1>
        <p>
          Upload and manage proof of completed deliveries.
        </p>
      </header>

      {message && (
        <div className="dp-message" role="status">
          {message}
        </div>
      )}

      <section className="dp-stats-grid">
        <div className="dp-stat-card">
          <span>Total Delivered</span>
          <strong>{deliveredOrders.length}</strong>
        </div>

        <div className="dp-stat-card">
          <span>Proof Pending</span>
          <strong>{pendingProofOrders.length}</strong>
        </div>

        <div className="dp-stat-card">
          <span>Proof Submitted</span>
          <strong>
            {deliveredOrders.length - pendingProofOrders.length}
          </strong>
        </div>
      </section>

      <section className="dp-main-panel">
        <div className="dp-panel-header">
          <div>
            <h2>Completed Deliveries</h2>
            <p>Upload an image for each completed delivery.</p>
          </div>

          <input
            type="search"
            className="dp-search"
            placeholder="Search order or customer..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="dp-empty-state">
            <div className="dp-empty-icon">📦</div>
            <h3>No completed deliveries found</h3>
            <p>
              Delivered orders will appear here when their status
              is updated.
            </p>
          </div>
        ) : (
          <div className="dp-order-list">
            {filteredOrders.map((order, index) => {
              const orderKey = String(order.id || order.orderNumber);
              const proof = order.deliveryProof;
              const preview = selectedFiles[orderKey];

              return (
                <article
                  className="dp-order-card"
                  key={`${orderKey}-${index}`}
                >
                  <div className="dp-order-heading">
                    <div>
                      <span className="dp-label">ORDER ID</span>
                      <h3>#{getOrderId(order)}</h3>
                      <p>{getBuyerName(order)}</p>
                    </div>

                    <span className="dp-delivered-badge">
                      ✓ Delivered
                    </span>
                  </div>

                  {proof ? (
                    <div className="dp-existing-proof">
                      <div className="dp-proof-heading">
                        <strong>Proof Submitted</strong>
                        <span>
                          {new Date(proof.uploadedAt).toLocaleString()}
                        </span>
                      </div>

                      <img
                        src={proof.image}
                        alt={`Delivery proof for order ${getOrderId(order)}`}
                        className="dp-proof-image"
                      />

                      {proof.notes && (
                        <p className="dp-saved-notes">
                          <strong>Notes:</strong> {proof.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="dp-upload-section">
                      <label className="dp-upload-label">
                        Upload delivery image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleFileChange(orderKey, event.target.files?.[0])
                          }
                        />
                      </label>

                      <p className="dp-upload-hint">
                        Image formats only. Maximum size: 5 MB.
                      </p>

                      {preview && (
                        <div className="dp-preview-container">
                          <span>Image Preview</span>
                          <img
                            src={preview}
                            alt="Selected delivery proof preview"
                            className="dp-proof-image"
                          />
                        </div>
                      )}

                      <label className="dp-notes-label">
                        Delivery notes (optional)
                        <textarea
                          rows="3"
                          placeholder="Add delivery remarks..."
                          value={notes[orderKey] || ''}
                          onChange={(event) =>
                            setNotes((previous) => ({
                              ...previous,
                              [orderKey]: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <button
                        type="button"
                        className="dp-save-button"
                        onClick={() => saveProof(order)}
                      >
                        Save Delivery Proof →
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DeliveryProof;
