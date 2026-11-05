
import React, { useEffect, useMemo, useState } from 'react';
import './VehicleManagement.css';

const STORAGE_KEY = 'agrosphere_logistics_vehicles';

const EMPTY_FORM = {
  vehicleNumber: '',
  vehicleType: 'Truck',
  capacity: '',
  driverName: '',
  driverPhone: '',
  status: 'Available',
};

const readVehicles = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export default function VehicleManagement({ profile, onBack }) {
  const userEmail = profile?.email || '';
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setVehicles(
      readVehicles().filter(vehicle => vehicle.ownerEmail === userEmail)
    );
  }, [userEmail]);

  const persistVehicles = (updatedVehicles) => {
    const allVehicles = readVehicles();
    const otherUsersVehicles = allVehicles.filter(
      vehicle => vehicle.ownerEmail !== userEmail
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...otherUsersVehicles, ...updatedVehicles])
    );

    setVehicles(updatedVehicles);
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const query = search.toLowerCase();

      const matchesSearch = [
        vehicle.vehicleNumber,
        vehicle.vehicleType,
        vehicle.driverName,
        vehicle.driverPhone,
      ].some(value => String(value || '').toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === 'All' || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const registration = form.vehicleNumber.trim().toUpperCase();

    if (!registration || !form.capacity || !form.driverName.trim()) {
      setMessage('Please fill in all required fields.');
      return;
    }

    const duplicate = vehicles.some(vehicle =>
      vehicle.vehicleNumber.toUpperCase() === registration &&
      vehicle.id !== editingId
    );

    if (duplicate) {
      setMessage('This vehicle registration number already exists.');
      return;
    }

    const vehicleData = {
      ...form,
      vehicleNumber: registration,
      capacity: Number(form.capacity),
      driverName: form.driverName.trim(),
      driverPhone: form.driverPhone.trim(),
      updatedAt: new Date().toISOString(),
    };

    let updatedVehicles;

    if (editingId) {
      updatedVehicles = vehicles.map(vehicle =>
        vehicle.id === editingId
          ? { ...vehicle, ...vehicleData }
          : vehicle
      );
      setMessage('Vehicle updated successfully.');
    } else {
      updatedVehicles = [
        {
          ...vehicleData,
          id: `vehicle-${Date.now()}`,
          ownerEmail: userEmail,
          createdAt: new Date().toISOString(),
        },
        ...vehicles,
      ];
      setMessage('Vehicle added successfully.');
    }

    persistVehicles(updatedVehicles);
    resetForm();
  };

  const handleEdit = (vehicle) => {
    setForm({
      vehicleNumber: vehicle.vehicleNumber || '',
      vehicleType: vehicle.vehicleType || 'Truck',
      capacity: String(vehicle.capacity || ''),
      driverName: vehicle.driverName || '',
      driverPhone: vehicle.driverPhone || '',
      status: vehicle.status || 'Available',
    });

    setEditingId(vehicle.id);
    setShowForm(true);
    setMessage('');
  };

  const handleDelete = (vehicleId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this vehicle?'
    );

    if (!confirmed) return;

    persistVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
    setMessage('Vehicle deleted successfully.');
  };

  const handleStatusChange = (vehicleId, status) => {
    const updatedVehicles = vehicles.map(vehicle =>
      vehicle.id === vehicleId
        ? { ...vehicle, status, updatedAt: new Date().toISOString() }
        : vehicle
    );

    persistVehicles(updatedVehicles);
    setMessage('Vehicle status updated.');
  };

  const availableCount = vehicles.filter(
    vehicle => vehicle.status === 'Available'
  ).length;

  const assignedCount = vehicles.filter(
    vehicle => vehicle.status === 'Assigned'
  ).length;

  const maintenanceCount = vehicles.filter(
    vehicle => vehicle.status === 'Maintenance'
  ).length;

  return (
    <div className="vm-page">
      <div className="vm-header">
        <div>
          <button className="vm-back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <p className="vm-eyebrow">LOGISTICS MANAGEMENT</p>
          <h1>Vehicle Management</h1>
          <p className="vm-subtitle">
            Manage your fleet, driver details and vehicle availability.
          </p>
        </div>

        <button
          className="vm-primary-btn"
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditingId(null);
            setShowForm(true);
            setMessage('');
          }}
        >
          + Add Vehicle
        </button>
      </div>

      {message && (
        <div className="vm-message" role="status">
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      <div className="vm-stats">
        <div className="vm-stat-card">
          <span>Total Vehicles</span>
          <strong>{vehicles.length}</strong>
        </div>
        <div className="vm-stat-card">
          <span>Available</span>
          <strong>{availableCount}</strong>
        </div>
        <div className="vm-stat-card">
          <span>Assigned</span>
          <strong>{assignedCount}</strong>
        </div>
        <div className="vm-stat-card">
          <span>In Maintenance</span>
          <strong>{maintenanceCount}</strong>
        </div>
      </div>

      {showForm && (
        <section className="vm-form-card">
          <div className="vm-section-heading">
            <div>
              <h2>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <p>Enter the vehicle and driver information.</p>
            </div>
            <button className="vm-close-btn" onClick={resetForm}>×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="vm-form-grid">
              <label>
                Vehicle Registration Number *
                <input
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={updateField}
                  placeholder="e.g. UP21 AB 1234"
                  required
                />
              </label>

              <label>
                Vehicle Type *
                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={updateField}
                >
                  <option>Truck</option>
                  <option>Mini Truck</option>
                  <option>Pickup</option>
                  <option>Tractor</option>
                  <option>Van</option>
                  <option>Refrigerated Truck</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Capacity (in kg) *
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={form.capacity}
                  onChange={updateField}
                  placeholder="e.g. 2000"
                  required
                />
              </label>

              <label>
                Driver Name *
                <input
                  name="driverName"
                  value={form.driverName}
                  onChange={updateField}
                  placeholder="Enter driver name"
                  required
                />
              </label>

              <label>
                Driver Phone
                <input
                  type="tel"
                  name="driverPhone"
                  value={form.driverPhone}
                  onChange={updateField}
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Availability Status
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                >
                  <option>Available</option>
                  <option>Assigned</option>
                  <option>Maintenance</option>
                </select>
              </label>
            </div>

            <div className="vm-form-actions">
              <button type="button" className="vm-secondary-btn" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="vm-primary-btn">
                {editingId ? 'Save Changes' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="vm-list-section">
        <div className="vm-section-heading">
          <div>
            <h2>Your Fleet</h2>
            <p>{filteredVehicles.length} vehicle(s) found</p>
          </div>
        </div>

        <div className="vm-toolbar">
          <input
            className="vm-search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search registration, driver or vehicle..."
          />

          <select
            className="vm-filter"
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
          >
            <option>All</option>
            <option>Available</option>
            <option>Assigned</option>
            <option>Maintenance</option>
          </select>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="vm-empty">
            <div className="vm-empty-icon">🚚</div>
            <h3>No vehicles found</h3>
            <p>Add a vehicle to start managing your logistics fleet.</p>
            <button
              className="vm-primary-btn"
              onClick={() => setShowForm(true)}
            >
              + Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="vm-vehicle-grid">
            {filteredVehicles.map(vehicle => (
              <article className="vm-vehicle-card" key={vehicle.id}>
                <div className="vm-vehicle-top">
                  <div className="vm-vehicle-icon">🚚</div>
                  <span className={`vm-status vm-status-${vehicle.status.toLowerCase()}`}>
                    {vehicle.status}
                  </span>
                </div>

                <h3>{vehicle.vehicleNumber}</h3>
                <p className="vm-vehicle-type">{vehicle.vehicleType}</p>

                <div className="vm-vehicle-details">
                  <div>
                    <span>Capacity</span>
                    <strong>{Number(vehicle.capacity).toLocaleString('en-IN')} kg</strong>
                  </div>
                  <div>
                    <span>Driver</span>
                    <strong>{vehicle.driverName}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{vehicle.driverPhone || 'Not provided'}</strong>
                  </div>
                </div>

                <div className="vm-card-status">
                  <label htmlFor={`status-${vehicle.id}`}>Update status</label>
                  <select
                    id={`status-${vehicle.id}`}
                    value={vehicle.status}
                    onChange={event =>
                      handleStatusChange(vehicle.id, event.target.value)
                    }
                  >
                    <option>Available</option>
                    <option>Assigned</option>
                    <option>Maintenance</option>
                  </select>
                </div>

                <div className="vm-card-actions">
                  <button
                    className="vm-secondary-btn"
                    onClick={() => handleEdit(vehicle)}
                  >
                    Edit
                  </button>
                  <button
                    className="vm-delete-btn"
                    onClick={() => handleDelete(vehicle.id)}
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
  );
}
