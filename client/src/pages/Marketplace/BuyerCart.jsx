
import React, { useMemo, useState } from 'react';
import {
  getUserCart,
  saveUserCart,
  getAllProducts
} from './marketplaceStorage';

const formatPrice = (amount) =>
  Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2
  });

const BuyerCart = ({ userKey, onBack, onCheckout }) => {
  const [cart, setCart] = useState(() => {
    try {
      const result = getUserCart(userKey);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Unable to load cart:', error);
      return [];
    }
  });

  const products = useMemo(() => {
    try {
      const result = getAllProducts();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Unable to load product inventory:', error);
      return [];
    }
  }, []);

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    saveUserCart(userKey, updatedCart);
  };

  const getAvailableStock = (item) => {
    const product = products.find(
      (product) =>
        String(product.id ?? product.productId ?? product._id) ===
        String(item.productId)
    );

    if (!product) return null;

    const stock = product.stock ?? product.quantity ?? product.availableQuantity;

    if (stock === undefined || stock === null || stock === '') {
      return null;
    }

    return Number(stock);
  };

  const increaseQuantity = (productId) => {
    const item = cart.find(
      (item) => String(item.productId) === String(productId)
    );

    if (!item) return;

    const availableStock = getAvailableStock(item);

    if (
      availableStock !== null &&
      Number(item.quantity || 0) >= availableStock
    ) {
      window.alert('You have reached the available stock limit.');
      return;
    }

    const updatedCart = cart.map((item) =>
      String(item.productId) === String(productId)
        ? { ...item, quantity: Number(item.quantity || 0) + 1 }
        : item
    );

    updateCart(updatedCart);
  };

  const decreaseQuantity = (productId) => {
    const updatedCart = cart
      .map((item) =>
        String(item.productId) === String(productId)
          ? { ...item, quantity: Number(item.quantity || 0) - 1 }
          : item
      )
      .filter((item) => Number(item.quantity) > 0);

    updateCart(updatedCart);
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(
      (item) => String(item.productId) !== String(productId)
    );

    updateCart(updatedCart);
  };

  const clearCart = () => {
    if (!window.confirm('Are you sure you want to remove all items?')) {
      return;
    }

    updateCart([]);
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const hasOutOfStockItems = cart.some((item) => {
    const stock = getAvailableStock(item);
    return stock !== null && stock <= 0;
  });

  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <span className="text-success small fw-bold">
              YOUR SHOPPING BAG
            </span>
            <h3 className="mt-1">My Cart</h3>
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

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="fas fa-shopping-basket fa-3x text-secondary"></i>
            </div>

            <h5>Your cart is empty</h5>

            <p className="text-secondary">
              Discover fresh products directly from farmers.
            </p>

            <button
              type="button"
              className="btn btn-success px-4"
              onClick={onBack}
            >
              <i className="fas fa-store me-2"></i>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Cart Overview */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <h5 className="mb-1">Cart Items ({cart.length})</h5>
                <span className="text-secondary small">
                  {totalItems} total units selected
                </span>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={clearCart}
              >
                <i className="fas fa-trash me-2"></i>
                Clear Cart
              </button>
            </div>

            <div className="row g-4">

              {/* Cart Products */}
              <div className="col-lg-8">
                {cart.map((item) => {
                  const availableStock = getAvailableStock(item);

                  const outOfStock =
                    availableStock !== null && availableStock <= 0;

                  const stockLimitReached =
                    availableStock !== null &&
                    Number(item.quantity || 0) >= availableStock;

                  return (
                    <div
                      key={item.productId}
                      className="card mb-3 shadow-sm"
                    >
                      <div className="card-body">
                        <div className="d-flex flex-wrap align-items-center gap-3">

                          {/* Product Image */}
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

                          {/* Product Details */}
                          <div className="flex-grow-1">
                            <h5 className="mb-1">
                              {item.name || 'Unnamed Product'}
                            </h5>

                            <p className="text-secondary small mb-1">
                              Farmer: {item.farmerName || 'Not specified'}
                            </p>

                            <strong>
                              ₹{formatPrice(item.price)} / {item.unit || 'unit'}
                            </strong>

                            {outOfStock && (
                              <div className="text-danger small mt-1">
                                Out of stock
                              </div>
                            )}

                            {stockLimitReached && !outOfStock && (
                              <div className="text-warning small mt-1">
                                Maximum available quantity reached
                              </div>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => decreaseQuantity(item.productId)}
                              aria-label={`Decrease ${item.name} quantity`}
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
                              disabled={stockLimitReached || outOfStock}
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeItem(item.productId)}
                            aria-label={`Remove ${item.name}`}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        <div className="text-end mt-3">
                          <strong>
                            Item Total: ₹
                            {formatPrice(
                              Number(item.price || 0) *
                              Number(item.quantity || 0)
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="mb-3">Order Summary</h5>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Items</span>
                      <span>{totalItems}</span>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                      <span>Subtotal</span>
                      <strong>₹{formatPrice(subtotal)}</strong>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total</strong>
                      <strong className="text-success">
                        ₹{formatPrice(subtotal)}
                      </strong>
                    </div>

                    <p className="text-secondary small">
                      Delivery charges, if applicable, will be confirmed later.
                    </p>

                    {hasOutOfStockItems && (
                      <p className="text-danger small">
                        Please remove out-of-stock items before checkout.
                      </p>
                    )}

                    <button
                      type="button"
                      className="btn btn-success w-100"
                      disabled={hasOutOfStockItems}
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
