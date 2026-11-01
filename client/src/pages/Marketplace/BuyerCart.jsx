
import React, { useState } from 'react';
import {
  getUserCart,
  saveUserCart
} from './marketplaceStorage';

const BuyerCart = ({ userKey, onBack, onCheckout }) => {
  const [cart, setCart] = useState(() => getUserCart(userKey));

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    saveUserCart(userKey, updatedCart);
  };

  const increaseQuantity = (productId) => {
    const updatedCart = cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    updateCart(updatedCart);
  };

  const decreaseQuantity = (productId) => {
    const updatedCart = cart
      .map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter(item => item.quantity > 0);

    updateCart(updatedCart);
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(
      item => item.productId !== productId
    );

    updateCart(updatedCart);
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3>My Cart</h3>
            <p className="text-secondary mb-0">
              Review your selected agricultural products.
            </p>
          </div>

          <button
            type="button"
            className="btn-dark-glass-secondary"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Continue Shopping
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-shopping-cart fa-3x text-secondary mb-3"></i>
            <h5>Your cart is empty</h5>
            <p className="text-secondary">
              Browse products and add items to your cart.
            </p>
            <button
              type="button"
              className="btn btn-success"
              onClick={onBack}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="row g-4">
              <div className="col-lg-8">
                {cart.map(item => (
                  <div
                    key={item.productId}
                    className="card mb-3 shadow-sm"
                  >
                    <div className="card-body">
                      <div className="d-flex flex-wrap align-items-center gap-3">

                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{
                              width: '90px',
                              height: '90px',
                              objectFit: 'cover',
                              borderRadius: '10px'
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center bg-light"
                            style={{
                              width: '90px',
                              height: '90px',
                              borderRadius: '10px'
                            }}
                          >
                            <i className="fas fa-seedling fa-2x text-success"></i>
                          </div>
                        )}

                        <div className="flex-grow-1">
                          <h5 className="mb-1">{item.name}</h5>
                          <p className="text-secondary small mb-1">
                            Farmer: {item.farmerName}
                          </p>
                          <strong>
                            ₹{Number(item.price).toLocaleString('en-IN')} / kg
                          </strong>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => decreaseQuantity(item.productId)}
                          >
                            −
                          </button>

                          <span className="fw-bold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => increaseQuantity(item.productId)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeItem(item.productId)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>

                      </div>

                      <div className="text-end mt-3">
                        <strong>
                          Item Total: ₹{(
                            Number(item.price) * Number(item.quantity)
                          ).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="mb-3">Order Summary</h5>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Items</span>
                      <span>
                        {cart.reduce(
                          (total, item) => total + item.quantity,
                          0
                        )}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                      <span>Subtotal</span>
                      <strong>
                        ₹{subtotal.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total</strong>
                      <strong className="text-success">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <p className="text-secondary small">
                      Delivery charges, if applicable, will be confirmed later.
                    </p>

                    <button
                      type="button"
                      className="btn btn-success w-100"
                      onClick={() => onCheckout(cart)}
                    >
                      Proceed to Checkout
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default BuyerCart;
