
import React, { useState } from 'react';
import {
  getAllOrders,
  saveAllOrders,
  saveUserCart
} from './marketplaceStorage';

const Checkout = ({
  cart,
  userKey,
  profile,
  onBack,
  onOrderPlaced
}) => {
  const [formData, setFormData] = useState({
    buyerName: profile?.fullName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pincode: profile?.pincode || ''
  });

  const [error, setError] = useState('');

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(previous => ({
      ...previous,
      [name]: value
    }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.buyerName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.pincode.trim()
    ) {
      setError('Please fill in all delivery details.');
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

    if (!cart || cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const order = {
      id: crypto.randomUUID(),
      orderNumber: `AGRO-${Date.now()}`,
      buyerKey: userKey,
      buyerName: formData.buyerName.trim(),
      buyerEmail: formData.email.trim().toLowerCase(),
      buyerPhone: formData.phone.trim(),
      deliveryAddress: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim()
      },
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        farmerName: item.farmerName,
        farmerEmail: item.farmerEmail,
        imageUrl: item.imageUrl || '',
        status: 'Pending'
      })),
      subtotal,
      totalAmount: subtotal,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const existingOrders = getAllOrders();

    saveAllOrders([
      order,
      ...existingOrders
    ]);

    saveUserCart(userKey, []);

    onOrderPlaced(order);
  };

  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">

        <div className="mb-4">
          <button
            type="button"
            className="btn-dark-glass-secondary mb-3"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Cart
          </button>

          <h3>Checkout</h3>
          <p className="text-secondary">
            Enter your delivery details and confirm your order.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="row g-4">

            <div className="col-lg-7">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <h5 className="mb-4">
                    <i className="fas fa-map-marker-alt me-2 text-success"></i>
                    Delivery Information
                  </h5>

                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="buyerName"
                      className="form-control"
                      value={formData.buyerName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
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
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Delivery Address</label>
                    <textarea
                      name="address"
                      className="form-control"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House number, street, area..."
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">City</label>
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
                      <label className="form-label">PIN Code</label>
                      <input
                        type="text"
                        name="pincode"
                        className="form-control"
                        value={formData.pincode}
                        onChange={handleChange}
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <h5 className="mb-4">Order Summary</h5>

                  {cart.map(item => (
                    <div
                      key={item.productId}
                      className="d-flex justify-content-between gap-3 mb-3"
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <p className="small text-secondary mb-0">
                          {item.quantity} kg × ₹{item.price}
                        </p>
                      </div>

                      <strong>
                        ₹{(
                          Number(item.price) * Number(item.quantity)
                        ).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  ))}

                  <hr />

                  <div className="d-flex justify-content-between mb-3">
                    <span>Subtotal</span>
                    <strong>
                      ₹{subtotal.toLocaleString('en-IN')}
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
                      ₹{subtotal.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={cart.length === 0}
                  >
                    <i className="fas fa-check-circle me-2"></i>
                    Confirm & Place Order
                  </button>

                  <p className="small text-secondary text-center mt-3 mb-0">
                    Payment is not integrated in this demo.
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
