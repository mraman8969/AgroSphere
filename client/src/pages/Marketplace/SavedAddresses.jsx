
import React, { useState } from 'react';
import './SavedAddresses.css';

const SavedAddresses = ({ profile, onBack }) => {
  const buyerKey = String(
    profile?.email || profile?.id || profile?.userId || 'guest'
  ).toLowerCase();

  const storageKey = `agrosphere_saved_addresses_${buyerKey}`;

  const loadAddresses = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  };

  const [addresses, setAddresses] = useState(loadAddresses);

  const emptyForm = {
    fullName: profile?.name || profile?.fullName || '',
    phone: profile?.phone || '',
    label: 'Home',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const persistAddresses = updated => {
    setAddresses(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleSubmit = event => {
    event.preventDefault();

    const updatedAddress = {
      ...form,
      id: editingId || crypto.randomUUID(),
    };

    let updated;

    if (editingId) {
      updated = addresses.map(item =>
        item.id === editingId ? updatedAddress : item
      );
    } else {
      updated = [
        ...addresses,
        {
          ...updatedAddress,
          isDefault: addresses.length === 0,
        },
      ];
    }

    persistAddresses(updated);
    setForm(emptyForm);
    setEditingId(null);
    setMessage(
      editingId
        ? 'Address updated successfully.'
        : 'Address saved successfully.'
    );
  };

  const handleEdit = item => {
    setForm({
      fullName: item.fullName || '',
      phone: item.phone || '',
      label: item.label || 'Home',
      address: item.address || '',
      city: item.city || '',
      state: item.state || '',
      pincode: item.pincode || '',
      landmark: item.landmark || '',
    });

    setEditingId(item.id);
    setMessage('');
  };

  const handleDelete = id => {
    const updated = addresses.filter(item => item.id !== id);

    if (addresses.find(item => item.id === id)?.isDefault && updated.length) {
      updated[0].isDefault = true;
    }

    persistAddresses(updated);
    setMessage('Address deleted successfully.');

    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const setDefault = id => {
    const updated = addresses.map(item => ({
      ...item,
      isDefault: item.id === id,
    }));

    persistAddresses(updated);
    setMessage('Default address updated.');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
  };

  return (
    <div className="saved-addresses-page">
      <header className="saved-addresses-header">
        <button className="saved-addresses-back" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <span className="saved-addresses-eyebrow">MY ACCOUNT</span>
        <h1>Saved Addresses</h1>
        <p>
          Manage your delivery locations for a faster checkout experience.
        </p>
      </header>

      <div className="saved-addresses-layout">
        <section className="address-form-card">
          <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
          <p>Enter your delivery details below.</p>

          <form onSubmit={handleSubmit}>
            <label>Full Name *</label>
            <input
              value={form.fullName}
              onChange={e =>
                setForm({ ...form, fullName: e.target.value })
              }
              placeholder="Enter full name"
              required
            />

            <label>Phone Number *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e =>
                setForm({ ...form, phone: e.target.value })
              }
              placeholder="Enter phone number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />

            <label>Address Type</label>
            <select
              value={form.label}
              onChange={e =>
                setForm({ ...form, label: e.target.value })
              }
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>

            <label>Full Address *</label>
            <textarea
              rows="3"
              value={form.address}
              onChange={e =>
                setForm({ ...form, address: e.target.value })
              }
              placeholder="House number, street, area..."
              required
            />

            <div className="address-form-row">
              <div>
                <label>City *</label>
                <input
                  value={form.city}
                  onChange={e =>
                    setForm({ ...form, city: e.target.value })
                  }
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label>State *</label>
                <input
                  value={form.state}
                  onChange={e =>
                    setForm({ ...form, state: e.target.value })
                  }
                  placeholder="State"
                  required
                />
              </div>
            </div>

            <label>PIN Code *</label>
            <input
              value={form.pincode}
              onChange={e =>
                setForm({ ...form, pincode: e.target.value })
              }
              placeholder="6-digit PIN code"
              pattern="[0-9]{6}"
              maxLength="6"
              required
            />

            <label>Landmark (Optional)</label>
            <input
              value={form.landmark}
              onChange={e =>
                setForm({ ...form, landmark: e.target.value })
              }
              placeholder="Nearby landmark"
            />

            {message && (
              <div className="address-message">{message}</div>
            )}

            <div className="address-form-actions">
              <button type="submit" className="address-save-btn">
                {editingId ? 'Update Address' : 'Save Address'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="address-cancel-btn"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="address-list-card">
          <div className="address-list-heading">
            <div>
              <h2>Your Addresses</h2>
              <p>Choose and manage your saved locations.</p>
            </div>
            <span>{addresses.length} Saved</span>
          </div>

          {addresses.length === 0 ? (
            <div className="address-empty">
              <span>📍</span>
              <h3>No saved addresses</h3>
              <p>Add your first delivery address using the form.</p>
            </div>
          ) : (
            <div className="address-list">
              {addresses.map(item => (
                <article className="address-item" key={item.id}>
                  <div className="address-item-heading">
                    <div>
                      <span className="address-type">
                        {item.label === 'Home' ? '⌂' : '📍'} {item.label}
                      </span>
                      {item.isDefault && (
                        <span className="address-default">DEFAULT</span>
                      )}
                    </div>
                  </div>

                  <h3>{item.fullName}</h3>
                  <p>{item.address}</p>
                  <p>
                    {item.city}, {item.state} - {item.pincode}
                  </p>

                  {item.landmark && (
                    <small>Landmark: {item.landmark}</small>
                  )}

                  <small>Phone: {item.phone}</small>

                  <div className="address-item-actions">
                    {!item.isDefault && (
                      <button onClick={() => setDefault(item.id)}>
                        Set Default
                      </button>
                    )}

                    <button onClick={() => handleEdit(item)}>
                      Edit
                    </button>

                    <button
                      className="address-delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SavedAddresses;
