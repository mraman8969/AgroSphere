
import React, { useEffect, useMemo, useState } from 'react';

import {
  getAllOrders,
  saveAllOrders,
  saveUserCart,
  getAllProducts
} from './marketplaceStorage';

const formatPrice = (amount) =>
  Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2
  });

const Checkout = ({
  cart = [],
  userKey,
  profile,
  onBack,
  onOrderPlaced
}) => {
  // Use the same buyer key as SavedAddresses
  const buyerKey = String(
    userKey || profile?.email || profile?.id || profile?.userId || 'guest'
  ).toLowerCase();

  const addressStorageKey = `agrosphere_saved_addresses_${buyerKey}`;

  // Load saved addresses
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const result = JSON.parse(
        localStorage.getItem(addressStorageKey)
      );

      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  });

  // Select default address automatically
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      const addresses = JSON.parse(
        localStorage.getItem(addressStorageKey)
      ) || [];

      return addresses.find(item => item.isDefault)?.id || '';
    } catch {
      return '';
    }
  });

  const [formData, setFormData] = useState({
    buyerName: profile?.fullName || profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
    landmark: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load current product inventory
  const products = useMemo(() => {
    try {
      const result = getAllProducts();
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.error('Unable to load products:', err);
      return [];
    }
  }, []);

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // Refresh saved addresses when Checkout mounts
  useEffect(() => {
    try {
      const result = JSON.parse(
        localStorage.getItem(addressStorageKey)
      );

      const addresses = Array.isArray(result) ? result : [];

      setSavedAddresses(addresses);

      const defaultAddress = addresses.find(item => item.isDefault);

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch {
      setSavedAddresses([]);
    }
  }, [addressStorageKey]);

  // Apply selected saved address
  useEffect(() => {
    const selected = savedAddresses.find(
      item => String(item.id) === String(selectedAddressId)
    );

    if (!selected) return;

    setFormData(previous => ({
      ...previous,
      buyerName: selected.fullName || previous.buyerName,
      phone: selected.phone || previous.phone,
      address: selected.address || '',
      city: selected.city || '',
      state: selected.state || '',
      pincode: selected.pincode || '',
      landmark: selected.landmark || ''
    }));

    setError('');
  }, [selectedAddressId, savedAddresses]);

  // Handle selecting a saved address or entering a new one
  const handleAddressSelection = (e) => {
    const addressId = e.target.value;

    setSelectedAddressId(addressId);

    if (!addressId) {
      setFormData(previous => ({
        ...previous,
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      }));
    }
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(previous => ({
      ...previous,
      [name]: value
    }));

    setError('');
  };

  // Check current product stock
  const validateStock = () => {
    for (const item of cart) {
      const product = products.find(
        product =>
          String(
            product.id ?? product.productId ?? product._id
          ) === String(item.productId)
      );

      if (!product) continue;

      const stock =
        product.stock ??
        product.quantity ??
        product.availableQuantity;

      if (stock !== undefined && stock !== null && stock !== '') {
        if (Number(stock) <= 0) {
          return `${item.name} is currently out of stock.`;
        }

        if (Number(item.quantity) > Number(stock)) {
          return `Only ${stock} units of ${item.name} are currently available.`;
        }
      }
    }

    return '';
  };

  // Place order
  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setError('');

    if (!cart.length) {
      setError('Your cart is empty.');
      return;
    }

    // Validate delivery information
    if (
      !formData.buyerName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      setError('Please fill in all required delivery details.');
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setError('Please enter a valid 6-digit PIN code.');
      return;
    }

    // Validate cart items
    const invalidItem = cart.find(
      item =>
        !item.productId ||
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) < 0 ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
    );

    if (invalidItem) {
      setError(
        'Your cart contains an invalid product or quantity. Please review your cart.'
      );
      return;
    }

    // Validate inventory
    const stockError = validateStock();

    if (stockError) {
      setError(stockError);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const order = {
        id: orderId,
        orderNumber: `AGRO-${Date.now()}`,

        buyerKey,
        buyerName: formData.buyerName.trim(),
        buyerEmail: formData.email.trim().toLowerCase(),
        buyerPhone: formData.phone.trim(),

        deliveryAddress: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          landmark: formData.landmark.trim()
        },

        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          unit: item.unit || 'unit',
          farmerName: item.farmerName || '',
          farmerEmail: item.farmerEmail || '',
          imageUrl: item.imageUrl || '',
          status: 'Pending'
        })),

        subtotal,
        totalAmount: subtotal,
        paymentMethod: 'Payment on confirmation',
        paymentStatus: 'Pending',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      const existingOrders = getAllOrders();

      if (!Array.isArray(existingOrders)) {
        throw new Error('Unable to retrieve existing orders.');
      }

      saveAllOrders([
        order,
        ...existingOrders
      ]);

      // Clear buyer cart after saving order
      saveUserCart(buyerKey, []);

      onOrderPlaced(order);

    } catch (err) {
      console.error('Order placement failed:', err);

      setError(
        'Unable to place your order right now. Please try again.'
      );

      setIsSubmitting(false);
    }
  };

  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">

        {/* Header */}
        <div className="mb-4">
          <button
            type="button"
            className="btn-dark-glass-secondary mb-3"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Cart
          </button>

          <span className="text-success small fw-bold">
            COMPLETE YOUR PURCHASE
          </span>

          <h3 className="mt-1">Checkout</h3>

          <p className="text-secondary">
            Select your delivery address and confirm your order.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="row g-4">

            {/* Delivery Information */}
            <div className="col-lg-7">
              <div className="card shadow-sm">
                <div className="card-body p-4">

                  <h5 className="mb-4">
                    <i className="fas fa-map-marker-alt me-2 text-success"></i>
                    Delivery Information
                  </h5>

                  {/* Saved Address Selector */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Choose a Saved Address
                      </label>

                      <select
                        className="form-select"
                        value={selectedAddressId}
                        onChange={handleAddressSelection}
                      >
                        <option value="">
                          Enter a new address
                        </option>

                        {savedAddresses.map(address => (
                          <option
                            key={address.id}
                            value={address.id}
                          >
                            {address.label} — {address.city}, {address.pincode}
                            {address.isDefault ? ' (Default)' : ''}
                          </option>
                        ))}
                      </select>

                      <p className="small text-secondary mt-2 mb-0">
                        Select a saved address to automatically fill in your delivery details.
                      </p>
                    </div>
                  )}

                  {savedAddresses.length === 0 && (
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      No saved addresses found. Enter your delivery details below.
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Buyer Name */}
                  <div className="mb-3">
                    <label className="form-label">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="buyerName"
                      className="form-control"
                      value={formData.buyerName}
                      onChange={handleChange}
                      maxLength={100}
                      required
                    />
                  </div>

                  {/* Email and Phone */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Email *
                      </label>

                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Phone Number *
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        inputMode="numeric"
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-3">
                    <label className="form-label">
                      Delivery Address *
                    </label>

                    <textarea
                      name="address"
                      className="form-control"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House number, street, area..."
                      maxLength={300}
                      required
                    />
                  </div>

                  {/* Landmark */}
                  <div className="mb-3">
                    <label className="form-label">
                      Landmark
                    </label>

                    <input
                      type="text"
                      name="landmark"
                      className="form-control"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="Nearby landmark (optional)"
                      maxLength={150}
                    />
                  </div>

                  {/* City, State and PIN */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        City *
                      </label>

                      <input
                        type="text"
                        name="city"
                        className="form-control"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        State *
                      </label>

                      <input
                        type="text"
                        name="state"
                        className="form-control"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        PIN Code *
                      </label>

                      <input
                        type="text"
                        name="pincode"
                        className="form-control"
                        value={formData.pincode}
                        onChange={handleChange}
                        maxLength={6}
                        inputMode="numeric"
                        required
                      />
                    </div>
                  </div>

                  <p className="small text-secondary mb-0">
                    * Required delivery information.
                  </p>

                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body p-4">

                  <h5 className="mb-4">
                    Order Summary
                  </h5>

                  {cart.map(item => (
                    <div
                      key={item.productId}
                      className="d-flex justify-content-between gap-3 mb-3"
                    >
                      <div>
                        <strong>
                          {item.name || 'Unnamed Product'}
                        </strong>

                        <p className="small text-secondary mb-0">
                          {item.quantity} {item.unit || 'unit'} × ₹
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {formatPrice(
                          Number(item.price) * Number(item.quantity)
                        )}
                      </strong>
                    </div>
                  ))}

                  <hr />

                  <div className="d-flex justify-content-between mb-3">
                    <span>Total Items</span>

                    <strong>
                      {cart.reduce(
                        (total, item) =>
                          total + Number(item.quantity || 0),
                        0
                      )}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span>Subtotal</span>

                    <strong>
                      ₹{formatPrice(subtotal)}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span>Delivery Charges</span>
                    <span>To be confirmed</span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between mb-4">
                    <strong>Total Amount</strong>

                    <strong className="text-success fs-5">
                      ₹{formatPrice(subtotal)}
                    </strong>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={cart.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i>
                        Confirm & Place Order
                      </>
                    )}
                  </button>

                  <p className="small text-secondary text-center mt-3 mb-0">
                    Online payment is not integrated in this demo.
                  </p>

                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
