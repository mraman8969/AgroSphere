
import React from 'react';

const formatPrice = (amount) =>
  Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });

const formatDate = (date) => {
  if (!date) return 'Just now';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return 'Just now';

  return parsedDate.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const OrderConfirmation = ({
  order,
  onContinueShopping,
  onViewOrders,
}) => {
  if (!order) {
    return (
      <main className="marketplace-dashboard">
        <div className="container py-5 text-center">
          <h4>Order details not available</h4>
          <p className="text-secondary">
            We couldn't find the details of your order.
          </p>

          <button
            type="button"
            className="btn btn-success"
            onClick={onContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  const address = order.deliveryAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">

        {/* Success Header */}
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 76,
              height: 76,
              background: 'rgba(25, 135, 84, 0.12)',
              color: '#198754',
              fontSize: 36,
            }}
          >
            <i className="fas fa-check-circle"></i>
          </div>

          <span className="text-success fw-bold small">
            ORDER PLACED SUCCESSFULLY
          </span>

          <h2 className="mt-2">Thank you for your order!</h2>

          <p className="text-secondary">
            Your order has been received. You can track its status from My Orders.
          </p>
        </div>

        {/* Order Reference */}
        <div className="card shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-4">
                <span className="text-secondary small">Order Number</span>
                <h5 className="mt-1 mb-0">
                  {order.orderNumber || order.id}
                </h5>
              </div>

              <div className="col-md-4">
                <span className="text-secondary small">Order Date</span>
                <h6 className="mt-2 mb-0">
                  {formatDate(order.createdAt)}
                </h6>
              </div>

              <div className="col-md-4">
                <span className="text-secondary small">Order Status</span>
                <div className="mt-2">
                  <span className="badge bg-warning text-dark">
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">

          {/* Ordered Products */}
          <div className="col-lg-7">
            <div className="card shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="mb-4">
                  <i className="fas fa-shopping-basket me-2 text-success"></i>
                  Ordered Products
                </h5>

                {items.length === 0 ? (
                  <p className="text-secondary">
                    No product details are available.
                  </p>
                ) : (
                  items.map((item, index) => (
                    <div
                      key={item.productId || index}
                      className="d-flex align-items-center justify-content-between gap-3 py-3 border-bottom"
                    >
                      <div className="d-flex align-items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name || 'Product'}
                            style={{
                              width: 64,
                              height: 64,
                              objectFit: 'cover',
                              borderRadius: 10,
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center rounded"
                            style={{
                              width: 64,
                              height: 64,
                              background: 'rgba(128,128,128,0.12)',
                            }}
                          >
                            <i className="fas fa-leaf text-success fs-4"></i>
                          </div>
                        )}

                        <div>
                          <h6 className="mb-1">
                            {item.name || 'Product'}
                          </h6>

                          <small className="text-secondary">
                            {item.quantity} {item.unit || 'unit'} × ₹
                            {formatPrice(item.price)}
                          </small>
                        </div>
                      </div>

                      <strong className="text-nowrap">
                        ₹
                        {formatPrice(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        )}
                      </strong>
                    </div>
                  ))
                )}

                <div className="d-flex justify-content-between mt-4">
                  <span className="text-secondary">Subtotal</span>
                  <strong>
                    ₹{formatPrice(order.subtotal ?? order.totalAmount)}
                  </strong>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <span className="text-secondary">Total Amount</span>
                  <strong className="text-success fs-5">
                    ₹{formatPrice(order.totalAmount)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery and Payment */}
          <div className="col-lg-5">
            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="mb-3">
                  <i className="fas fa-map-marker-alt me-2 text-success"></i>
                  Delivery Address
                </h5>

                <strong>{order.buyerName || 'Customer'}</strong>

                <p className="text-secondary mt-2 mb-1">
                  {address.address}
                </p>

                <p className="text-secondary mb-1">
                  {[
                    address.city,
                    address.state,
                    address.pincode,
                  ].filter(Boolean).join(', ')}
                </p>

                {address.landmark && (
                  <p className="text-secondary small mb-2">
                    Landmark: {address.landmark}
                  </p>
                )}

                {order.buyerPhone && (
                  <p className="mb-0">
                    <i className="fas fa-phone me-2 text-success"></i>
                    {order.buyerPhone}
                  </p>
                )}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h5 className="mb-3">
                  <i className="fas fa-credit-card me-2 text-success"></i>
                  Payment Information
                </h5>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Payment Method</span>
                  <strong>{order.paymentMethod || 'Not specified'}</strong>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Payment Status</span>
                  <span className="badge bg-warning text-dark">
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>

                <p className="small text-secondary mt-3 mb-0">
                  Payment processing is not integrated in this demo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <button
            type="button"
            className="btn btn-success px-4"
            onClick={onViewOrders}
          >
            <i className="fas fa-box me-2"></i>
            View My Orders
          </button>

          <button
            type="button"
            className="btn btn-outline-success px-4"
            onClick={onContinueShopping}
          >
            <i className="fas fa-shopping-bag me-2"></i>
            Continue Shopping
          </button>
        </div>

      </div>
    </main>
  );
};

export default OrderConfirmation;
